import { NextResponse, type NextRequest } from "next/server";
import {
  OpenAIChatUpstreamError,
  createElderChatMessageSseStream,
  runElderChatTurn,
  safeAssistantFallback,
} from "@/lib/anyu/openai-chat";
import { getPromptVersion } from "@/lib/anyu/prompts";

export const runtime = "nodejs";

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

/**
 * POST /api/elder-chat/message — P0（ANYU_Voice_OpenAI_STT_Implementation_Spec §4.2）
 * 文本入 → OpenAI 出；API Key 仅在服务端。
 * 流式：`Accept: text/event-stream` 或 JSON `"stream": true` → `text/event-stream`（SSE）。
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

  if (sse) {
    if (!process.env.OPENAI_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "Server is not configured for chat (missing OPENAI_API_KEY)." },
        { status: 503 },
      );
    }
    try {
      const stream = await createElderChatMessageSseStream(
        { userMessage: message, turnId },
        { conversation_id: conversationId, lang },
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
              model: (process.env.ANYU_OPENAI_CHAT_MODEL ?? "gpt-5.4").trim(),
              prompt_version: getPromptVersion(),
              timestamp: new Date().toISOString(),
              turn_id: turnId,
              lang,
              upstream_status: err.status,
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
        model: result.model,
        prompt_version: result.promptVersion,
        timestamp: new Date().toISOString(),
        turn_id: turnId,
        lang,
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
            model: (process.env.ANYU_OPENAI_CHAT_MODEL ?? "gpt-5.4").trim(),
            prompt_version: getPromptVersion(),
            timestamp: new Date().toISOString(),
            turn_id: turnId,
            lang,
            upstream_status: err.status,
          },
          error: "Upstream chat failed",
        },
        { status: 502 },
      );
    }

    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "Server is not configured for chat (missing OPENAI_API_KEY)." },
        { status: 503 },
      );
    }

    console.error("[anyu-elder-chat]", { turn_id: turnId, error: msg });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
