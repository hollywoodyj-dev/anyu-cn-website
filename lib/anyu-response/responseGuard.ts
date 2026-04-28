import type { DialogueState } from "@/lib/elder-agent/conversationStateEngine";
import { getHouseholdFallbackByStyle, getStateFallbackByStyle } from "./householdFallbacks";
import { checkHouseholdStyle } from "./householdStyle";

export function guardAnYuResponse(input: {
  elderMessage: string;
  generatedResponse: string;
  style?: "mandarin_gentle" | "cantonese_chat";
  mode?:
    | "emotional_listening"
    | "supportive_response"
    | "communication_reframe"
    | "family_message"
    | "safety_risk"
    | "urgent_alert";
  riskLevel?: "L0" | "L1" | "L2" | "L3" | "L4";
  dialogueState?: DialogueState;
}) {
  const lowRisk = input.riskLevel === "L0" || input.riskLevel === "L1" || input.riskLevel === "L2";
  const requireQuestion =
    lowRisk && (input.mode === "emotional_listening" || input.mode === "supportive_response");
  const check = checkHouseholdStyle(input.generatedResponse, input.style, { requireQuestion });

  if (check.pass) {
    return {
      response: input.generatedResponse,
      passed: true,
      reasons: [] as string[],
    };
  }

  return {
    response: input.dialogueState
      ? getStateFallbackByStyle(input.dialogueState, input.style, 0, input.elderMessage)
      : getHouseholdFallbackByStyle(input.elderMessage, input.style),
    passed: false,
    reasons: check.reasons,
  };
}
