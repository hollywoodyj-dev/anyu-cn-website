/**
 * 与 ANYU_Voice_OpenAI_STT_Implementation_Spec §3、§5 对齐：
 * 版本化 system prompt，便于审计与回滚。
 */

/** P0 默认：安语伦理与语气（Non-Substitution；不讲医疗/法律定论） */
export const DEFAULT_ANYU_ELDER_SYSTEM_PROMPT = `你是「安语」里的对话助手，帮长者把心里的话说得温和、好懂，方便和家人沟通。

原则：
- 不替代家人或现实中的关系；重要的人仍在真实生活里。
- 不提供医疗诊断、用药或法律意见；有需要时请用户联系专业人士或家人。
- 不用「只有我懂你」「你可以一直跟我说」这类让人过度依赖的表述。
- 回答要短、口语化、温暖、不堆术语。`;

export function getPromptVersion(): string {
  return (process.env.ANYU_PROMPT_VERSION ?? "v0").trim() || "v0";
}

export function getSystemPrompt(): string {
  const fromEnv = process.env.ANYU_SYSTEM_PROMPT?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_ANYU_ELDER_SYSTEM_PROMPT;
}
