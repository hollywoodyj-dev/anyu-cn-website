import { NextResponse } from "next/server";
import { saveMemoryCard } from "@/lib/child-insights/repository";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { elderUserId?: unknown; id?: unknown };
  try {
    body = (await req.json()) as { elderUserId?: unknown; id?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.elderUserId !== "string" || !body.elderUserId.trim()) {
    return NextResponse.json({ error: "`elderUserId` must be a non-empty string" }, { status: 400 });
  }
  if (typeof body.id !== "string" || !body.id.trim()) {
    return NextResponse.json({ error: "`id` must be a non-empty string" }, { status: 400 });
  }
  const ok = await saveMemoryCard({ elderUserId: body.elderUserId.trim(), id: body.id.trim() });
  return NextResponse.json({ ok });
}
