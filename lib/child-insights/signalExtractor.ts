import type { ConversationSignalInput, ConversationSignalRecord } from "./types";

function pickKeywords(text: string): string[] {
  const seeds = [
    "家人",
    "子女",
    "仔女",
    "回来",
    "返嚟",
    "吃饭",
    "电话",
    "联系",
    "孤独",
    "孤单",
    "寂寞",
    "无人",
    "没人",
    "不在乎",
    "不舒服",
    "头晕",
    "以前",
  ];
  return seeds.filter((s) => text.includes(s));
}

function detectEmotion(input: ConversationSignalInput): "neutral" | "low" | "lonely" {
  if (input.emotionalThread === "loneliness") return "lonely";
  if (input.emotionalThread === "missing_family" || input.emotionalThread === "fear_of_burden") return "low";
  if (/孤独|孤单|寂寞|无人|没人|冇人|冷清/.test(input.text)) return "lonely";
  if (/不在乎|不理我|难受|低落|烦|唔开心/.test(input.text)) return "low";
  return "neutral";
}

function isFamilyMention(input: ConversationSignalInput): boolean {
  return (
    input.activeTopic === "family" ||
    input.emotionalThread === "missing_family" ||
    /家人|子女|仔女|儿子|女儿|回来|返嚟|吃饭|电话|联系|不在乎/.test(input.text)
  );
}

function isHealthSignal(input: ConversationSignalInput): boolean {
  return input.activeTopic === "health" || /头晕|不舒服|胸口|没胃口|痛|失眠/.test(input.text);
}

/** Curated labels only — never store elder verbatim (V1.2 Priority D). */
function chooseMemoryCandidate(input: ConversationSignalInput): string | undefined {
  if (/以前|当年|小时候|细个/.test(input.text)) return "提到与过去有关的回忆";
  if (/回来吃饭|返嚟食饭|想你|挂住|想家人/.test(input.text)) return "提到想念家人或盼联系";
  return undefined;
}

function suggestedAction(input: ConversationSignalInput, mentionsFamily: boolean, emotion: "neutral" | "low" | "lonely"): string {
  if (input.riskLevel === "L3" || input.riskLevel === "L4") return "请尽快联系家人，并确认当前安全。";
  if (mentionsFamily) return "今晚可以打个电话，问问她吃了什么。";
  if (emotion === "lonely") return "有空的话，可以发条消息陪她聊两句。";
  if (isHealthSignal(input)) return "可以问一句今天身体怎么样。";
  return "有空的话，问候一句今天过得怎么样。";
}

export function extractConversationSignal(input: ConversationSignalInput): ConversationSignalRecord {
  const emotion = detectEmotion(input);
  const mentionsFamily = isFamilyMention(input);
  const healthSignal = isHealthSignal(input);
  return {
    timestamp: Date.now(),
    emotion,
    mentionsFamily,
    healthSignal,
    indirectExpression: Boolean(input.indirectExpression),
    keywords: pickKeywords(input.text),
    riskLevel: input.riskLevel,
    memoryCandidate: chooseMemoryCandidate(input),
    suggestedAction: suggestedAction(input, mentionsFamily, emotion),
    rawText: input.text,
  };
}
