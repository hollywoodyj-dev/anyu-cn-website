import { NextResponse } from "next/server";
import { normalizeFamilyNotificationStrings } from "@/lib/child-insights/notificationPayloadPrivacy";
import { queryNotificationDeliveryAttempts } from "@/lib/child-insights/notificationDeliveryAudit";
import { ensureChildTables } from "@/lib/child-insights/repository";
import { getPrismaClient } from "@/lib/server/prisma";

export const runtime = "nodejs";

const QA_HEADER = "x-anyu-qa-secret";

/**
 * QA-only: recent `NotificationDeliveryAttempt` rows for an elder.
 * Requires `ANYU_QA_SECRET` in server env and matching header `x-anyu-qa-secret`.
 * If secret is unset or mismatch → 404 (no fingerprinting).
 */
export async function GET(req: Request) {
  const expected = process.env.ANYU_QA_SECRET?.trim();
  if (!expected) {
    return new NextResponse(null, { status: 404 });
  }
  const provided = req.headers.get(QA_HEADER)?.trim();
  if (!provided || provided !== expected) {
    return new NextResponse(null, { status: 404 });
  }

  const url = new URL(req.url);
  const elderUserId = (url.searchParams.get("elderUserId") ?? "").trim();
  if (!elderUserId) {
    return NextResponse.json({ error: "elderUserId required" }, { status: 400 });
  }
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 50;
  if (Number.isNaN(limit)) {
    return NextResponse.json({ error: "limit must be a number" }, { status: 400 });
  }

  await ensureChildTables();
  const prisma = getPrismaClient();
  const rows = await queryNotificationDeliveryAttempts(prisma, elderUserId, limit);

  const attempts = rows.map((r) => {
    let consentSnapshot: unknown = r.consentSnapshotRaw;
    try {
      consentSnapshot = JSON.parse(r.consentSnapshotRaw) as unknown;
    } catch {
      consentSnapshot = r.consentSnapshotRaw;
    }
    const { title: intendedTitle, message: intendedMessage } = normalizeFamilyNotificationStrings(
      r.intendedTitle,
      r.intendedMessage,
    );
    return {
      id: r.id,
      elderUserId: r.elderUserId,
      familyNotificationId: r.familyNotificationId,
      riskLevel: r.riskLevel,
      notificationType: r.notificationType,
      contactId: r.contactId,
      channel: r.channel,
      status: r.status,
      intendedTitle,
      intendedMessage,
      createdAt: r.createdAt,
      sentAt: r.sentAt,
      failureReason: r.failureReason,
      consentSnapshot,
    };
  });

  return NextResponse.json({ elderUserId, count: attempts.length, attempts });
}
