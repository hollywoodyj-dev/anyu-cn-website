/**
 *  utterance-complete STT（Spec §6）：整段 audio → 整句 text；不负责流式 ASR。
 *  默认 `ANYU_STT_PROVIDER=bridge`：服务端不转写，由设备桥接报文至 `message`。
 */

const TRANSCRIBE_URL = "https://api.openai.com/v1/audio/transcriptions";

export type SttProviderId = "bridge" | "openai_whisper" | "off";

export type TranscribeUtteranceResult = {
  text: string;
  provider: "openai_whisper" | "bridge";
  model?: string;
  language?: string;
  /** OpenAI verbose_json 的 duration 秒；非 verbose 时可能缺省 */
  durationSeconds?: number;
};

export class SttNotOnServerError extends Error {
  readonly code = "STT_USE_TEXT_BRIDGE" as const;

  constructor(message = "Server STT disabled; send plain text to POST /api/elder-chat/message (bridge flow).") {
    super(message);
    this.name = "SttNotOnServerError";
  }
}

export class SttMissingApiKeyError extends Error {
  readonly code = "STT_MISSING_KEY" as const;

  constructor() {
    super("OPENAI_API_KEY is required for openai_whisper STT.");
    this.name = "SttMissingApiKeyError";
  }
}

export class SttUpstreamError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SttUpstreamError";
    this.status = status;
  }
}

export class SttBridgeConfigError extends Error {
  readonly code = "STT_BRIDGE_NOT_CONFIGURED" as const;

  constructor() {
    super("Bridge STT is not configured. Set ANYU_BRIDGE_STT_URL.");
    this.name = "SttBridgeConfigError";
  }
}

export function getAnyuSttProvider(): SttProviderId {
  const raw = (process.env.ANYU_STT_PROVIDER ?? "bridge").trim().toLowerCase();
  if (raw === "openai_whisper" || raw === "whisper") return "openai_whisper";
  if (raw === "off" || raw === "none") return "off";
  return "bridge";
}

function extensionFromMime(mime: string): string {
  const m = mime.split(";")[0]?.trim().toLowerCase() ?? "";
  if (m.includes("webm")) return "webm";
  if (m.includes("wav")) return "wav";
  if (m.includes("mpeg") || m === "audio/mp3") return "mp3";
  if (m.includes("mp4") || m.includes("m4a")) return "m4a";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("flac")) return "flac";
  return "audio";
}

function parseBridgeText(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  const j = json as {
    text?: unknown;
    transcript?: unknown;
    result?: unknown;
    data?: { text?: unknown; transcript?: unknown };
  };
  if (typeof j.text === "string") return j.text.trim();
  if (typeof j.transcript === "string") return j.transcript.trim();
  if (typeof j.result === "string") return j.result.trim();
  if (typeof j.data?.text === "string") return j.data.text.trim();
  if (typeof j.data?.transcript === "string") return j.data.transcript.trim();
  return "";
}

function parseBridgeError(json: unknown): { code?: string; message?: string } | null {
  if (!json || typeof json !== "object") return null;
  const j = json as {
    success?: unknown;
    code?: unknown;
    message?: unknown;
    error?: unknown;
  };
  const message =
    typeof j.message === "string"
      ? j.message
      : typeof j.error === "string"
        ? j.error
        : undefined;
  const code = typeof j.code === "string" ? j.code : undefined;
  const successFalse = j.success === false;
  if (!successFalse && !message && !code) return null;
  return { code, message };
}

async function transcribeViaBridge(
  bytes: Uint8Array,
  mime: string,
  opts?: { language?: string },
): Promise<TranscribeUtteranceResult> {
  const bridgeUrl = process.env.ANYU_BRIDGE_STT_URL?.trim();
  if (!bridgeUrl) {
    throw new SttBridgeConfigError();
  }

  const timeoutMsRaw = Number(process.env.ANYU_BRIDGE_STT_TIMEOUT_MS ?? "20000");
  const timeoutMs = Number.isFinite(timeoutMsRaw) && timeoutMsRaw > 1000 ? timeoutMsRaw : 20000;
  const ext = extensionFromMime(mime);
  const form = new FormData();
  const payload = Uint8Array.from(bytes);
  const blobType = mime.split(";")[0]?.trim() || "application/octet-stream";
  form.append("file", new Blob([payload], { type: blobType }), `utterance.${ext}`);
  form.append("audio", new Blob([payload], { type: blobType }), `utterance.${ext}`);

  const lang = opts?.language?.trim();
  if (lang && lang.length >= 2) {
    const short = lang.slice(0, 2);
    form.append("language", short);
    form.append("lang", short);
  }

  const token = process.env.ANYU_BRIDGE_STT_TOKEN?.trim();
  const tokenHeaderName =
    (process.env.ANYU_BRIDGE_STT_TOKEN_HEADER ?? "Authorization").trim() || "Authorization";
  const headers: HeadersInit = {};
  if (token) {
    headers[tokenHeaderName] =
      tokenHeaderName.toLowerCase() === "authorization" ? `Bearer ${token}` : token;
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(bridgeUrl, {
      method: "POST",
      headers,
      body: form,
      signal: ctrl.signal,
    });
    const raw = await res.text();
    if (!res.ok) {
      let msg = res.statusText;
      try {
        const j = raw ? (JSON.parse(raw) as { error?: string; message?: string }) : {};
        msg = j.error || j.message || msg;
      } catch {
        /* keep status text */
      }
      throw new SttUpstreamError(msg || "Bridge STT failed", res.status);
    }

    let json: unknown;
    try {
      json = raw ? JSON.parse(raw) : {};
    } catch {
      throw new SttUpstreamError("Invalid JSON from bridge STT", res.status);
    }
    const bridgeErr = parseBridgeError(json);
    if (bridgeErr?.message || bridgeErr?.code) {
      throw new SttUpstreamError(
        `${bridgeErr.code ?? "STT_UPSTREAM_ERROR"}${bridgeErr.message ? `: ${bridgeErr.message}` : ""}`,
        502,
      );
    }
    const text = parseBridgeText(json);
    // 200 + 空转写：多为静音/不可解码片段，交给上游按空串处理，避免误报 502
    if (!text) {
      return {
        text: "",
        provider: "bridge",
        model: undefined,
        language: undefined,
        durationSeconds: undefined,
      };
    }
    const j = (json ?? {}) as { language?: unknown; model?: unknown; duration?: unknown };
    return {
      text,
      provider: "bridge",
      model: typeof j.model === "string" ? j.model : undefined,
      language: typeof j.language === "string" ? j.language : undefined,
      durationSeconds: typeof j.duration === "number" ? j.duration : undefined,
    };
  } catch (e) {
    if (e instanceof SttUpstreamError) throw e;
    if (e instanceof Error && e.name === "AbortError") {
      throw new SttUpstreamError("Bridge STT timeout", 504);
    }
    const msg = e instanceof Error ? e.message : "Bridge STT failed";
    throw new SttUpstreamError(msg, 502);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param bytes 完整 utterance 二进制（WAV / WebM 等）
 * @param mime Content-Type（可带 charset 等后缀，仅取主类型推断文件名）
 * @param opts.language BCP-47 或 ISO-639-1，传给 Whisper 可省则用模型自动
 */
export async function transcribeUtterance(
  bytes: Uint8Array | ArrayBuffer,
  mime: string,
  opts?: { language?: string },
): Promise<TranscribeUtteranceResult> {
  const provider = getAnyuSttProvider();
  if (provider === "off") {
    throw new SttNotOnServerError();
  }
  const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const u8 = Uint8Array.from(src);
  if (provider === "bridge") {
    return transcribeViaBridge(u8, mime, opts);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new SttMissingApiKeyError();
  }

  const model = (process.env.ANYU_OPENAI_TRANSCRIBE_MODEL ?? "whisper-1").trim();
  const ext = extensionFromMime(mime);
  const form = new FormData();
  form.append("model", model);
  const blobType = mime.split(";")[0]?.trim() || "application/octet-stream";
  form.append("file", new Blob([u8], { type: blobType }), `utterance.${ext}`);
  const lang = opts?.language?.trim();
  if (lang && lang.length >= 2) {
    form.append("language", lang.slice(0, 2));
  }
  form.append("response_format", "verbose_json");

  const res = await fetch(TRANSCRIBE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const rawText = await res.text();
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = rawText ? (JSON.parse(rawText) as { error?: { message?: string } }) : {};
      msg = j.error?.message ?? msg;
    } catch {
      /* ignore */
    }
    throw new SttUpstreamError(msg || "OpenAI transcription failed", res.status);
  }

  type Verbose = {
    text?: string;
    language?: string;
    duration?: number;
  };
  let json: Verbose;
  try {
    json = rawText ? (JSON.parse(rawText) as Verbose) : {};
  } catch {
    throw new SttUpstreamError("Invalid JSON from OpenAI transcription", res.status);
  }
  const text = typeof json.text === "string" ? json.text.trim() : "";
  if (!text) {
    throw new SttUpstreamError("Empty transcription text", res.status);
  }

  return {
    text,
    provider: "openai_whisper",
    model,
    language: typeof json.language === "string" ? json.language : undefined,
    durationSeconds: typeof json.duration === "number" ? json.duration : undefined,
  };
}
