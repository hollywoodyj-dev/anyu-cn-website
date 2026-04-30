import { NextResponse } from "next/server";
import { getNotifications, markNotificationsRead } from "@/lib/child-insights/repository";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const elderUserId = (url.searchParams.get("elderUserId") ?? "elder_default").trim();
  const notifications = await getNotifications(elderUserId);
  return NextResponse.json({ notifications });
}

export async function POST(req: Request) {
  let body: { elderUserId?: unknown; action?: unknown };
  try {
    body = (await req.json()) as { elderUserId?: unknown; action?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.elderUserId !== "string" || !body.elderUserId.trim()) {
    return NextResponse.json({ error: "`elderUserId` must be a non-empty string" }, { status: 400 });
  }
  const action = typeof body.action === "string" ? body.action : "read_all";
  if (action !== "read_all") {
    return NextResponse.json({ error: "Only action=read_all is supported in V1." }, { status: 400 });
  }
  const count = await markNotificationsRead(body.elderUserId.trim());
  return NextResponse.json({ ok: true, count });
}
