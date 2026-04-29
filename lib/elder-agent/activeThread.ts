import type { ConversationTurn } from "./conversationContext";

export type ActiveThread = {
  topic: "family" | "loneliness" | "health" | "story" | "daily" | "confused";
  emotionalAnchor?: string;
  peopleMentioned?: string[];
  keyPhrase?: string;
  lastUserNeed?: string;
};

const topicMatchers: Record<ActiveThread["topic"], RegExp> = {
  family: /仔女|儿子|女儿|孩子|家人|佢哋|你哋|打电话|聯絡|联系|返嚟|不回来|不来看/,
  loneliness: /没人|冇人|孤单|孤單|无聊|無聊|空落落|空空的|就剩我|没人在家|在意我/,
  health: /头痛|腰痛|胸口|头晕|頭暈|唔舒服|不舒服|没胃口|食唔落|失眠/,
  story: /以前|嗰阵|当年|细个|年轻时|那时候/,
  daily: /你好|天气|市场|买了|出去|今天|而家|刚刚|食咗|吃了/,
  confused: /听不清|唔清楚|再讲|再說|刚刚没听清|嗯啊嗯|没八死个/,
};

function topicFromText(text: string): ActiveThread["topic"] {
  if (topicMatchers.story.test(text)) return "story";
  if (topicMatchers.health.test(text)) return "health";
  if (topicMatchers.family.test(text)) return "family";
  if (topicMatchers.loneliness.test(text)) return "loneliness";
  if (topicMatchers.confused.test(text)) return "confused";
  return "daily";
}

function emotionalAnchor(text: string): string | undefined {
  if (/冇用|没用|无用/.test(text)) return "低价值感";
  if (/没人|冇人|忽略|不在意|在意我/.test(text)) return "被忽略";
  if (/孤单|孤單|空落落|一个人/.test(text)) return "孤独";
  if (/挂住|掛住|想念/.test(text)) return "挂念家人";
  if (/怕|紧张|慌/.test(text)) return "不安";
  return undefined;
}

function extractPeople(text: string): string[] {
  const out: string[] = [];
  if (/仔女|孩子/.test(text)) out.push("仔女");
  if (/儿子/.test(text)) out.push("儿子");
  if (/女儿/.test(text)) out.push("女儿");
  if (/家人/.test(text)) out.push("家人");
  return out;
}

function pickKeyPhrase(text: string): string | undefined {
  const keys = ["冇用", "没用", "没人", "冇人", "打电话", "不回来", "就剩我一个", "没人在家"];
  for (const k of keys) {
    if (text.includes(k)) return k;
  }
  return undefined;
}

function inferNeed(text: string): string | undefined {
  if (/没人|冇人|听我|关注|在意/.test(text)) return "想被听见";
  if (/打电话|返嚟|不回来/.test(text)) return "想被联系";
  if (/以前|当年|细个/.test(text)) return "想讲回忆";
  if (/不舒服|头痛|累/.test(text)) return "想被关心";
  return undefined;
}

export function buildActiveThread(recentTurns: ConversationTurn[], currentInput: string): ActiveThread {
  const recentUser = [...recentTurns]
    .reverse()
    .filter((t) => t.role === "user")
    .slice(0, 3)
    .map((t) => t.content)
    .reverse();
  const merged = [...recentUser, currentInput].join(" ");
  const topic = topicFromText(merged);
  const people = Array.from(new Set(extractPeople(merged)));
  return {
    topic,
    emotionalAnchor: emotionalAnchor(merged),
    peopleMentioned: people.length ? people : undefined,
    keyPhrase: pickKeyPhrase(currentInput) ?? pickKeyPhrase(merged),
    lastUserNeed: inferNeed(merged),
  };
}

export function extractCurrentAnchors(currentInput: string): string[] {
  const anchors: string[] = [];
  const samples = ["没人", "冇人", "冇用", "没用", "打电话", "不回来", "返嚟", "不舒服", "头晕", "以前", "当年"];
  for (const s of samples) {
    if (currentInput.includes(s)) anchors.push(s);
  }
  if (!anchors.length && currentInput.length > 1) anchors.push(currentInput.slice(0, Math.min(6, currentInput.length)));
  return anchors;
}

