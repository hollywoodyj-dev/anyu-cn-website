import type { PrismaClient } from "@prisma/client";

/** Wisewave V1.2 Priority C — per-channel delivery / audit row (no raw chat in snapshot). */
export type NotificationDeliveryRow = {
  elderUserId: string;
  familyNotificationId: string | null;
  riskLevel: string;
  notificationType: string;
  contactId: string | null;
  channel: string;
  status: string;
  intendedTitle: string;
  intendedMessage: string;
  sentAtIso: string | null;
  failureReason: string | null;
  consentSnapshot: Record<string, unknown>;
};

export async function insertNotificationDeliveryAttempt(
  prisma: PrismaClient,
  row: NotificationDeliveryRow,
): Promise<void> {
  const id = crypto.randomUUID();
  const snap = JSON.stringify(row.consentSnapshot);
  await prisma.$executeRawUnsafe(
    `INSERT INTO "NotificationDeliveryAttempt" (
      "id","elderUserId","familyNotificationId","riskLevel","notificationType","contactId","channel","status","intendedTitle","intendedMessage","createdAt","sentAt","failureReason","consentSnapshot"
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),$11::timestamptz,$12,$13)`,
    id,
    row.elderUserId,
    row.familyNotificationId,
    row.riskLevel,
    row.notificationType,
    row.contactId,
    row.channel,
    row.status,
    row.intendedTitle,
    row.intendedMessage,
    row.sentAtIso,
    row.failureReason,
    snap,
  );
}
