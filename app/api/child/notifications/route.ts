import { NextResponse } from "next/server";
import {
  getNotifications,
  markNotificationContacted,
  markNotificationsRead,
  markTodaysNotificationsContacted,
} from "@/lib/child-insights/repository";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const elderUserId = (url.searchParams.get("elderUserId") ?? "elder_default").trim();
  const notifications = await getNotifications(elderUserId);
  return NextResponse.json({ notifications });
}

export async function POST(req: Request) {
  let body: { elderUserId?: unknown; action?: unknown; notificationId?: unknown };
  try {
    body = (await req.json()) as { elderUserId?: unknown; action?: unknown; notificationId?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.elderUserId !== "string" || !body.elderUserId.trim()) {
    return NextResponse.json({ error: "`elderUserId` must be a non-empty string" }, { status: 400 });
  }
  const elder = body.elderUserId.trim();
  const action = typeof body.action === "string" ? body.action : "read_all";
  if (action === "read_all") {
    const count = await markNotificationsRead(elder);
    return NextResponse.json({ ok: true, count });
  }
  if (action === "mark_contacted") {
    if (typeof body.notificationId !== "string" || !body.notificationId.trim()) {
      return NextResponse.json({ error: "`notificationId` required for mark_contacted" }, { status: 400 });
    }
    const ok = await markNotificationContacted(elder, body.notificationId.trim());
    return NextResponse.json({ ok, updated: ok });
  }
  if (action === "mark_today_contacted") {
    const count = await markTodaysNotificationsContacted(elder);
    return NextResponse.json({ ok: true, count });
  }
  return NextResponse.json(
    { error: "Unsupported action. Use read_all, mark_contacted, or mark_today_contacted." },
    { status: 400 },
  );
}
