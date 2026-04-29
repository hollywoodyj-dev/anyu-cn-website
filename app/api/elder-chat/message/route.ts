import { NextResponse, type NextRequest } from "next/server";
import {
  appendTurn,
  getRecentTurns,
} from "@/lib/elder-agent/conversationContext";
import {
  buildActiveThread,
  extractCurrentAnchors,
  type ActiveThread,
} from "@/lib/elder-agent/activeThread";
import {
  detectConversationState,
  normalizeInputText,
  type DialogueState,
} from "@/lib/elder-agent/conversationStateEngine";
import { analyzeConversationState } from "@/lib/elder-agent/conversationStateAnalyzer";
import { continuityGuard } from "@/lib/elder-agent/continuityGuard";
import { detectIndirectExpression } from "@/lib/elder-agent/indirectExpression";
import { buildMultiturnPrompt } from "@/lib/elder-agent/multiturnPromptBuilder";
import { repetitionGuard } from "@/lib/elder-agent/repetitionGuard";
import { resolveAnYuStyle } from "@/lib/elder-agent/styleRouter";
import { scoreTurnContinuity } from "@/lib/elder-agent/turnContinuityScorer";
import {
  OpenAIChatUpstreamError,
  createStaticAssistantSseStream,
  runElderChatTurn,
  safeAssistantFallback,
} from "@/lib/anyu/openai-chat";
import { getPromptVersion } from "@/lib/anyu/prompts";
import {
  getIndirectFallbackByStyle,
  getStateFallbackByStyle,
  getV5StateResponseByStyle,
} from "@/lib/anyu-response/householdFallbacks";
import { checkHouseholdStyle } from "@/lib/anyu-response/householdStyle";
import { guardAnYuResponse } from "@/lib/anyu-response/responseGuard";
import type { AnYuMode } from "@/lib/anyu-response/householdStyle";
import { getRiskBlockedAssistantMessage, isRiskChatBlocked } from "@/lib/anyu/risk/blocked-reply";
import { evaluateRiskText } from "@/lib/anyu/risk/evaluate";

export const runtime = "nodejs";

const RISK_GATE_MODEL = "risk_gate" as const;

type Body = {
  session_id?: unknown;
  message?: unknown;
  lang?: unknown;
  style?: unknown;
  /** `true` 时返回 SSE（与 `Accept: text/event-stream` 二选一或同时用） */
  stream?: unknown;
  turn_index?: unknown;
  asr_confidence?: unknown;
};

const memoryTurnCounter = new Map<string, number>();

function wantsSse(req: NextRequest, body: Body): boolean {
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/event-stream")) return true;
  return body.stream === true;
}

function baseMeta(turnId: string, lang: string, model: string, extra?: Record<string, unknown>) {
  return {
    model,
    prompt_version: getPromptVersion(),
    timestamp: new Date().toISOString(),
    turn_id: turnId,
    lang,
    ...extra,
  };
}

function routeMode(message: string): AnYuMode {
  if (message.includes("怎么说") || message.includes("换一种说法")) {
    return "communication_reframe";
  }
  if (message.includes("帮我发") || message.includes("发给")) {
    return "family_message";
  }
  return "emotional_listening";
}

function modeFromState(state: DialogueState): AnYuMode {
  if (state === "family") return "family_message";
  if (state === "casual" || state === "story" || state === "confused" || state === "health") {
    return "supportive_response";
  }
  return "emotional_listening";
}

function resolveTurnIndex(sessionId: string | null, rawTurnIndex: unknown): number {
  if (typeof rawTurnIndex === "number" && Number.isFinite(rawTurnIndex) && rawTurnIndex >= 1) {
    return Math.floor(rawTurnIndex);
  }
  if (sessionId) {
    const next = (memoryTurnCounter.get(sessionId) ?? 0) + 1;
    memoryTurnCounter.set(sessionId, next);
    return next;
  }
  return 1;
}

function requiresReturnQuestion(mode: AnYuMode, riskLevel: "L0" | "L1" | "L2" | "L3" | "L4"): boolean {
  const lowRisk = riskLevel === "L0" || riskLevel === "L1" || riskLevel === "L2";
  return lowRisk && (mode === "emotional_listening" || mode === "supportive_response");
}

function textSeed(text: string): number {
  return [...text].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function pickStateFallbackNoLoop(
  dialogueState: DialogueState,
  style: "mandarin_gentle" | "cantonese_chat",
  baseSeed: number,
  recentAssistantResponses: string[],
  contextText: string,
): string {
  const attemptSeeds = [baseSeed, baseSeed + 3, baseSeed + 7];
  for (const seed of attemptSeeds) {
    const candidate = getV5StateResponseByStyle(dialogueState, style, contextText, seed);
    if (!repetitionGuard(candidate, recentAssistantResponses).blocked) return candidate;
  }
  if (style === "cantonese_chat") {
    return "你讲到呢句，我听到你真係唔易。\n你想先讲边一句最顶住你？";
  }
  return "你这句我听到了，确实不轻。\n你想先把最难受的那一下说出来吗？";
}

function needsV5Correction(input: {
  state: DialogueState;
  userText: string;
  response: string;
}): boolean {
  const u = input.userText;
  const r = input.response;
  const negative = /没人|冇人|无聊|孤单|唔开心|不舒服|难受|挂念|挂住|生气|火大/.test(u);
  const positiveDrift = /那挺好|听起来不错|几好啊/.test(r);
  if (negative && positiveDrift) return true;
  if ((input.state === "emotional" || input.state === "family") && !/[？?]/.test(r)) return true;
  if (input.state === "story" && /(难受|堵|顶住|頂住)/.test(r)) return true;
  return false;
}

/**
 * POST /api/elder-chat/message — P0（ANYU_Voice_OpenAI_STT_Implementation_Spec §4.2）
 * Step 7：**先** `evaluateRiskText`；L3/L4 **不调 OpenAI**，返回安全引导（JSON 与 SSE 形态一致）。
 * 流式：`Accept: text/event-stream` 或 JSON `"stream": true`。
 */
export async function POST(req: NextRequest) {
  const turnId = crypto.randomUUID();

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "`message` must be a non-empty string" }, { status: 400 });
  }

  const message = body.message.trim();
  const normalizedInput = normalizeInputText(message);
  const lang =
    typeof body.lang === "string" && body.lang.trim() ? body.lang.trim() : "zh";

  const sessionId =
    typeof body.session_id === "string" && body.session_id.trim() ? body.session_id.trim() : null;

  const conversationId = sessionId ?? crypto.randomUUID();
  const sse = wantsSse(req, body);
  const turnIndex = resolveTurnIndex(sessionId, body.turn_index);
  const style = resolveAnYuStyle({
    explicitStyle: body.style,
    lang,
    message,
  });
  const recentTurns = await getRecentTurns(sessionId);
  const recentHighRiskUserTurn = [...recentTurns]
    .reverse()
    .find((t) => t.role === "user" && (t.riskLevel === "L3" || t.riskLevel === "L4"));
  const asrConfidenceRaw = typeof body.asr_confidence === "number" ? body.asr_confidence : null;

  const risk = evaluateRiskText({
    text: message,
    session_id: sessionId ?? undefined,
  });
  const riskPayload = {
    level: risk.level,
    signals: risk.signals,
    version: risk.version,
  };

  if (isRiskChatBlocked(risk.level)) {
    const assistantMessage = getRiskBlockedAssistantMessage(risk.level);
    await appendTurn(sessionId, {
      role: "user",
      content: message,
      turnIndex,
      riskLevel: risk.level,
      style,
      mode: risk.level === "L4" ? "urgent_alert" : "safety_risk",
    });
    await appendTurn(sessionId, {
      role: "assistant",
      content: assistantMessage,
      turnIndex,
      riskLevel: risk.level,
      style,
      mode: risk.level === "L4" ? "urgent_alert" : "safety_risk",
    });

    if (sse) {
      const stream = createStaticAssistantSseStream({
        turnId,
        conversation_id: conversationId,
        lang,
        modelLabel: RISK_GATE_MODEL,
        prompt_version: getPromptVersion(),
        assistantText: assistantMessage,
        risk: riskPayload,
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    return NextResponse.json({
      assistant_message: assistantMessage,
      conversation_id: conversationId,
      meta: {
        ...baseMeta(turnId, lang, RISK_GATE_MODEL, {
          risk: riskPayload,
          chat_invoked: false,
          household_style_passed: true,
          household_style_reasons: [],
          mode: risk.level === "L4" ? "urgent_alert" : "safety_risk",
          turn_index: turnIndex,
          style,
          continuity: {
            usedRecentTurns: recentTurns.length > 0,
            recentTurnsCount: recentTurns.length,
            detectedThread: "unclear",
            caughtPreviousEmotion: false,
          },
        }),
      },
    });
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Server is not configured for chat (missing OPENAI_API_KEY)." },
      { status: 503 },
    );
  }

  const configuredModel = (process.env.ANYU_OPENAI_CHAT_MODEL ?? "gpt-5.4").trim();
  let dialogueState = detectConversationState({
    text: normalizedInput,
    riskLevel: risk.level,
    asrConfidence: asrConfidenceRaw,
  });
  const mode = routeMode(message);
  const stateDrivenMode = modeFromState(dialogueState);
  const finalMode = mode === "communication_reframe" ? mode : stateDrivenMode;
  const conversationState = analyzeConversationState({
    recentTurns,
    currentMessage: normalizedInput,
    currentRiskLevel: risk.level,
  });
  const activeThread: ActiveThread = buildActiveThread(recentTurns, normalizedInput);
  const currentAnchors = extractCurrentAnchors(normalizedInput);
  if (dialogueState === "casual") {
    if (conversationState.emotionalThread === "missing_family") {
      dialogueState = "family";
    } else if (conversationState.emotionalThread === "health_anxiety") {
      dialogueState = "health";
    } else if (
      conversationState.emotionalThread === "loneliness" ||
      conversationState.emotionalThread === "fear_of_burden"
    ) {
      dialogueState = "emotional";
    }
  }
  const hasRecentRiskCarryover = Boolean(recentHighRiskUserTurn);
  if (
    hasRecentRiskCarryover &&
    dialogueState === "casual" &&
    /没人|冇人|一个人|就剩我|不想活|撑不住|顶不住|頂唔順|好难受|很难受/.test(normalizedInput)
  ) {
    dialogueState = "emotional";
  }
  const indirectSignal = detectIndirectExpression(normalizedInput);

  try {
    const prompt = buildMultiturnPrompt({
      currentMessage: normalizedInput,
      mode: finalMode,
      dialogueState,
      riskLevel: risk.level,
      style,
      recentTurns,
      activeThread,
      conversationState,
      indirectSignal,
      turnIndex,
    });
    const result = await runElderChatTurn({ userMessage: prompt, turnId });
    const guarded = guardAnYuResponse({
      elderMessage: normalizedInput,
      generatedResponse: result.assistantMessage,
      style,
      mode: finalMode,
      riskLevel: risk.level,
      dialogueState,
    });
    const directIndirectHandled = /(忍着|頂住|顶住|陪|问候|有人|係咪|对吗|會唔會|会不会)/.test(
      guarded.response,
    );
    const requireQuestion = requiresReturnQuestion(finalMode, risk.level);
    const indirectHandledText = directIndirectHandled ? guarded.response : getIndirectFallbackByStyle(style);
    let finalResponse = indirectSignal.hasIndirectRestraint ? indirectHandledText : guarded.response;
    let finalStyleCheck = checkHouseholdStyle(finalResponse, style, { requireQuestion });
    if (indirectSignal.hasIndirectRestraint && !finalStyleCheck.pass) {
      finalResponse = getIndirectFallbackByStyle(style);
      finalStyleCheck = checkHouseholdStyle(finalResponse, style, { requireQuestion });
    }
    const recentAssistantResponses = recentTurns
      .filter((t) => t.role === "assistant")
      .map((t) => t.content)
      .slice(-5);
    const repeated = repetitionGuard(finalResponse, recentAssistantResponses);
    if (repeated.blocked) {
      const seed = turnIndex + recentAssistantResponses.length + textSeed(normalizedInput);
      finalResponse = pickStateFallbackNoLoop(
        dialogueState,
        style,
        seed,
        recentAssistantResponses,
        normalizedInput,
      );
      finalStyleCheck = checkHouseholdStyle(finalResponse, style, { requireQuestion });
    }
    const v5CorrectionNeeded = needsV5Correction({
      state: dialogueState,
      userText: normalizedInput,
      response: finalResponse,
    });
    if (v5CorrectionNeeded) {
      const seed = turnIndex + textSeed(normalizedInput);
      finalResponse = getV5StateResponseByStyle(dialogueState, style, normalizedInput, seed);
      finalStyleCheck = checkHouseholdStyle(finalResponse, style, { requireQuestion });
    }
    let continuityCheck = continuityGuard({
      response: finalResponse,
      activeThread,
      currentAnchors,
    });
    if (!continuityCheck.pass) {
      const seed = turnIndex + textSeed(normalizedInput) + 13;
      finalResponse = getV5StateResponseByStyle(dialogueState, style, normalizedInput, seed);
      finalStyleCheck = checkHouseholdStyle(finalResponse, style, { requireQuestion });
      continuityCheck = continuityGuard({
        response: finalResponse,
        activeThread,
        currentAnchors,
      });
    }
    const indirectStrategy = !indirectSignal.hasIndirectRestraint
      ? "none"
      : directIndirectHandled
        ? "model"
        : "fallback";
    const indirectHandled = !indirectSignal.hasIndirectRestraint || indirectStrategy !== "none";
    const continuityScore = scoreTurnContinuity({
      recentTurns,
      currentMessage: normalizedInput,
      assistantResponse: finalResponse,
      state: conversationState,
    });

    await appendTurn(sessionId, {
      role: "user",
      content: normalizedInput,
      turnIndex,
      riskLevel: risk.level,
      style,
      mode: finalMode,
    });
    await appendTurn(sessionId, {
      role: "assistant",
      content: finalResponse,
      turnIndex,
      riskLevel: risk.level,
      style,
      mode: finalMode,
    });

    if (sse) {
      const stream = createStaticAssistantSseStream({
        turnId,
        conversation_id: conversationId,
        lang,
        modelLabel: result.model,
        prompt_version: getPromptVersion(),
        assistantText: finalResponse,
        risk: riskPayload,
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    return NextResponse.json({
      assistant_message: finalResponse,
      conversation_id: conversationId,
      meta: {
        ...baseMeta(turnId, lang, result.model, {
          risk: riskPayload,
          chat_invoked: true,
          household_style_passed: finalStyleCheck.pass,
          household_style_reasons: finalStyleCheck.reasons,
          mode: finalMode,
          turn_index: turnIndex,
          style,
          dialogue_state: dialogueState,
          active_thread: activeThread,
          runtime: {
            userInput: message,
            normalizedInput,
            asrConfidence: asrConfidenceRaw,
            detectedState: dialogueState,
            detectedEmotion: conversationState.emotionalThread,
            riskLevel: risk.level,
            selectedStyle: style,
            selectedMode: finalMode,
            templateId: indirectSignal.hasIndirectRestraint ? "indirect_path" : "model_path",
            response: finalResponse,
            repetitionBlocked: repeated.blocked,
            recentRiskCarryover: hasRecentRiskCarryover,
            v5Corrected: v5CorrectionNeeded,
            continuityGuard: continuityCheck,
            qaResult: finalStyleCheck.pass ? "pass" : "fallback_used",
            failureReason: repeated.reason ?? (finalStyleCheck.pass ? null : "style_guard"),
          },
          continuity: {
            usedRecentTurns: recentTurns.length > 0,
            recentTurnsCount: recentTurns.length,
            detectedThread: conversationState.emotionalThread,
            caughtPreviousEmotion: continuityScore.caughtPreviousEmotion,
            score: continuityScore.score,
            rubric: {
              noAbruptTopicShift: continuityScore.noAbruptTopicShift,
              notOverExplaining: continuityScore.notOverExplaining,
              reasons: continuityScore.reasons,
            },
          },
          indirect_expression: {
            detected: indirectSignal.hasIndirectRestraint,
            matched: indirectSignal.matchedPhrases,
            handled: indirectHandled,
            strategy: indirectStrategy,
          },
        }),
      },
    });
  } catch (err) {
    if (err instanceof OpenAIChatUpstreamError) {
      const fallback = safeAssistantFallback();
      return NextResponse.json(
        {
          assistant_message: fallback,
          conversation_id: conversationId,
          meta: {
            ...baseMeta(turnId, lang, configuredModel, {
              risk: riskPayload,
              upstream_status: err.status,
            }),
          },
          error: "Upstream chat failed",
        },
        { status: 502 },
      );
    }

    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[anyu-elder-chat]", { turn_id: turnId, error: msg });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
