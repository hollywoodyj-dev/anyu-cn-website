import { detectDirectRequest, extractMainTopic, type DirectRequestType } from "./directRequest";

export type PendingTaskState = {
  type: DirectRequestType;
  status: "pending" | "answered";
  topic?: string;
  createdAtTurn: number;
};

/** Short replies that mean “go on” while a task is still open (incl.「好的，你说」). */
const AFFIRM =
  /^(好|好的|好的[，,]?\s*(你说|你說|讲|講)|可以|你说|你說|讲吧|講吧|嗯|行|哦|好嘅|好啊|好啊你讲|嗯嗯|ok)\s*$/i;

function isPendingTaskCompleted(response: string, pending: PendingTaskState): boolean {
  const r = response;
  switch (pending.type) {
    case "recipe": {
      const concrete =
        /(焯|烫|烫水|切块|切丁).{0,60}(酱油|生抽|老抽|酱|姜|糖)/.test(r) ||
        /(先|再|然后|跟住).{0,25}(切|煮|炖|焖|焯)/.test(r);
      const longSteps = r.length >= 55 && /(切|煮|炖|焖|分钟|分鐘|步骤|加水)/.test(r);
      return concrete || longSteps;
    }
    case "joke":
      return (/(笑话|笑話|有个人|从前|有一日|有一天)/.test(r) || r.length > 40) && r.length >= 22;
    case "family_message":
      return /(可以这样说|可以咁讲|你可以说|发一句|电话|吃饭|返嚟|得闲|有空)/.test(r) && r.length >= 16;
    case "story":
      return /(以前|那时候|慢慢|听你说|聽你講|讲)/.test(r) && r.length >= 22;
    case "question_answer":
      return r.length >= 28 && !/(今天过得还轻松吗|见到你就好|今天有没有什么特别)/.test(r);
    default:
      return false;
  }
}

export function mergePendingTask(
  userText: string,
  turnIndex: number,
  previous: PendingTaskState | null,
): PendingTaskState | null {
  const trimmed = userText.trim();
  if (AFFIRM.test(trimmed) && previous?.status === "pending") {
    return previous;
  }
  const request = detectDirectRequest(userText);
  if (request !== "none") {
    return {
      type: request,
      status: "pending",
      topic: extractMainTopic(userText, request),
      createdAtTurn: turnIndex,
    };
  }
  if (previous?.status === "pending") {
    return previous;
  }
  return null;
}

/**
 * Marks answered when the task is substantively done.
 * Recipe: never clears on the **same** `turn_index` as the request, so a first reply like
 * “我教你 / 简单说法” stays pending until the next user turn (e.g.「好的，你说」) can receive steps.
 */
export function markPendingAnsweredIfDone(
  response: string,
  pending: PendingTaskState | null,
  currentTurnIndex: number,
): PendingTaskState | null {
  if (!pending || pending.status !== "pending") return pending;
  if (pending.type === "recipe" && currentTurnIndex === pending.createdAtTurn) {
    return pending;
  }
  if (isPendingTaskCompleted(response, pending)) {
    return { ...pending, status: "answered" };
  }
  return pending;
}
