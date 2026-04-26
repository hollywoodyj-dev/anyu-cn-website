/**
 *  utterance-complete STT（Spec §6）：整段 audio → 整句 text；不负责流式 ASR。
 *  默认 `ANYU_STT_PROVIDER=bridge`：服务端不转写，由设备桥接报文至 `message`。
 */

const TRANSCRIBE_URL = "https://api.openai.com/v1/audio/transcriptions";

export type SttProviderId = "bridge" | "openai_whisper" | "off";

export type TranscribeUtteranceResult = {
  text: string;
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
  if (provider === "bridge" || provider === "off") {
    throw new SttNotOnServerError();
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new SttMissingApiKeyError();
  }

  const model = (process.env.ANYU_OPENAI_TRANSCRIBE_MODEL ?? "whisper-1").trim();
  const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const u8 = Uint8Array.from(src);
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
    language: typeof json.language === "string" ? json.language : undefined,
    durationSeconds: typeof json.duration === "number" ? json.duration : undefined,
  };
}
