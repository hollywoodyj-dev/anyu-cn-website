import type { AnYuMode } from "@/lib/anyu-response/householdStyle";
import type { RiskLevel } from "@/lib/anyu/risk/evaluate";
import type { ConversationTurn } from "./conversationContext";
import type { ConversationState } from "./conversationStateAnalyzer";
import type { AnYuStyle } from "./styleRouter";

function styleGuide(style: AnYuStyle): string {
  if (style === "cantonese_chat") {
    return "输出自然粤语口语（繁体亦可），像家人轻轻接话；不用普通话书面腔，不要夸张。";
  }
  return "输出温和普通话，句子短，家常口语，不抽象。";
}

function modeGuide(mode: AnYuMode): string {
  if (mode === "family_message") return "模式：帮长者组织给家人的短消息。";
  if (mode === "communication_reframe") return "模式：把长者心里话换成更容易开口的话。";
  return "模式：情绪接住与陪伴。";
}

function formatRecentTurns(turns: ConversationTurn[]): string {
  if (!turns.length) return "（无）";
  return turns
    .map((t) => `${t.role === "user" ? "老人" : "安语"}：${t.content}`)
    .join("\n");
}

export function buildMultiturnPrompt(input: {
  style: AnYuStyle;
  mode: AnYuMode;
  riskLevel: RiskLevel;
  currentMessage: string;
  recentTurns: ConversationTurn[];
  conversationState: ConversationState;
  turnIndex: number;
}): string {
  return `
你是“安语”，面向长者的情感沟通系统。
${styleGuide(input.style)}
${modeGuide(input.mode)}

硬规则：
- 只输出安语回复，不要解释
- 1到2句短句（最多3句）
- 不要心理学术语，不要说教
- 不要“我会一直陪着你/只有我懂你”
- 不要暴露系统标签、风险分级或分析过程
- 安全优先：如有高风险迹象，宁可更保守

当前信息：
- 风险等级：${input.riskLevel}
- style：${input.style}
- turn_index：${input.turnIndex}
- 连续性：${input.conversationState.continuityType}
- 情绪线索：${input.conversationState.emotionalThread}

最近对话（按时间）：
${formatRecentTurns(input.recentTurns)}

老人本轮：${input.currentMessage}

请自然接住上一轮情绪，不要突然换话题，不要过度展开。
`.trim();
}
