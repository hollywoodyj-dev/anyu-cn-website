import type { PrismaClient } from "@prisma/client";
import { insertNotificationDeliveryAttempt } from "@/lib/child-insights/notificationDeliveryAudit";

export type ConsentBlockLogInput = {
  elderUserId: string;
  /** Daily ceiling risk (L1–L4) for audit alignment with Wisewave Priority C. */
  riskLevel: string;
  intendedKind: string;
  intendedDbLevel: string;
  intendedTitle: string;
  intendedMessage: string;
  reason: string;
  consentSnapshot: Record<string, unknown>;
};

export async function logFamilyNotificationConsentBlock(
  prisma: PrismaClient,
  input: ConsentBlockLogInput,
): Promise<void> {
  const id = crypto.randomUUID();
  const snap = JSON.stringify(input.consentSnapshot);
  await prisma.$executeRawUnsafe(
    `INSERT INTO "FamilyNotificationConsentBlock" ("id","elderUserId","intendedKind","intendedDbLevel","intendedTitle","intendedMessage","reason","consentSnapshot","createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
    id,
    input.elderUserId,
    input.intendedKind,
    input.intendedDbLevel,
    input.intendedTitle,
    input.intendedMessage,
    input.reason,
    snap,
  );

  await insertNotificationDeliveryAttempt(prisma, {
    elderUserId: input.elderUserId,
    familyNotificationId: null,
    riskLevel: input.riskLevel,
    notificationType: input.intendedKind,
    contactId: null,
    channel: "app",
    status: "blocked_by_consent",
    intendedTitle: input.intendedTitle,
    intendedMessage: input.intendedMessage,
    sentAtIso: null,
    failureReason: input.reason,
    consentSnapshot: input.consentSnapshot,
  });
}
