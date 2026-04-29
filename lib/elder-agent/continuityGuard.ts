import type { ActiveThread } from "./activeThread";

export function continuityGuard(input: {
  response: string;
  activeThread: ActiveThread;
  currentAnchors: string[];
}): { pass: boolean; reason?: string } {
  const r = input.response;
  const usesCurrentAnchor = input.currentAnchors.some((a) => a && r.includes(a));
  const relatesToTopic =
    input.activeThread.topic === "family"
      ? /(家人|仔女|儿子|女儿|电话|联系|返嚟|回來)/.test(r)
      : input.activeThread.topic === "loneliness"
        ? /(没人|冇人|一个人|空|闷|孤单|陪)/.test(r)
        : input.activeThread.topic === "health"
          ? /(不舒服|辛苦|休息|身体|頭暈|头晕)/.test(r)
          : input.activeThread.topic === "story"
            ? /(以前|当年|那时候|慢慢讲|哪一段)/.test(r)
            : input.activeThread.topic === "confused"
              ? /(听不清|听得不太清楚|再说|慢一点)/.test(r)
              : true;

  const genericQuestion = /(今天过得怎么样|现在想聊什么|今天过得还轻松吗|你今天点过|想聊哪件小事)/.test(r);
  if (!usesCurrentAnchor && !relatesToTopic) {
    return { pass: false, reason: "lost_current_anchor_and_thread" };
  }
  if (genericQuestion && (input.activeThread.topic === "family" || input.activeThread.topic === "loneliness")) {
    return { pass: false, reason: "generic_question_on_specific_thread" };
  }
  return { pass: true };
}

