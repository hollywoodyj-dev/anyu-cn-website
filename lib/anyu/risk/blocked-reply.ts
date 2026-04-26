import type { RiskLevel } from "./evaluate";

/** L3/L4：不走普通 LLM 闲聊，与《Elder Emotional Communication Agent》§6.5 一致（引导真人、不继续聊）。 */
export function isRiskChatBlocked(level: RiskLevel): level is "L3" | "L4" {
  return level === "L3" || level === "L4";
}

export function getRiskBlockedAssistantMessage(level: "L3" | "L4"): string {
  if (level === "L4") {
    return [
      "我很担心你现在的安全。",
      "请不要一个人撑着。",
      "",
      "请现在就联系家人、朋友，或当地的紧急求助。",
      "我不能替代他们在身边，但真人可以马上帮到你。",
    ].join("\n");
  }
  return [
    "我有点担心你现在的状态。",
    "你不需要一个人撑着。",
    "",
    "请联系家人或一个你信任的人，让他们陪陪你。",
    "先停下来，和真人讲一讲，好吗？",
  ].join("\n");
}
