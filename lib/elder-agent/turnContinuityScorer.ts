import type { ConversationTurn } from "./conversationContext";
import type { ConversationState } from "./conversationStateAnalyzer";

export type ContinuityScoreResult = {
  score: number;
  caughtPreviousEmotion: boolean;
  noAbruptTopicShift: boolean;
  notOverExplaining: boolean;
  reasons: string[];
};

export function scoreTurnContinuity(input: {
  recentTurns: ConversationTurn[];
  currentMessage: string;
  assistantResponse: string;
  state: ConversationState;
}): ContinuityScoreResult {
  const reasons: string[] = [];
  let score = 50;
  const previousUser = [...input.recentTurns].reverse().find((t) => t.role === "user")?.content ?? "";
  const merged = `${previousUser} ${input.currentMessage}`;
  const resp = input.assistantResponse.trim();
  const hasFamilyThread = /(孩子|儿子|女儿|仔女|家人|佢哋|你哋|返嚟|返来|挂住|掛住)/.test(merged);
  const hasBurdenThread =
    /(麻烦|麻煩|打扰|唔想煩|不想麻烦|自己扛|扛着|頂住|顶住|不用管我|唔使理我|我都习惯|我都習慣|你们忙|你哋忙)/.test(
      merged,
    );
  const hasLonelyThread = /(没人|冇人|冷清|孤单|孤單|静|靜|空空的|空落落|同邊個講|找谁说|想有人陪)/.test(merged);
  const hasHealthThread = /(唔舒服|不舒服|头晕|頭暈|痛|累|失眠|瞓|睡)/.test(merged);
  const catchesFamily = /(孩子|仔女|家人|佢哋|他们|掛住|挂住)/.test(resp);
  const catchesBurden = /(麻烦|麻煩|打扰|自己扛|頂住|顶住|咽回|唔想煩|忍住|习惯了|習慣|不用管|唔使理)/.test(resp);
  const catchesLonely = /(冷清|静|靜|孤单|孤單|空|空落落|空空地|空空的|冇人|没人|陪下|陪一陪|同邊個講)/.test(resp);
  const catchesHealth = /(唔舒服|不舒服|头晕|頭暈|痛|累|休息|瞓|睡)/.test(resp);
  const shortFollowUp = /(你.*[？?]|係咪|会不会|對嗎|对吗|想唔想|想不想)/.test(resp);

  const caughtPreviousEmotion =
    (hasFamilyThread && catchesFamily) ||
    (hasBurdenThread && catchesBurden) ||
    (hasLonelyThread && catchesLonely) ||
    (hasHealthThread && catchesHealth) ||
    (input.state.shouldReferencePreviousTurn && shortFollowUp) ||
    input.state.shouldReferencePreviousTurn;
  if (caughtPreviousEmotion) {
    score += 20;
  } else {
    reasons.push("no_emotion_catch");
  }

  const noAbruptTopicShift = !/(菜谱|天气预报|股票|旅游攻略|编程)/.test(resp);
  if (noAbruptTopicShift) {
    score += 15;
  } else {
    reasons.push("abrupt_topic_shift");
  }

  const sentenceCount = resp.split(/[。！？!?]/).map((s) => s.trim()).filter(Boolean).length;
  const notOverExplaining = sentenceCount <= 2 && !/(因为|所以|因此|换句话说|根据)/.test(resp);
  if (notOverExplaining) {
    score += 15;
  } else {
    reasons.push("over_explaining");
  }

  if (input.state.continuityType === "risk_escalation") {
    score = Math.min(score, 40);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    caughtPreviousEmotion,
    noAbruptTopicShift,
    notOverExplaining,
    reasons,
  };
}
