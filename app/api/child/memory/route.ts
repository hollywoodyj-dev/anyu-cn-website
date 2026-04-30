import { NextResponse } from "next/server";
import { getMemoryCards } from "@/lib/child-insights/repository";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const elderUserId = (url.searchParams.get("elderUserId") ?? "elder_default").trim();
  const cards = await getMemoryCards(elderUserId);
  return NextResponse.json({ cards });
}
