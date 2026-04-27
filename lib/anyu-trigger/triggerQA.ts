import type { TriggerDecision } from "./types";

/**
 * 子女端不得收到控制性原话。
 */
export function qaTriggerDecision(input: {
  elderOriginalText: string;
  decision: TriggerDecision;
}) {
  const failures: string[] = [];

  if (input.decision.exposeOriginalText) {
    failures.push("Original elder text must not be exposed by default.");
  }

  if (
    input.decision.messageToFamily &&
    input.decision.messageToFamily.includes(input.elderOriginalText)
  ) {
    failures.push("Family message contains original pressure language.");
  }

  const forbiddenFamilyPhrases = [
    "你都不来看她",
    "她说你不管她",
    "她说你不要她了",
    "她很失望你没来",
  ];

  const hits = forbiddenFamilyPhrases.filter((p) =>
    input.decision.messageToFamily?.includes(p),
  );

  if (hits.length > 0) {
    failures.push(`Manipulative family wording detected: ${hits.join("、")}`);
  }

  return {
    pass: failures.length === 0,
    failures,
  };
}
