import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/consent/revoke — Implementation Spec §8（Step 8 stub）
 */
export function POST() {
  return NextResponse.json(
    {
      error:
        "Consent revoke is not enabled until database persistence is configured (Prisma / ConsentSetting).",
      code: "NOT_IMPLEMENTED" as const,
    },
    { status: 501 },
  );
}
