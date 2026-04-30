import type { AnYuStyle } from "../styleRouter";
import type { PendingTaskState } from "./pendingTask";

/** Context-aware fallback when model / guards fail — never generic upstream error tone. */
export function taskAwareSafeFallback(
  style: AnYuStyle,
  pending: PendingTaskState | null,
  userInput: string,
): string {
  const t = pending?.type;
  if (t === "family_message") {
    return style === "cantonese_chat"
      ? "可以轻轻讲一句：「你今晚忙唔忙？方便嘅话，返嚟食餐饭，我煮咗餸。」"
      : "可以轻轻说一句：“你今晚忙不忙？如果方便，回来吃顿饭，我做了菜。”";
  }
  if (/(怎么做|點整|点整|教我做|做法|煮|红烧肉|笑话|講個笑話|讲个笑话|逗我笑)/.test(userInput)) {
    return style === "cantonese_chat"
      ? "听得出你想把日子过得有烟火气。\n你今晚係咪都想有人一齐食饭？"
      : "听得出你是想把日子过得有点烟火气。\n你今晚是不是也想有人一起吃饭？";
  }
  const tail = userInput.trim().slice(0, 24);
  return style === "cantonese_chat"
    ? `我听到你刚讲「${tail}」。\n你而家最想同屋企人讲边一句？`
    : `我听到你刚刚说「${tail}」。\n你现在最想和家里人说哪一句？`;
}
