import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/child-insights/repository";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const elderUserId = (url.searchParams.get("elderUserId") ?? "elder_default").trim();
  const parentName = (url.searchParams.get("parentName") ?? "妈妈").trim();
  const data = await getDashboard(elderUserId, parentName || "妈妈");
  return NextResponse.json(data);
}
