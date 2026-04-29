import type { ConversationTurn } from "./conversationContext";

export type FamilySlots = {
  targetPerson?: string;
  desiredAction?: "call" | "visit" | "contact_more";
  emotionalNeed?: "miss" | "be_remembered" | "someone_to_talk";
};

function userTexts(recentTurns: ConversationTurn[], currentInput: string): string {
  const recentUser = recentTurns
    .filter((t) => t.role === "user")
    .slice(-5)
    .map((t) => t.content);
  return [...recentUser, currentInput].join(" ");
}

export function extractFamilySlots(recentTurns: ConversationTurn[], currentInput: string): FamilySlots {
  const merged = userTexts(recentTurns, currentInput);
  const current = currentInput;
  const slots: FamilySlots = {};
  if (/儿子|阿仔/.test(merged)) slots.targetPerson = "儿子";
  else if (/女儿|阿女/.test(merged)) slots.targetPerson = "女儿";
  else if (/家人|仔女|孩子|他们|佢哋/.test(merged)) slots.targetPerson = "家人";

  // current input has priority for action update
  if (/打电话|来个电话|听听.*声音|把声/.test(current)) slots.desiredAction = "call";
  else if (/回来|返嚟|见一面|返屋企|坐下/.test(current)) slots.desiredAction = "visit";
  else if (/多联系|多些联系|多关心|多惦记|问候/.test(current)) slots.desiredAction = "contact_more";
  else if (/打电话|来个电话|听听.*声音|把声/.test(merged)) slots.desiredAction = "call";
  else if (/回来|返嚟|见一面|返屋企|坐下/.test(merged)) slots.desiredAction = "visit";
  else if (/多联系|多些联系|多关心|多惦记|问候/.test(merged)) slots.desiredAction = "contact_more";

  if (/想念|挂住|想你|惦记/.test(merged)) slots.emotionalNeed = "miss";
  else if (/在意|记得我|惦记我|关注我/.test(merged)) slots.emotionalNeed = "be_remembered";
  else if (/说话|倾下|聊天|听我/.test(merged)) slots.emotionalNeed = "someone_to_talk";

  return slots;
}

export function hasFilledFamilyIntent(slots: FamilySlots): boolean {
  return Boolean(slots.targetPerson && slots.desiredAction);
}

export function repeatedPreferenceQuestion(recentTurns: ConversationTurn[]): boolean {
  const lastAssistant = recentTurns
    .filter((t) => t.role === "assistant")
    .slice(-5)
    .map((t) => t.content);
  const pattern = /(更想见一面|先通个电话|听到谁的声音|约食餐饭|见一面还是先通个电话)/;
  const hits = lastAssistant.filter((t) => pattern.test(t)).length;
  return hits > 1;
}

export function buildFamilyMessageSuggestion(
  slots: FamilySlots,
  style: "mandarin_gentle" | "cantonese_chat",
): string {
  const person = slots.targetPerson ?? "家里人";
  if (style === "cantonese_chat") {
    if (slots.desiredAction === "call") {
      return `你係想${person}多啲惦记你，得闲打个电话俾你。\n可以咁讲：「最近我有啲挂住你，有空打个电话俾我，听下你把声我就开心。」`;
    }
    if (slots.desiredAction === "visit") {
      return `你係想${person}返嚟坐下，见下面。\n可以咁讲：「你得闲返嚟食餐饭啦，我想见下你，坐一阵就好。」`;
    }
    return `你係想${person}多啲联系你。\n可以咁讲：「最近有啲挂住你，你得闲就同我讲两句，我会好开心。」`;
  }
  if (slots.desiredAction === "call") {
    return `你是想让${person}多惦记你一点，多给你来个电话。\n可以这样说：「最近我有点想你，有空给我打个电话，我听听你的声音就很开心。」`;
  }
  if (slots.desiredAction === "visit") {
    return `你是想让${person}回来见一面、坐一坐。\n可以这样说：「你有空回来吃顿饭吧，我想见见你，坐一会儿就很好。」`;
  }
  return `你是想让${person}多联系你一点。\n可以这样说：「最近有点想你，你有空就跟我说两句，我会很开心。」`;
}

