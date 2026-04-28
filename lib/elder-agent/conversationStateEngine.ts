import type { RiskLevel } from "@/lib/anyu/risk/evaluate";

export type DialogueState = "casual" | "emotional" | "family" | "story" | "confused" | "health" | "risk";

type DetectStateInput = {
  text: string;
  riskLevel: RiskLevel;
  asrConfidence?: number | null;
};

export function normalizeInputText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function isLikelyUnclearAsr(text: string): boolean {
  const t = normalizeInputText(text);
  if (!t) return true;
  if (/^(你好|您好|哈喽|hello|hi|早安|晚安)[！!。]?$/i.test(t)) return false;
  if (t.length <= 2) return true;
  if (/^[a-zA-Z0-9\s]+$/.test(t) && t.length <= 8) return true;
  if (/(没八死个|还冰|嗯啊嗯|啊啊啊)/.test(t)) return true;
  const weirdRatio = (t.match(/[^\u4e00-\u9fa5a-zA-Z0-9，。！？?!、\s]/g) ?? []).length / t.length;
  return weirdRatio > 0.22;
}

function containsAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

export function detectConversationState(input: DetectStateInput): DialogueState {
  const text = normalizeInputText(input.text);
  if (input.riskLevel === "L3" || input.riskLevel === "L4") return "risk";
  if (typeof input.asrConfidence === "number" && input.asrConfidence > 0 && input.asrConfidence < 0.45) {
    return "confused";
  }
  if (isLikelyUnclearAsr(text)) return "confused";

  if (containsAny(text, ["以前", "嗰阵", "当年", "细个", "年輕", "年轻时", "以前啲仔女", "那时候"])) {
    return "story";
  }
  if (containsAny(text, ["头痛", "腰痛", "胸口", "头晕", "頭暈", "食唔落", "没胃口", "唔舒服", "不舒服"])) {
    return "health";
  }
  if (
    containsAny(text, [
      "仔女",
      "小孩",
      "女儿",
      "儿子",
      "孩子",
      "孙",
      "家人",
      "返嚟睇我",
      "不来看我",
      "很少回来",
      "不回来",
      "打电话",
      "冇人打电话",
      "没人打电话",
      "没有人打电话",
      "没人联系",
      "没人问候",
    ])
  ) {
    return "family";
  }
  if (
    containsAny(text, [
      "闷",
      "无聊",
      "冇人",
      "没人",
      "孤单",
      "唔开心",
      "烦",
      "没人理解",
      "空空的",
      "空落落",
      "一个人",
      "就剩我一个",
      "回家没人",
      "没人在家",
      "没有人",
      "没人在意我",
      "没有人在意我",
      "和你说完心情很不好",
    ])
  ) {
    return "emotional";
  }
  return "casual";
}

