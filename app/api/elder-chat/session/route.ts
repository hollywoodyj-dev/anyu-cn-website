import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  elder_profile_id?: unknown;
};

/**
 * POST /api/elder-chat/session — ANYU_Voice_OpenAI_STT_Implementation_Spec §4.1
 *
 * 当前：**无 Prisma** 时仅签发 `session_id`（UUID），供后续 `POST /api/elder-chat/message` 的 `session_id` / `conversation_id` 对齐。
 * 多副本 Serverless **不**做跨实例会话校验；接入 `DATABASE_URL` + 会话表后再做 **404 unknown session** 等。
 */
export async function POST(req: Request) {
  let body: Body = {};
  const text = await req.text();
  if (text.trim()) {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        body = parsed as Body;
      } else {
        return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  if (body.elder_profile_id !== undefined && body.elder_profile_id !== null) {
    if (typeof body.elder_profile_id !== "string" || !body.elder_profile_id.trim()) {
      return NextResponse.json(
        { error: "`elder_profile_id` must be a non-empty string when provided" },
        { status: 400 },
      );
    }
  }

  const session_id = crypto.randomUUID();

  return NextResponse.json({
    session_id,
    meta: {
      timestamp: new Date().toISOString(),
      persistence: "none",
    },
  });
}
