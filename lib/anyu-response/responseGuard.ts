import { getHouseholdFallbackByStyle } from "./householdFallbacks";
import { checkHouseholdStyle } from "./householdStyle";

export function guardAnYuResponse(input: {
  elderMessage: string;
  generatedResponse: string;
  style?: "mandarin_gentle" | "cantonese_chat";
}) {
  const check = checkHouseholdStyle(input.generatedResponse);

  if (check.pass) {
    return {
      response: input.generatedResponse,
      passed: true,
      reasons: [] as string[],
    };
  }

  return {
    response: getHouseholdFallbackByStyle(input.elderMessage, input.style),
    passed: false,
    reasons: check.reasons,
  };
}
