import { NextResponse, type NextRequest } from "next/server";
import {
  OpenAIChatUpstreamError,
  createElderChatMessageSseStream,
  createStaticAssistantSseStream,
  runElderChatTurn,
  safeAssistantFallback,
} from "@/lib/anyu/openai-chat";
import { getPromptVersion } from "@/lib/anyu/prompts";
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
};

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

  if (sse) {
    try {
      const stream = await createElderChatMessageSseStream(
        { userMessage: message, turnId },
        { conversation_id: conversationId, lang, risk: riskPayload },
      );
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    } catch (err) {
      if (err instanceof OpenAIChatUpstreamError) {
        return NextResponse.json(
          {
            assistant_message: safeAssistantFallback(),
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

  try {
    const result = await runElderChatTurn({ userMessage: message, turnId });

    return NextResponse.json({
      assistant_message: result.assistantMessage,
      conversation_id: conversationId,
      meta: {
        ...baseMeta(turnId, lang, result.model, {
          risk: riskPayload,
          chat_invoked: true,
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
