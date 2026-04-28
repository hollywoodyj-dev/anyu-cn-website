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

type AnYuStyle = "mandarin_gentle" | "cantonese_chat";

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

const overusedClosingPhrases = [
  "先静一小会儿",
  "慢慢来",
  "先坐一阵",
  "先坐一会",
];

function checkStyleConsistency(response: string, style?: AnYuStyle): string[] {
  if (!style) return [];
  const reasons: string[] = [];
  const t = response.trim();
  const cantoMarkers = /[佢哋冇唔咗喺嘅啲咁呀啦喇]/;
  const mandarinMarkers = /(你们|他们|不会|是不是|怎么|什么|这样|这个|那个|吗|呢\?)/;

  if (style === "cantonese_chat") {
    if (!cantoMarkers.test(t)) {
      reasons.push("粤语风格不足（缺少粤语口语特征）");
    }
    if (mandarinMarkers.test(t) && !cantoMarkers.test(t)) {
      reasons.push("包含明显普通话句式");
    }
  } else {
    if (cantoMarkers.test(t)) {
      reasons.push("普通话风格不稳（夹杂粤语口语）");
    }
  }
  return reasons;
}

export function checkHouseholdStyle(
  response: string,
  style?: AnYuStyle,
  opts?: { requireQuestion?: boolean },
): HouseholdStyleCheck {
  const reasons: string[] = [];
  const trimmed = response.trim();
  if (!trimmed) {
    return { pass: false, reasons: ["回应为空"] };
  }

  const sentences = trimmed
    .split(/[。！？!?]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const questionCount = (trimmed.match(/[？?]/g) ?? []).length;
  if (questionCount > 1) {
    reasons.push("提问超过1个");
  }
  if (opts?.requireQuestion && questionCount < 1) {
    reasons.push("缺少回球问题");
  }

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
  const overusedHits = overusedClosingPhrases.filter((w) => trimmed.includes(w));
  if (overusedHits.length > 0) {
    reasons.push(`包含高频收尾语：${overusedHits.join("、")}`);
  }
  reasons.push(...checkStyleConsistency(trimmed, style));

  return {
    pass: reasons.length === 0,
    reasons,
  };
}
