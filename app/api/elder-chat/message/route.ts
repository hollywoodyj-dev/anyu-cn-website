import { NextResponse, type NextRequest } from "next/server";
import {
  OpenAIChatUpstreamError,
  createStaticAssistantSseStream,
  runElderChatTurn,
  safeAssistantFallback,
} from "@/lib/anyu/openai-chat";
import { getPromptVersion } from "@/lib/anyu/prompts";
import { buildHouseholdResponsePrompt } from "@/lib/anyu-response/householdResponsePrompt";
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
  /** `true` 时返回 SSE（与 `Accept: text/event-stream` 二选一或同时用） */
  stream?: unknown;
  turn_index?: unknown;
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
  const lang =
    typeof body.lang === "string" && body.lang.trim() ? body.lang.trim() : "zh";

  const sessionId =
    typeof body.session_id === "string" && body.session_id.trim() ? body.session_id.trim() : null;

  const conversationId = sessionId ?? crypto.randomUUID();
  const sse = wantsSse(req, body);
  const turnIndex = resolveTurnIndex(sessionId, body.turn_index);

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
  const mode = routeMode(message);

  try {
    const prompt = buildHouseholdResponsePrompt({
      elderMessage: message,
      mode,
      riskLevel: risk.level,
      turnIndex,
    });
    const result = await runElderChatTurn({ userMessage: prompt, turnId });
    const guarded = guardAnYuResponse({
      elderMessage: message,
      generatedResponse: result.assistantMessage,
    });

    if (sse) {
      const stream = createStaticAssistantSseStream({
        turnId,
        conversation_id: conversationId,
        lang,
        modelLabel: result.model,
        prompt_version: getPromptVersion(),
        assistantText: guarded.response,
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
      assistant_message: guarded.response,
      conversation_id: conversationId,
      meta: {
        ...baseMeta(turnId, lang, result.model, {
          risk: riskPayload,
          chat_invoked: true,
          household_style_passed: guarded.passed,
          household_style_reasons: guarded.reasons,
          mode,
          turn_index: turnIndex,
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
