import type { PrismaClient } from "@prisma/client";
import {
  buildConsentSnapshot,
  evaluateFamilyNotificationConsent,
  type FamilyNotificationIntentKind,
} from "@/lib/child-insights/consentGate";
import { getChildSettingsPayload } from "@/lib/child-insights/childSettingsRepository";
import { logFamilyNotificationConsentBlock } from "@/lib/child-insights/notificationConsentAudit";
import type { ChildSettingsPayload } from "@/lib/child-insights/types";

export type NotificationAppendContext = {
  elderUserId: string;
  parentLabel: string;
  highestRisk: "L1" | "L2" | "L3" | "L4";
  lonelyTurnsToday: number;
  familyMentionsToday: number;
  now: Date;
};

const SUGGESTED_ACTION_HINT =
  "可以先温和地问一句：我刚刚想到你，想听听你的声音。";

function iso(d: Date): string {
  return d.toISOString();
}

async function countNotificationsSince(
  prisma: PrismaClient,
  elderUserId: string,
  sinceIso: string,
  level: "light" | "watch" | "risk",
): Promise<number> {
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS c FROM "FamilyNotification" WHERE "elderUserId" = $1 AND "createdAt" >= $2 AND "level" = $3`,
    elderUserId,
    sinceIso,
    level,
  )) as Array<{ c: number }>;
  return Number(rows[0]?.c ?? 0);
}

/** Wisewave V1.1: gentle copy, dedupe; L4 immediate; L3 throttled; L1/L2 daily caps. V1.2: consent gate before insert. */
export async function appendFamilyNotificationIfEligible(
  prisma: PrismaClient,
  ctx: NotificationAppendContext,
): Promise<void> {
  const { elderUserId, parentLabel, highestRisk, lonelyTurnsToday, familyMentionsToday, now } = ctx;
  let payload: ChildSettingsPayload = {};
  try {
    payload = await getChildSettingsPayload(elderUserId);
  } catch {
    payload = {};
  }
  const snapBase = () => buildConsentSnapshot(payload);

  const name = parentLabel.trim() || "家人";
  const nowIso = iso(now);
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();

  const insert = async (level: "light" | "watch" | "risk", title: string, message: string) => {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "FamilyNotification" ("id","elderUserId","level","title","message","read","createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      crypto.randomUUID(),
      elderUserId,
      level,
      title,
      message,
      false,
      nowIso,
    );
  };

  const gatedInsert = async (
    kind: FamilyNotificationIntentKind,
    dbLevel: "light" | "watch" | "risk",
    title: string,
    message: string,
  ) => {
    const decision = evaluateFamilyNotificationConsent(payload, kind);
    if (!decision.allowed) {
      await logFamilyNotificationConsentBlock(prisma, {
        elderUserId,
        intendedKind: kind,
        intendedDbLevel: dbLevel,
        intendedTitle: title,
        intendedMessage: message,
        reason: decision.reason ?? "blocked_by_consent",
        consentSnapshot: { ...snapBase(), status: "blocked_by_consent" },
      });
      return;
    }
    await insert(dbLevel, title, message);
  };

  if (highestRisk === "L4") {
    await gatedInsert(
      "L4_emergency",
      "risk",
      "紧急提醒",
      `紧急提醒：请尽快联系${name}，或联系紧急联系人。${SUGGESTED_ACTION_HINT}`,
    );
    return;
  }

  if (highestRisk === "L3") {
    const recentRisk = await countNotificationsSince(prisma, elderUserId, sixHoursAgo, "risk");
    if (recentRisk === 0) {
      await gatedInsert(
        "L3_risk",
        "risk",
        "需要关注",
        `她今天表达了明显低落或危险情绪。建议尽快主动联系。${SUGGESTED_ACTION_HINT}`,
      );
    }
    return;
  }

  const socialSignal = lonelyTurnsToday >= 2 || familyMentionsToday >= 2;
  if (!socialSignal) return;

  const lightToday = await countNotificationsSince(prisma, elderUserId, dayStart, "light");
  if (lightToday >= 2) return;

  if (lonelyTurnsToday >= 2 && familyMentionsToday >= 2) {
    const watchToday = await countNotificationsSince(prisma, elderUserId, dayStart, "watch");
    if (watchToday === 0) {
      await gatedInsert("watch", "watch", "关注提醒", "她最近几天状态有些低落。可以找个时间联系一下。");
    }
    return;
  }

  if (familyMentionsToday >= 2 && lonelyTurnsToday < 2) {
    await gatedInsert("light", "light", "轻提醒", `${name}今天有点想你。`);
    return;
  }

  if (lonelyTurnsToday >= 2) {
    await gatedInsert(
      "light",
      "light",
      "轻提醒",
      `${name}今天有点孤单。有空的话，可以温柔问一句：今天吃了点什么？`,
    );
  }
}
