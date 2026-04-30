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
    case "family_message":
      return /(可以这样说|可以咁讲|你可以说|发一句|电话|吃饭|返嚟|得闲|有空)/.test(r) && r.length >= 16;
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
  if (currentTurnIndex === pending.createdAtTurn) return pending;
  if (isPendingTaskCompleted(response, pending)) {
    return { ...pending, status: "answered" };
  }
  return pending;
}
