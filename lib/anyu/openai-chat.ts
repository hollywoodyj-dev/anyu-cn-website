import { getPromptVersion, getSystemPrompt } from "./prompts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export type ElderChatTurnInput = {
  userMessage: string;
  /** 用于日志关联，不写入用户正文 */
  turnId: string;
  /** 可选覆盖模型 */
  modelOverride?: string;
};

export type ElderChatTurnOk = {
  assistantMessage: string;
  model: string;
  promptVersion: string;
};

export class OpenAIChatUpstreamError extends Error {
  readonly status: number;
  readonly openaiType?: string;
  readonly openaiCode?: string;

  constructor(message: string, status: number, openaiType?: string, openaiCode?: string) {
    super(message);
    this.name = "OpenAIChatUpstreamError";
    this.status = status;
    this.openaiType = openaiType;
    this.openaiCode = openaiCode;
  }
}

type OpenAIErrorBody = {
  error?: { message?: string; type?: string; code?: string };
};

function logTurn(turnId: string, msg: string, extra?: Record<string, unknown>) {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    // 生产环境不落全文 prompt / 用户句（Spec §5）
    console.info("[anyu-elder-chat]", { turn_id: turnId, ...extra, note: msg });
  } else {
    console.info("[anyu-elder-chat]", { turn_id: turnId, ...extra, msg });
  }
}

/**
 * 单轮 Chat Completions（非流式 P0）。
 * API Key 仅服务端使用。
 */
export async function runElderChatTurn(input: ElderChatTurnInput): Promise<ElderChatTurnOk> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = (input.modelOverride ?? process.env.ANYU_OPENAI_CHAT_MODEL ?? "gpt-5.4").trim();
  const systemPrompt = getSystemPrompt();
  const promptVersion = getPromptVersion();

  logTurn(input.turnId, "request_start", { model, prompt_version: promptVersion });

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.userMessage },
      ],
      temperature: 0.7,
    }),
  });

  const raw = await res.text();
  let json: unknown;
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    throw new OpenAIChatUpstreamError("Invalid JSON from OpenAI", res.status);
  }

  if (!res.ok) {
    const err = json as OpenAIErrorBody;
    const msg = err.error?.message ?? res.statusText;
    logTurn(input.turnId, "openai_error", {
      status: res.status,
      openai_type: err.error?.type,
      openai_code: err.error?.code,
    });
    throw new OpenAIChatUpstreamError(msg, res.status, err.error?.type, err.error?.code);
  }

  type OkShape = {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const ok = json as OkShape;
  const text = ok.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new OpenAIChatUpstreamError("Empty assistant content", res.status);
  }

  logTurn(input.turnId, "request_ok", { model, prompt_version: promptVersion });

  return {
    assistantMessage: text,
    model,
    promptVersion,
  };
}

/** 上游失败时给前端的兜底短句（不假装有能力） */
export function safeAssistantFallback(): string {
  return "我现在有点接不上，请你稍后再试，或先和身边的人说一声。";
}

export type ElderChatSseMeta = {
  conversation_id: string;
  lang: string;
};

function sseLine(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

/**
 * OpenAI Chat Completions `stream: true` → 安语规范化 SSE（仅 LLM token；STT 仍在桥接侧）。
 * 事件：`meta` → 若干 `delta`（`text` 片段）→ `done`；错误为 `error`。
 */
export async function createElderChatMessageSseStream(
  input: ElderChatTurnInput,
  meta: ElderChatSseMeta,
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = (input.modelOverride ?? process.env.ANYU_OPENAI_CHAT_MODEL ?? "gpt-5.4").trim();
  const systemPrompt = getSystemPrompt();
  const promptVersion = getPromptVersion();

  logTurn(input.turnId, "stream_request_start", { model, prompt_version: promptVersion });

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.userMessage },
      ],
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!res.ok) {
    const raw = await res.text();
    let msg = res.statusText;
    try {
      const j = raw ? (JSON.parse(raw) as OpenAIErrorBody) : {};
      msg = j.error?.message ?? msg;
    } catch {
      /* keep statusText */
    }
    logTurn(input.turnId, "stream_openai_error", { status: res.status });
    throw new OpenAIChatUpstreamError(msg, res.status);
  }

  if (!res.body) {
    throw new OpenAIChatUpstreamError("Empty stream body", res.status);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = res.body.getReader();

  function processSseLine(controller: ReadableStreamDefaultController<Uint8Array>, trimmed: string) {
    if (!trimmed.startsWith("data:")) return "continue" as const;
    const payload = trimmed.slice(5).trim();
    if (payload === "[DONE]") {
      controller.enqueue(encoder.encode(sseLine({ type: "done" })));
      return "done" as const;
    }
    try {
      const json = JSON.parse(payload) as {
        error?: { message?: string };
        choices?: Array<{ delta?: { content?: string | null } }>;
      };
      if (json.error?.message) {
        controller.enqueue(
          encoder.encode(sseLine({ type: "error", message: json.error.message })),
        );
        return "done" as const;
      }
      const piece = json.choices?.[0]?.delta?.content;
      if (typeof piece === "string" && piece.length > 0) {
        controller.enqueue(encoder.encode(sseLine({ type: "delta", text: piece })));
      }
    } catch {
      /* ignore non-JSON lines */
    }
    return "continue" as const;
  }

  return new ReadableStream<Uint8Array>({
    start(controller) {
      void (async () => {
        try {
          controller.enqueue(
            encoder.encode(
              sseLine({
                type: "meta",
                conversation_id: meta.conversation_id,
                turn_id: input.turnId,
                model,
                prompt_version: promptVersion,
                timestamp: new Date().toISOString(),
                lang: meta.lang,
              }),
            ),
          );

          let buffer = "";
          let streamEnded = false;

          while (!streamEnded) {
            const { done, value } = await reader.read();
            if (value) {
              buffer += decoder.decode(value, { stream: !done });
            }
            let newlineIdx: number;
            while (!streamEnded && (newlineIdx = buffer.indexOf("\n")) >= 0) {
              const line = buffer.slice(0, newlineIdx);
              buffer = buffer.slice(newlineIdx + 1);
              if (processSseLine(controller, line.trim()) === "done") {
                streamEnded = true;
              }
            }
            if (done && !streamEnded) {
              const tail = buffer.trim();
              if (tail && processSseLine(controller, tail) === "done") {
                streamEnded = true;
              } else if (!tail) {
                controller.enqueue(encoder.encode(sseLine({ type: "done" })));
                streamEnded = true;
              } else {
                controller.enqueue(encoder.encode(sseLine({ type: "done" })));
                streamEnded = true;
              }
            }
          }

          logTurn(input.turnId, "stream_request_ok", { model, prompt_version: promptVersion });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "stream failed";
          controller.enqueue(encoder.encode(sseLine({ type: "error", message: msg })));
        } finally {
          controller.close();
        }
      })();
    },
  });
}
