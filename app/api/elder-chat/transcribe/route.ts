import { NextResponse, type NextRequest } from "next/server";
import {
  SttBridgeConfigError,
  SttMissingApiKeyError,
  SttNotOnServerError,
  SttUpstreamError,
  transcribeUtterance,
} from "@/lib/anyu/stt";

export const runtime = "nodejs";

const MAX_BYTES = 24 * 1024 * 1024;

/**
 * POST /api/elder-chat/transcribe — Spec §6（utterance-complete STT）
 * multipart：`audio` 或 `file`（二选一）；可选 `lang`（如 zh）。
 * 支持：
 * - `ANYU_STT_PROVIDER=openai_whisper` + `OPENAI_API_KEY`
 * - `ANYU_STT_PROVIDER=bridge` + `ANYU_BRIDGE_STT_URL`
 */
export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.toLowerCase().includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data with field `audio` or `file`." },
      { status: 400 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const entry = form.get("audio") ?? form.get("file");
  if (!(entry instanceof File) || entry.size === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty file in field `audio` or `file`." },
      { status: 400 },
    );
  }

  if (entry.size > MAX_BYTES) {
    return NextResponse.json({ error: "Audio file too large (max 24MB)." }, { status: 413 });
  }

  const langField = form.get("lang");
  const language =
    typeof langField === "string" && langField.trim() ? langField.trim() : undefined;

  const buf = Buffer.from(await entry.arrayBuffer());
  const mime = entry.type || "application/octet-stream";

  try {
    const out = await transcribeUtterance(buf, mime, { language });
    return NextResponse.json({
      text: out.text,
      meta: {
        provider: out.provider,
        ...(out.model ? { model: out.model } : {}),
        ...(out.language ? { language: out.language } : {}),
        ...(typeof out.durationSeconds === "number"
          ? { duration_seconds: out.durationSeconds }
          : {}),
      },
    });
  } catch (err) {
    if (err instanceof SttNotOnServerError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 501 },
      );
    }
    if (err instanceof SttMissingApiKeyError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 503 },
      );
    }
    if (err instanceof SttBridgeConfigError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 503 },
      );
    }
    if (err instanceof SttUpstreamError) {
      const status = err.status >= 400 && err.status < 600 ? err.status : 502;
      return NextResponse.json(
        { error: err.message, code: "STT_UPSTREAM_ERROR" },
        { status: status === 401 || status === 403 ? status : 502 },
      );
    }
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[anyu-stt]", msg);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
