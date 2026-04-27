import { classifySignal } from "./classifySignals";
import { buildFamilySafeMessage } from "./familyMessage";
import type { ElderSignal, TriggerDecision } from "./types";

const riskRank = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
} as const;

function withinHours(date: Date, hours: number) {
  const now = Date.now();
  return now - date.getTime() <= hours * 60 * 60 * 1000;
}

function countRecent(
  history: ElderSignal[],
  matcher: (s: ElderSignal) => boolean,
  hours: number,
) {
  return history.filter((s) => withinHours(s.createdAt, hours) && matcher(s)).length;
}

/**
 * AnYu must not become a behavior trigger.
 * It should turn pressure language into gentle connection signals.
 */
export function decideFamilyTrigger(input: {
  current: ElderSignal;
  history: ElderSignal[];
}): TriggerDecision {
  const { current, history } = input;
  const signal = classifySignal(current.message);

  if (current.riskLevel === "L4") {
    return {
      trigger: "URGENT",
      notifyNow: true,
      channel: "sms_call",
      exposeOriginalText: false,
      messageToFamily: buildFamilySafeMessage({
        signal: "risk",
        riskLevel: current.riskLevel,
      }),
      reasons: ["L4 urgent risk"],
    };
  }

  if (current.riskLevel === "L3") {
    return {
      trigger: "HIGH_RISK",
      notifyNow: true,
      channel: "push",
      exposeOriginalText: false,
      messageToFamily: buildFamilySafeMessage({
        signal: "risk",
        riskLevel: current.riskLevel,
      }),
      reasons: ["L3 high risk"],
    };
  }

  const recentLoneliness = countRecent(history, (s) => classifySignal(s.message).loneliness, 48);
  const recentLowMood = countRecent(history, (s) => classifySignal(s.message).lowMood, 72);
  const recentPressureLanguage = countRecent(
    history,
    (s) => classifySignal(s.message).pressureLanguage,
    72,
  );

  if (signal.pressureLanguage && recentPressureLanguage >= 2) {
    return {
      trigger: "DASHBOARD_ONLY",
      notifyNow: false,
      channel: "dashboard",
      exposeOriginalText: false,
      messageToFamily: "她最近有些想被看见。可以找个自然的时间联系。",
      reasons: [
        "Repeated pressure language detected",
        "Prevent direct reinforcement loop",
      ],
    };
  }

  if (signal.mentionsChild && riskRank[current.riskLevel] <= 2) {
    return {
      trigger: "RELATION_SIGNAL",
      notifyNow: true,
      channel: "push",
      exposeOriginalText: false,
      messageToFamily: buildFamilySafeMessage({ signal: "relation" }),
      reasons: ["Child/family mentioned"],
    };
  }

  if (recentLowMood >= 3) {
    return {
      trigger: "TREND_SIGNAL",
      notifyNow: true,
      channel: "push",
      exposeOriginalText: false,
      messageToFamily: buildFamilySafeMessage({ signal: "trend" }),
      reasons: ["Low mood trend across 72h"],
    };
  }

  if (signal.loneliness && recentLoneliness >= 2) {
    return {
      trigger: "SOFT_REMINDER",
      notifyNow: false,
      channel: "dashboard",
      exposeOriginalText: false,
      messageToFamily: buildFamilySafeMessage({ signal: "loneliness" }),
      reasons: ["Repeated loneliness across 48h"],
    };
  }

  return {
    trigger: "NONE",
    notifyNow: false,
    channel: "none",
    exposeOriginalText: false,
    reasons: ["No trigger"],
  };
}
