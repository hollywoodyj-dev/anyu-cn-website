import type { PendingTaskState } from "./pendingTask";

export function containsAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => n && h.includes(n.toLowerCase()));
}

const GREETING_RESET = [
  "今天过得还轻松吗",
  "今天有沒有什麼特別",
  "今天有没有什么特别",
  "见到你就好",
  "今天还好吗",
  "你现在在家吗",
  "今天过得怎么样",
  "今天过得怎麼樣",
  "今天过得还好吗",
];

export function containsGreetingReset(text: string): boolean {
  return GREETING_RESET.some((p) => text.includes(p));
}

export function extractMainAnchors(userInput: string, pending: PendingTaskState | null): string[] {
  const anchors: string[] = [];
  if (pending?.topic) anchors.push(pending.topic);
  const dishes = userInput.match(/[\u4e00-\u9fa5]{2,10}(肉|排骨|鸡|雞|鱼|魚|汤|湯|菜|饭|飯|豆腐)/g);
  if (dishes) anchors.push(...dishes);
  const named = userInput.match(/红烧肉|白切鸡|蒸鱼|番茄炒蛋|排骨/);
  if (named) anchors.push(named[0]);
  const uniq = [...new Set(anchors.map((a) => a.trim()).filter(Boolean))];
  return uniq;
}

export function isResponseRelatedToTask(response: string, task: PendingTaskState): boolean {
  const r = response;
  if (task.type === "recipe") {
    return /(做法|切|煮|炖|焖|炒|酱油|醬油|姜|五花肉|焯水|燜|步骤|简单|教你|教埋|讲俾|讲给|听你说)/.test(r);
  }
  if (task.type === "joke") {
    return /(笑话|笑話|有个人|好笑|哈哈|从前|有一日|有一天)/.test(r);
  }
  if (task.type === "family_message") {
    return /(可以这样说|可以咁讲|你可以说|发一句|打电话|回来吃饭|返嚟食饭|有空|得闲)/.test(r);
  }
  if (task.type === "story") {
    return /(以前|那时候|那時候|慢慢讲|慢慢講|听你说|聽你講|发生什么|發生咩事)/.test(r);
  }
  if (task.type === "question_answer") {
    return r.length >= 10 && !containsGreetingReset(r);
  }
  return true;
}

export type ContextBindingResult = { pass: true } | { pass: false; reason: string };

function userSoundsDistressed(text: string): boolean {
  return /没人|冇人|无人|无人理|唔理我|不理我|孤单|寂寞|无聊|唔开心|不舒服|难受|挂念|挂住|生气|火大|不在乎|忽略|心灰意冷|成日都|不明白|听唔明|听不懂/.test(
    text,
  );
}

function responseHasInappropriatePositiveDrift(response: string): boolean {
  return /那挺好|那挺好的|听起来不错|几好啊|几好吖|好好啊|唔错啊|唔错/.test(response);
}

export function contextBindingGuard(input: {
  response: string;
  userInput: string;
  pending: PendingTaskState | null;
  turnIndex: number;
  recentTurnCount: number;
}): ContextBindingResult {
  const { response, userInput, pending, turnIndex, recentTurnCount } = input;

  if (userSoundsDistressed(userInput) && responseHasInappropriatePositiveDrift(response)) {
    return { pass: false, reason: "tone_mismatch" };
  }

  if (pending?.status === "pending") {
    if (!isResponseRelatedToTask(response, pending)) {
      return { pass: false, reason: "pending_task_not_completed" };
    }
  }

  const anchors = extractMainAnchors(userInput, pending);
  const taskOk = pending?.status === "pending" && isResponseRelatedToTask(response, pending);
  if (anchors.length > 0 && !containsAny(response, anchors) && turnIndex > 1 && !taskOk) {
    const cookingOk =
      /(做法|切|煮|炖|焖|炒|焯水|酱油|姜|肉)/.test(response) &&
      (pending?.type === "recipe" || /肉|煮|做|菜/.test(userInput));
    if (!cookingOk) {
      return { pass: false, reason: "current_anchor_missing" };
    }
  }

  if (
    containsGreetingReset(response) &&
    (turnIndex >= 2 || recentTurnCount >= 2 || userSoundsDistressed(userInput))
  ) {
    return { pass: false, reason: "greeting_reset" };
  }

  return { pass: true };
}
