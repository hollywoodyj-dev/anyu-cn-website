import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BODY = {
  error:
    "Consent API is not enabled until database persistence is configured (Prisma / ConsentSetting per Implementation Spec).",
  code: "NOT_IMPLEMENTED" as const,
};

/**
 * GET /api/consent — Implementation Spec §8（Step 8 stub）
 * 持久化未就绪时返回 **501**，避免误当作已存库同意书。
 */
export function GET() {
  return NextResponse.json(BODY, { status: 501 });
}

/**
 * PATCH /api/consent — Implementation Spec §8（Step 8 stub）
 */
export function PATCH() {
  return NextResponse.json(BODY, { status: 501 });
}
