import { getPrismaClient } from "@/lib/server/prisma";
import { appendFamilyNotificationIfEligible } from "@/lib/child-insights/familyNotifications";
import { getChildParentLabel } from "@/lib/child-insights/childSettingsRepository";
import { dailySignals, resolveChildStateDisplay } from "@/lib/child-insights/childUiCopy";
import type { ChildNotificationItem, ConversationSignalRecord, DashboardCard } from "./types";

let tablesReady = false;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function ensureChildTables(): Promise<void> {
  if (tablesReady) return;
  const prisma = getPrismaClient();
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ConversationSignal" (
      "id" TEXT PRIMARY KEY,
      "elderUserId" TEXT NOT NULL,
      "sessionId" TEXT NULL,
      "emotion" TEXT NOT NULL,
      "mentionsFamily" BOOLEAN NOT NULL DEFAULT false,
      "healthSignal" BOOLEAN NOT NULL DEFAULT false,
      "indirectExpression" BOOLEAN NOT NULL DEFAULT false,
      "riskLevel" TEXT NOT NULL,
      "keywords" TEXT NOT NULL DEFAULT '[]',
      "memoryCandidate" TEXT NULL,
      "suggestedAction" TEXT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS "ConversationSignal_elderUserId_createdAt_idx" ON "ConversationSignal" ("elderUserId","createdAt");

    CREATE TABLE IF NOT EXISTS "DailySummary" (
      "id" TEXT PRIMARY KEY,
      "elderUserId" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "overallState" TEXT NOT NULL,
      "familyMentions" INTEGER NOT NULL DEFAULT 0,
      "lonelinessScore" INTEGER NOT NULL DEFAULT 0,
      "healthSignals" INTEGER NOT NULL DEFAULT 0,
      "riskLevel" TEXT NOT NULL,
      "keyMessages" TEXT NOT NULL DEFAULT '[]',
      "suggestedAction" TEXT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "DailySummary_elderUserId_date_key" ON "DailySummary" ("elderUserId","date");

    CREATE TABLE IF NOT EXISTS "MemoryCard" (
      "id" TEXT PRIMARY KEY,
      "elderUserId" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "tag" TEXT NOT NULL,
      "saved" BOOLEAN NOT NULL DEFAULT false,
      "source" TEXT NOT NULL DEFAULT 'signal',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "FamilyNotification" (
      "id" TEXT PRIMARY KEY,
      "elderUserId" TEXT NOT NULL,
      "childUserId" TEXT NULL,
      "level" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "read" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'FamilyNotification' AND column_name = 'contactedAt'
        ) THEN
          ALTER TABLE "FamilyNotification" ADD COLUMN "contactedAt" TIMESTAMP;
        END IF;
      END $$;
    `);
  } catch {
    /* ignore migration errors on non-Postgres or restricted env */
  }
  tablesReady = true;
}

async function fetchLatestMemoryTeaser(
  prisma: ReturnType<typeof getPrismaClient>,
  elderUserId: string,
): Promise<{ id: string; excerpt: string } | null> {
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT "id","content" FROM "MemoryCard" WHERE "elderUserId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
    elderUserId,
  )) as Array<{ id: string; content: string }>;
  const r = rows[0];
  if (!r?.content) return null;
  const excerpt = r.content.length > 72 ? `${r.content.slice(0, 72)}…` : r.content;
  return { id: r.id, excerpt };
}

function maxRiskInWindow(levels: string[]): "L0" | "L1" | "L2" | "L3" | "L4" {
  for (const tier of ["L4", "L3", "L2", "L1", "L0"] as const) {
    if (levels.some((l) => l === tier)) return tier;
  }
  return "L1";
}

function parseJsonArray(v: unknown): string[] {
  if (typeof v !== "string") return [];
  try {
    const j = JSON.parse(v) as unknown;
    return Array.isArray(j) ? j.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function saveConversationSignal(input: {
  elderUserId: string;
  sessionId?: string | null;
  signal: ConversationSignalRecord;
}): Promise<void> {
  try {
    await ensureChildTables();
    const prisma = getPrismaClient();
    const id = crypto.randomUUID();
    const now = new Date(input.signal.timestamp).toISOString();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ConversationSignal" ("id","elderUserId","sessionId","emotion","mentionsFamily","healthSignal","indirectExpression","riskLevel","keywords","memoryCandidate","suggestedAction","createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      id,
      input.elderUserId,
      input.sessionId ?? null,
      input.signal.emotion,
      input.signal.mentionsFamily,
      input.signal.healthSignal,
      input.signal.indirectExpression,
      input.signal.riskLevel,
      JSON.stringify(input.signal.keywords),
      input.signal.memoryCandidate ?? null,
      input.signal.suggestedAction ?? null,
      now,
    );

    if (input.signal.memoryCandidate) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "MemoryCard" ("id","elderUserId","content","tag","saved","source","createdAt","updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        crypto.randomUUID(),
        input.elderUserId,
        input.signal.memoryCandidate,
        input.signal.mentionsFamily ? "family" : "emotion",
        false,
        "signal",
        now,
        now,
      );
    }

    const today = dayKey(new Date(now));
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT "emotion","mentionsFamily","healthSignal","riskLevel","memoryCandidate"
       FROM "ConversationSignal"
       WHERE "elderUserId" = $1 AND DATE("createdAt") = $2::date
       ORDER BY "createdAt" DESC
       LIMIT 50`,
      input.elderUserId,
      today,
    )) as Array<{
      emotion: string;
      mentionsFamily: boolean;
      healthSignal: boolean;
      riskLevel: string;
      memoryCandidate: string | null;
    }>;

    const lonely = rows.filter((r) => r.emotion === "lonely").length;
    const low = rows.filter((r) => r.emotion === "low").length;
    const familyMentions = rows.filter((r) => r.mentionsFamily).length;
    const healthSignals = rows.filter((r) => r.healthSignal).length;
    const highestRisk = rows.some((r) => r.riskLevel === "L4")
      ? "L4"
      : rows.some((r) => r.riskLevel === "L3")
        ? "L3"
        : rows.some((r) => r.riskLevel === "L2")
          ? "L2"
          : "L1";
    const overallState = highestRisk === "L3" || highestRisk === "L4"
      ? "risk"
      : lonely >= 2
        ? "lonely"
        : low >= 2 || familyMentions >= 2
          ? "low"
          : "stable";
    const keyMessages = rows
      .map((r) => r.memoryCandidate)
      .filter((x): x is string => Boolean(x))
      .slice(0, 3);

    await prisma.$executeRawUnsafe(
      `INSERT INTO "DailySummary" ("id","elderUserId","date","overallState","familyMentions","lonelinessScore","healthSignals","riskLevel","keyMessages","suggestedAction","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT ("elderUserId","date")
       DO UPDATE SET "overallState" = EXCLUDED."overallState",
                     "familyMentions" = EXCLUDED."familyMentions",
                     "lonelinessScore" = EXCLUDED."lonelinessScore",
                     "healthSignals" = EXCLUDED."healthSignals",
                     "riskLevel" = EXCLUDED."riskLevel",
                     "keyMessages" = EXCLUDED."keyMessages",
                     "suggestedAction" = EXCLUDED."suggestedAction",
                     "updatedAt" = EXCLUDED."updatedAt"`,
      crypto.randomUUID(),
      input.elderUserId,
      today,
      overallState,
      familyMentions,
      lonely,
      healthSignals,
      highestRisk,
      JSON.stringify(keyMessages),
      input.signal.suggestedAction ?? null,
      now,
      now,
    );

    const parentLabel = await getChildParentLabel(input.elderUserId);
    await appendFamilyNotificationIfEligible(prisma, {
      elderUserId: input.elderUserId,
      parentLabel,
      highestRisk,
      lonelyTurnsToday: lonely,
      familyMentionsToday: familyMentions,
      now: new Date(now),
    });
  } catch {
    // keep chat path resilient even if child-side persistence fails
  }
}

export async function getDashboard(elderUserId: string, parentName = "妈妈"): Promise<DashboardCard> {
  await ensureChildTables();
  const prisma = getPrismaClient();
  const today = dayKey(new Date());
  const summaryRows = (await prisma.$queryRawUnsafe(
    `SELECT * FROM "DailySummary" WHERE "elderUserId" = $1 AND "date" = $2 LIMIT 1`,
    elderUserId,
    today,
  )) as Array<{
    overallState: string;
    riskLevel: string;
    keyMessages: string;
    suggestedAction: string | null;
    familyMentions: number;
    lonelinessScore: number;
    updatedAt: Date;
  }>;
  const summary = summaryRows[0];
  const last7 = (await prisma.$queryRawUnsafe(
    `SELECT "lonelinessScore","familyMentions","healthSignals","riskLevel","overallState" FROM "DailySummary" WHERE "elderUserId" = $1 ORDER BY "date" DESC LIMIT 7`,
    elderUserId,
  )) as Array<{
    lonelinessScore: number;
    familyMentions: number;
    healthSignals: number;
    riskLevel: string;
    overallState: string;
  }>;
  const trend = {
    lonely: last7.reduce((n, r) => n + Number(r.lonelinessScore ?? 0), 0),
    lowMoodDays: last7.filter((r) => r.overallState === "low").length,
    familyMentions: last7.reduce((n, r) => n + Number(r.familyMentions ?? 0), 0),
    health: last7.reduce((n, r) => n + Number(r.healthSignals ?? 0), 0),
    lastRiskLevel: maxRiskInWindow(last7.map((r) => String(r.riskLevel ?? "L1"))),
  };
  const teaser = await fetchLatestMemoryTeaser(prisma, elderUserId);
  if (!summary) {
    return {
      parentName,
      state: "stable",
      stateDisplay: "steady",
      riskLevelToday: "L1",
      familyMentionsToday: 0,
      lonelinessToday: 0,
      lastUpdatedAt: null,
      memoryTeaser: teaser,
      summary: "今天状态平稳。",
      suggestedAction: "今天可以找个时间联系一下。",
      trend,
    };
  }
  const familyMentionsToday = Number(summary.familyMentions ?? 0);
  const lonelinessToday = Number(summary.lonelinessScore ?? 0);
  const riskLevelToday = (["L1", "L2", "L3", "L4"].includes(String(summary.riskLevel))
    ? summary.riskLevel
    : "L1") as "L1" | "L2" | "L3" | "L4";
  const stateDisplay = resolveChildStateDisplay({
    overallState: summary.overallState,
    riskLevel: String(summary.riskLevel ?? "L1"),
    familyMentionsToday,
    lonelinessToday,
  });
  const state = summary.riskLevel === "L3" || summary.riskLevel === "L4"
    ? "risk"
    : summary.overallState === "lonely"
      ? "lonely"
      : summary.overallState === "low"
        ? "low"
        : summary.overallState === "watch"
          ? "watch"
          : "stable";
  const summaryLine = parseJsonArray(summary.keyMessages)[0] ?? (state === "lonely" ? "今天有点孤单。" : "今天状态平稳。");
  return {
    parentName,
    state,
    stateDisplay,
    riskLevelToday,
    familyMentionsToday,
    lonelinessToday,
    lastUpdatedAt: summary.updatedAt ? new Date(summary.updatedAt).toISOString() : null,
    memoryTeaser: teaser,
    summary: summaryLine,
    suggestedAction: summary.suggestedAction ?? "有空的话，打个电话问候一下。",
    trend,
  };
}

export async function getDailyInsight(elderUserId: string): Promise<{
  date: string;
  overallState: string;
  familyMentions: number;
  lonelinessScore: number;
  healthSignals: number;
  riskLevel: string;
  keyMessages: string[];
  suggestedAction: string;
  signals: string[];
}> {
  await ensureChildTables();
  const prisma = getPrismaClient();
  const today = dayKey(new Date());
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT * FROM "DailySummary" WHERE "elderUserId" = $1 AND "date" = $2 LIMIT 1`,
    elderUserId,
    today,
  )) as Array<{
    overallState: string;
    familyMentions: number;
    lonelinessScore: number;
    healthSignals: number;
    riskLevel: string;
    keyMessages: string;
    suggestedAction: string | null;
  }>;
  const r = rows[0];
  const suggestedAction = r?.suggestedAction ?? "有空的话，打个电话问候一下。";
  const familyMentions = Number(r?.familyMentions ?? 0);
  const lonelinessScore = Number(r?.lonelinessScore ?? 0);
  return {
    date: today,
    overallState: r?.overallState ?? "stable",
    familyMentions,
    lonelinessScore,
    healthSignals: Number(r?.healthSignals ?? 0),
    riskLevel: r?.riskLevel ?? "L1",
    keyMessages: parseJsonArray(r?.keyMessages),
    suggestedAction,
    signals: dailySignals({ familyMentions, lonelinessScore, suggestedAction }),
  };
}

export async function getMemoryCards(elderUserId: string): Promise<Array<{
  id: string;
  content: string;
  tag: string;
  saved: boolean;
  createdAt: string;
}>> {
  await ensureChildTables();
  const prisma = getPrismaClient();
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT "id","content","tag","saved","createdAt" FROM "MemoryCard" WHERE "elderUserId" = $1 ORDER BY "createdAt" DESC LIMIT 20`,
    elderUserId,
  )) as Array<{ id: string; content: string; tag: string; saved: boolean; createdAt: Date }>;
  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    tag: r.tag,
    saved: Boolean(r.saved),
    createdAt: new Date(r.createdAt).toISOString(),
  }));
}

export async function saveMemoryCard(input: { elderUserId: string; id: string }): Promise<boolean> {
  await ensureChildTables();
  const prisma = getPrismaClient();
  const count = (await prisma.$executeRawUnsafe(
    `UPDATE "MemoryCard" SET "saved" = true, "updatedAt" = NOW() WHERE "elderUserId" = $1 AND "id" = $2`,
    input.elderUserId,
    input.id,
  )) as number;
  return count > 0;
}

export async function getNotifications(elderUserId: string): Promise<ChildNotificationItem[]> {
  await ensureChildTables();
  const prisma = getPrismaClient();
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT "id","level","title","message","createdAt","read","contactedAt" FROM "FamilyNotification" WHERE "elderUserId" = $1 ORDER BY "createdAt" DESC LIMIT 30`,
    elderUserId,
  )) as Array<{
    id: string;
    level: string;
    title: string;
    message: string;
    createdAt: Date;
    read: boolean;
    contactedAt: Date | null;
  }>;
  return rows.map((r) => ({
    id: r.id,
    level: (["light", "watch", "risk"].includes(r.level) ? r.level : "light") as "light" | "watch" | "risk",
    title: r.title,
    message: r.message,
    createdAt: new Date(r.createdAt).toISOString(),
    read: Boolean(r.read),
    contactedAt: r.contactedAt ? new Date(r.contactedAt).toISOString() : null,
  }));
}

export async function markNotificationContacted(elderUserId: string, notificationId: string): Promise<boolean> {
  await ensureChildTables();
  const prisma = getPrismaClient();
  const n = await prisma.$executeRawUnsafe(
    `UPDATE "FamilyNotification" SET "contactedAt" = NOW(), "read" = true WHERE "elderUserId" = $1 AND "id" = $2`,
    elderUserId,
    notificationId,
  );
  return Number(n) > 0;
}

/** Marks same-calendar-day notifications (server local date) so dashboard「我已联系」can quiet repeats. */
export async function markTodaysNotificationsContacted(elderUserId: string): Promise<number> {
  await ensureChildTables();
  const prisma = getPrismaClient();
  const n = await prisma.$executeRawUnsafe(
    `UPDATE "FamilyNotification" SET "contactedAt" = NOW(), "read" = true
     WHERE "elderUserId" = $1
       AND "createdAt" >= date_trunc('day', CURRENT_TIMESTAMP)
       AND "contactedAt" IS NULL`,
    elderUserId,
  );
  return Number(n);
}

export async function markNotificationsRead(elderUserId: string): Promise<number> {
  await ensureChildTables();
  const prisma = getPrismaClient();
  return (await prisma.$executeRawUnsafe(
    `UPDATE "FamilyNotification" SET "read" = true WHERE "elderUserId" = $1 AND "read" = false`,
    elderUserId,
  )) as number;
}
