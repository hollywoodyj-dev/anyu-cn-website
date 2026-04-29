import type { AnYuStyle } from "../styleRouter";
import type { PendingTaskState } from "./pendingTask";

/** Context-aware fallback when model / guards fail — never generic upstream error tone. */
export function taskAwareSafeFallback(
  style: AnYuStyle,
  pending: PendingTaskState | null,
  userInput: string,
): string {
  const t = pending?.type;
  if (t === "recipe") {
    return style === "cantonese_chat"
      ? "可以啊。我简单说：先将肉切块焯水，再加姜片、酱油同少少糖慢慢焖。你想清淡定浓味啲？"
      : "可以啊。我简单说：先把肉切块焯水，再加姜片、酱油和一点糖慢慢炖。你想做清淡一点，还是味道重一点？";
  }
  if (t === "joke") {
    return style === "cantonese_chat"
      ? "可以啊，我讲个轻松的：有个人煮饭唔记得放米，大家等咗好耐，结果等到一锅热水。"
      : "可以啊，我讲个轻松的：有个人煮饭忘了放米，大家等了半天，结果等到一锅热水。";
  }
  if (t === "family_message") {
    return style === "cantonese_chat"
      ? "可以轻轻讲一句：「你今晚忙唔忙？方便嘅话，返嚟食餐饭，我煮咗餸。」"
      : "可以轻轻说一句：“你今晚忙不忙？如果方便，回来吃顿饭，我做了菜。”";
  }
  const tail = userInput.trim().slice(0, 24);
  return style === "cantonese_chat"
    ? `我听着呢。你刚刚讲嘅「${tail}」，可以慢慢讲。`
    : `我听着呢。你刚刚说的「${tail}」，可以慢慢讲。`;
}
