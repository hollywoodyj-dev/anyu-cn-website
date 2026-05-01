import { getPrismaClient } from "@/lib/server/prisma";
import type { ChildSettingsPayload } from "./types";

export type { ChildContact, ChildSettingsPayload } from "./types";

let settingsTableReady = false;

async function ensureChildSettingsTable(): Promise<void> {
  if (settingsTableReady) return;
  const prisma = getPrismaClient();
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ChildSettings" (
      "elderUserId" TEXT PRIMARY KEY,
      "payload" TEXT NOT NULL DEFAULT '{}',
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  settingsTableReady = true;
}

export async function getChildSettingsPayload(elderUserId: string): Promise<ChildSettingsPayload> {
  try {
    await ensureChildSettingsTable();
    const prisma = getPrismaClient();
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT "payload" FROM "ChildSettings" WHERE "elderUserId" = $1 LIMIT 1`,
      elderUserId,
    )) as Array<{ payload: string }>;
    const raw = rows[0]?.payload;
    if (typeof raw === "string" && raw.trim()) {
      const j = JSON.parse(raw) as unknown;
      if (j && typeof j === "object") return j as ChildSettingsPayload;
    }
  } catch {
    // ignore
  }
  return {};
}

export async function saveChildSettingsPayload(elderUserId: string, payload: ChildSettingsPayload): Promise<void> {
  await ensureChildSettingsTable();
  const prisma = getPrismaClient();
  const json = JSON.stringify(payload);
  await prisma.$executeRawUnsafe(
    `INSERT INTO "ChildSettings" ("elderUserId","payload","updatedAt") VALUES ($1,$2,NOW())
     ON CONFLICT ("elderUserId") DO UPDATE SET "payload" = EXCLUDED."payload", "updatedAt" = NOW()`,
    elderUserId,
    json,
  );
}

export async function getChildParentLabel(elderUserId: string): Promise<string> {
  const p = await getChildSettingsPayload(elderUserId);
  if (typeof p.parentDisplayName === "string" && p.parentDisplayName.trim()) {
    return p.parentDisplayName.trim();
  }
  return "妈妈";
}
