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
  if (/麻烦|打扰|唔想煩/.test(text)) return "fear_of_burden";
  if (/仔女|儿子|女儿|孩子|家人|掛住|挂住/.test(text)) return "missing_family";
  if (/痛|累|头晕|唔舒服|睡|瞓/.test(text)) return "health_anxiety";
  if (/没人|冇人|孤单|无聊|静|冷清|闷/.test(text)) return "loneliness";
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
  const prev = detectThread(previousUser?.content ?? "");
  const continuityType =
    prev === "unclear"
      ? "new_topic"
      : prev === current
        ? "same_emotion"
        : current === "unclear"
          ? "same_topic"
          : "emotional_shift";
  return {
    emotionalThread: current,
    continuityType,
    shouldReferencePreviousTurn: continuityType === "same_emotion" || continuityType === "same_topic",
    shouldAvoidOverExplaining: true,
  };
}
