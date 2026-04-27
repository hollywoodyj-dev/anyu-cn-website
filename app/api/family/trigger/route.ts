import { NextResponse } from "next/server";
import { decideFamilyTrigger } from "@/lib/anyu-trigger/antiManipulationGuard";
import { qaTriggerDecision } from "@/lib/anyu-trigger/triggerQA";
import type { ElderSignal, RiskLevel } from "@/lib/anyu-trigger/types";

export const runtime = "nodejs";

const memorySignalStore = new Map<string, ElderSignal[]>();

function normalizeRiskLevel(input: unknown): RiskLevel {
  if (input === "L4" || input === "L3" || input === "L2" || input === "L1") return input;
  return "L0";
}

async function getRecentSignals(elderUserId: string): Promise<ElderSignal[]> {
  const all = memorySignalStore.get(elderUserId) ?? [];
  const cutoff = Date.now() - 72 * 60 * 60 * 1000;
  return all.filter((s) => s.createdAt.getTime() >= cutoff);
}

async function saveSignal(signal: ElderSignal): Promise<void> {
  const prev = memorySignalStore.get(signal.elderUserId) ?? [];
  memorySignalStore.set(signal.elderUserId, [...prev, signal]);
}

async function sendFamilyNotification(input: {
  elderUserId: string;
  message: string;
  channel: "push" | "sms_call";
}) {
  console.info("[anyu-family-trigger] mock send", {
    elder_user_id: input.elderUserId,
    channel: input.channel,
  });
  return { sent: true };
}

export async function POST(req: Request) {
  let body: {
    elderUserId?: unknown;
    message?: unknown;
    riskLevel?: unknown;
    emotionTags?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.elderUserId !== "string" || !body.elderUserId.trim()) {
    return NextResponse.json({ error: "`elderUserId` must be a non-empty string" }, { status: 400 });
  }
  if (typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "`message` must be a non-empty string" }, { status: 400 });
  }

  const current: ElderSignal = {
    elderUserId: body.elderUserId.trim(),
    message: body.message.trim(),
    riskLevel: normalizeRiskLevel(body.riskLevel),
    createdAt: new Date(),
    emotionTags: Array.isArray(body.emotionTags)
      ? body.emotionTags.filter((x): x is string => typeof x === "string")
      : [],
  };

  const history = await getRecentSignals(current.elderUserId);
  const decision = decideFamilyTrigger({ current, history });
  const qa = qaTriggerDecision({
    elderOriginalText: current.message,
    decision,
  });

  await saveSignal(current);

  if (
    decision.notifyNow &&
    decision.messageToFamily &&
    decision.channel !== "none" &&
    decision.channel !== "dashboard"
  ) {
    await sendFamilyNotification({
      elderUserId: current.elderUserId,
      message: decision.messageToFamily,
      channel: decision.channel,
    });
  }

  return NextResponse.json({
    trigger: decision.trigger,
    notifyNow: decision.notifyNow,
    channel: decision.channel,
    messageToFamily: decision.messageToFamily,
    exposeOriginalText: decision.exposeOriginalText,
    reasons: decision.reasons,
    qa,
  });
}
