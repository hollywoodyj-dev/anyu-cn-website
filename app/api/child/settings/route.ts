import { NextResponse } from "next/server";
import { getChildSettingsPayload, saveChildSettingsPayload } from "@/lib/child-insights/childSettingsRepository";
import type { ChildSettingsPayload } from "@/lib/child-insights/types";
import { ensureChildTables } from "@/lib/child-insights/repository";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const elderUserId = (url.searchParams.get("elderUserId") ?? "elder_default").trim();
  await ensureChildTables();
  const payload = await getChildSettingsPayload(elderUserId);
  return NextResponse.json({ elderUserId, payload });
}

export async function POST(req: Request) {
  let body: { elderUserId?: unknown; payload?: unknown };
  try {
    body = (await req.json()) as { elderUserId?: unknown; payload?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const elderUserId =
    typeof body.elderUserId === "string" && body.elderUserId.trim() ? body.elderUserId.trim() : "elder_default";
  if (!body.payload || typeof body.payload !== "object") {
    return NextResponse.json({ error: "`payload` object required" }, { status: 400 });
  }
  await ensureChildTables();
  await saveChildSettingsPayload(elderUserId, body.payload as ChildSettingsPayload);
  return NextResponse.json({ ok: true, elderUserId });
}
