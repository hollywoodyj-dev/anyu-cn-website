export type AnYuMode =
  | "emotional_listening"
  | "supportive_response"
  | "communication_reframe"
  | "family_message"
  | "safety_risk"
  | "urgent_alert";

export type HouseholdStyleCheck = {
  pass: boolean;
  reasons: string[];
};

const forbiddenWords = [
  "孤独",
  "焦虑",
  "空虚",
  "心理",
  "情绪结构",
  "认知",
  "创伤",
  "潜意识",
  "你应该",
  "你必须",
  "你要",
  "建议你",
  "因为",
  "也许",
  "可能是因为",
  "我会一直陪着你",
  "只有我懂你",
];

const abstractWords = [
  "价值感",
  "意义感",
  "被忽视感",
  "内在",
  "模式",
  "关系议题",
  "情绪机制",
];

export function checkHouseholdStyle(response: string): HouseholdStyleCheck {
  const reasons: string[] = [];
  const trimmed = response.trim();
  if (!trimmed) {
    return { pass: false, reasons: ["回应为空"] };
  }

  const sentences = trimmed
    .split(/[。！？!?]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length > 2) {
    reasons.push("回应超过2句");
  }

  for (const s of sentences) {
    if (s.length > 18) {
      reasons.push(`句子太长：${s}`);
    }
  }

  const forbiddenHits = forbiddenWords.filter((w) => trimmed.includes(w));
  if (forbiddenHits.length > 0) {
    reasons.push(`包含禁用词：${forbiddenHits.join("、")}`);
  }

  const abstractHits = abstractWords.filter((w) => trimmed.includes(w));
  if (abstractHits.length > 0) {
    reasons.push(`包含抽象词：${abstractHits.join("、")}`);
  }

  return {
    pass: reasons.length === 0,
    reasons,
  };
}
