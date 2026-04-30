import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  deviceId?: unknown;
  elderUserId?: unknown;
  locale?: unknown;
  message?: unknown;
  transcript?: unknown;
  audioBlob?: unknown;
};

function mapLightState(input: {
  riskLevel: string;
  mentionsFamily: boolean;
  lonelinessLike: boolean;
}): "warm_white" | "soft_yellow" | "soft_blue" | "orange_red" {
  if (input.riskLevel === "L3" || input.riskLevel === "L4") return "orange_red";
  if (input.mentionsFamily) return "soft_blue";
  if (input.lonelinessLike) return "soft_yellow";
  return "warm_white";
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.deviceId !== "string" || !body.deviceId.trim()) {
    return NextResponse.json({ error: "`deviceId` must be a non-empty string" }, { status: 400 });
  }
  if (typeof body.elderUserId !== "string" || !body.elderUserId.trim()) {
    return NextResponse.json({ error: "`elderUserId` must be a non-empty string" }, { status: 400 });
  }
  const text =
    (typeof body.message === "string" && body.message.trim()) ||
    (typeof body.transcript === "string" && body.transcript.trim()) ||
    "";
  if (!text) {
    return NextResponse.json(
      { error: "V1 requires `message` or `transcript` text input." },
      { status: 400 },
    );
  }
  const locale = typeof body.locale === "string" && body.locale.trim() ? body.locale.trim() : "zh";
  const origin = new URL(req.url).origin;
  const sessionId = `device:${body.deviceId.trim()}:${body.elderUserId.trim()}`;
  const res = await fetch(`${origin}/api/elder-chat/message`, {
    method: "POST",
    headers: { "content-type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      elder_user_id: body.elderUserId.trim(),
      message: text,
      lang: locale,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return NextResponse.json(
      {
        error: "device_message_upstream_failed",
        upstreamStatus: res.status,
        detail: json,
      },
      { status: 502 },
    );
  }
  const reply = typeof json.assistant_message === "string" ? json.assistant_message : "我听到了，你可以慢慢说。";
  const meta = (json.meta ?? {}) as Record<string, unknown>;
  const risk = (meta.risk ?? {}) as Record<string, unknown>;
  const runtime = (meta.runtime ?? {}) as Record<string, unknown>;
  const activeThread = (meta.active_thread ?? {}) as Record<string, unknown>;
  const riskLevel = typeof risk.level === "string" ? risk.level : "L1";
  const mentionsFamily =
    runtime.detectedEmotion === "missing_family" ||
    activeThread.topic === "family" ||
    /家人|子女|仔女|返嚟|回来|吃饭|电话/.test(text);
  const lonelinessLike =
    runtime.detectedEmotion === "loneliness" || /孤独|孤单|寂寞|无人|没人|冇人/.test(text);
  return NextResponse.json({
    textReply: reply,
    ttsUrl: null,
    lightState: mapLightState({ riskLevel, mentionsFamily, lonelinessLike }),
    riskLevel,
    conversationId: json.conversation_id ?? null,
  });
}
