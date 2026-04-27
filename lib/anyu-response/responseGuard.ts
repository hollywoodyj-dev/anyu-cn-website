import { getHouseholdFallback } from "./householdFallbacks";
import { checkHouseholdStyle } from "./householdStyle";

export function guardAnYuResponse(input: {
  elderMessage: string;
  generatedResponse: string;
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
    response: getHouseholdFallback(input.elderMessage),
    passed: false,
    reasons: check.reasons,
  };
}
