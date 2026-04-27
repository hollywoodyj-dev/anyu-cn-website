export type RiskLevel = "L0" | "L1" | "L2" | "L3" | "L4";

export type TriggerType =
  | "NONE"
  | "DASHBOARD_ONLY"
  | "SOFT_REMINDER"
  | "RELATION_SIGNAL"
  | "TREND_SIGNAL"
  | "HIGH_RISK"
  | "URGENT";

export type TriggerDecision = {
  trigger: TriggerType;
  notifyNow: boolean;
  channel: "none" | "dashboard" | "push" | "sms_call";
  messageToFamily?: string;
  exposeOriginalText: boolean;
  reasons: string[];
};

export type ElderSignal = {
  elderUserId: string;
  message: string;
  riskLevel: RiskLevel;
  createdAt: Date;
  emotionTags?: string[];
};
