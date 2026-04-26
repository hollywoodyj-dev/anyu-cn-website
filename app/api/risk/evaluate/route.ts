import { NextResponse, type NextRequest } from "next/server";
import { evaluateRiskText } from "@/lib/anyu/risk/evaluate";

export const runtime = "nodejs";

type Body = {
  text?: unknown;
  session_id?: unknown;
  context?: unknown;
};

/**
 * POST /api/risk/evaluate — ANYU_Voice_OpenAI_STT_Implementation_Spec §4.3（P1 stub，可独立迭代规则）
 */
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.text !== "string" || !body.text.trim()) {
    return NextResponse.json({ error: "`text` must be a non-empty string" }, { status: 400 });
  }

  const session_id =
    typeof body.session_id === "string" && body.session_id.trim()
      ? body.session_id.trim()
      : undefined;
  const context =
    typeof body.context === "string" && body.context.trim() ? body.context.trim() : undefined;

  const result = evaluateRiskText({
    text: body.text.trim(),
    session_id,
    context,
  });

  return NextResponse.json({
    level: result.level,
    signals: result.signals,
    version: result.version,
  });
}
