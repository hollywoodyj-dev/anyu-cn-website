import type { RiskLevel } from "@/lib/anyu/risk/evaluate";
import type { ConversationTurn } from "./conversationContext";

export type EmotionalThread =
  | "loneliness"
  | "missing_family"
  | "fear_of_burden"
  | "health_anxiety"
  | "unclear";

export type ConversationState = {
  emotionalThread: EmotionalThread;
  continuityType: "same_emotion" | "same_topic" | "emotional_shift" | "risk_escalation" | "new_topic";
  shouldReferencePreviousTurn: boolean;
  shouldAvoidOverExplaining: boolean;
};

function detectThread(text: string): EmotionalThread {
  if (/麻烦|麻煩|打扰|唔想煩|不想麻烦|怕麻烦/.test(text)) return "fear_of_burden";
  if (/仔女|儿子|女儿|孩子|家人|佢哋|你哋|掛住|挂住|想佢哋|返嚟/.test(text)) return "missing_family";
  if (/痛|累|头晕|頭暈|唔舒服|不舒服|睡|瞓|失眠|唔夠精神/.test(text)) return "health_anxiety";
  if (/没人|冇人|孤单|孤單|无聊|無聊|静|冷清|闷|悶|空落落|空空地|找谁说|没人可说|冇人倾|冇人講/.test(text)) {
    return "loneliness";
  }
  return "unclear";
}

function isCarryForwardReply(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (t.length <= 6) return true;
  return /^(是啊|嗯|嗯嗯|对啊|係啊|係呀|係|好啊|好呀|都係|然后呢|係咁|唔知|不知道)[。！!，,]*$/.test(t);
}

function latestNonUnclearUserThread(turns: ConversationTurn[]): EmotionalThread {
  const users = [...turns].reverse().filter((t) => t.role === "user");
  for (const u of users) {
    const thread = detectThread(u.content);
    if (thread !== "unclear") return thread;
  }
  return "unclear";
}

export function analyzeConversationState(args: {
  recentTurns: ConversationTurn[];
  currentMessage: string;
  currentRiskLevel: RiskLevel;
}): ConversationState {
  if (args.currentRiskLevel === "L3" || args.currentRiskLevel === "L4") {
    return {
      emotionalThread: "unclear",
      continuityType: "risk_escalation",
      shouldReferencePreviousTurn: false,
      shouldAvoidOverExplaining: true,
    };
  }
  const current = detectThread(args.currentMessage);
  const previousUser = [...args.recentTurns].reverse().find((t) => t.role === "user");
  const prevImmediate = detectThread(previousUser?.content ?? "");
  const prev = prevImmediate === "unclear" ? latestNonUnclearUserThread(args.recentTurns) : prevImmediate;
  const inferredCurrent =
    current === "unclear" && prev !== "unclear" && isCarryForwardReply(args.currentMessage) ? prev : current;
  const continuityType =
    prev === "unclear"
      ? "new_topic"
      : prev === inferredCurrent
        ? "same_emotion"
        : inferredCurrent === "unclear"
          ? "same_topic"
          : "emotional_shift";
  return {
    emotionalThread: inferredCurrent,
    continuityType,
    shouldReferencePreviousTurn: continuityType === "same_emotion" || continuityType === "same_topic",
    shouldAvoidOverExplaining: true,
  };
}
