import type { PrismaClient } from "@prisma/client";

export type ConsentBlockLogInput = {
  elderUserId: string;
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
}
