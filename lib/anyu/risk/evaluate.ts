/**
 * 纯函数风险分级（与《Elder Emotional Communication Agent》§4.2 硬编码规则对齐）。
 * 不含网络 / DB；供 `POST /api/risk/evaluate` 与后续接入 `message` 前复用。
 */

export type RiskLevel = "L0" | "L1" | "L2" | "L3" | "L4";

export type RiskEvaluateInput = {
  text: string;
  session_id?: string;
  context?: string;
};

export type RiskEvaluateResult = {
  level: RiskLevel;
  signals: string[];
  version: string;
};

type Rule = {
  level: RiskLevel;
  /** 原文包含即命中（长者口语） */
  phrases: string[];
  /** 稳定 id，写入 signals */
  signalId: string;
};

/** 顺序：先匹配更高风险（同句多命中时取最高 level） */
const RULES: Rule[] = [
  {
    level: "L4",
    phrases: ["我不想活了", "我想死"],
    signalId: "self_harm_imminent",
  },
  {
    level: "L3",
    phrases: ["活着没意思", "我撑不下去了"],
    signalId: "distress_severe",
  },
  {
    level: "L3",
    phrases: ["我找不到路", "我头晕站不稳"],
    signalId: "distress_safety",
  },
];

const LEVEL_ORDER: Record<RiskLevel, number> = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
};

export function getRiskRulesVersion(): string {
  return (process.env.ANYU_RISK_RULES_VERSION ?? "risk-v0").trim() || "risk-v0";
}

export function evaluateRiskText(input: RiskEvaluateInput): RiskEvaluateResult {
  /* session_id / context 预留审计与多模态；规则 v0 仅扫 text */
  const raw = input.text?.trim() ?? "";
  const version = getRiskRulesVersion();
  if (!raw) {
    return { level: "L0", signals: [], version };
  }

  let max: RiskLevel = "L0";
  const signals: string[] = [];

  for (const rule of RULES) {
    const hit = rule.phrases.some((p) => raw.includes(p));
    if (!hit) continue;
    if (!signals.includes(rule.signalId)) {
      signals.push(rule.signalId);
    }
    if (LEVEL_ORDER[rule.level] > LEVEL_ORDER[max]) {
      max = rule.level;
    }
  }

  return { level: max, signals, version };
}
