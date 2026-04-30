import { NextResponse } from "next/server";
import { markNotificationsRead } from "@/lib/child-insights/repository";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { elderUserId?: unknown };
  try {
    body = (await req.json()) as { elderUserId?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.elderUserId !== "string" || !body.elderUserId.trim()) {
    return NextResponse.json({ error: "`elderUserId` must be a non-empty string" }, { status: 400 });
  }
  const count = await markNotificationsRead(body.elderUserId.trim());
  return NextResponse.json({ ok: true, count });
}
