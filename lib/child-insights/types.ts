export type ConversationSignalInput = {
  elderUserId: string;
  sessionId?: string | null;
  text: string;
  riskLevel: "L0" | "L1" | "L2" | "L3" | "L4";
  emotionalThread?: "loneliness" | "missing_family" | "fear_of_burden" | "health_anxiety" | "unclear";
  activeTopic?: "family" | "loneliness" | "health" | "story" | "daily" | "confused";
  indirectExpression?: boolean;
};

export type ConversationSignalRecord = {
  timestamp: number;
  emotion: "neutral" | "low" | "lonely";
  mentionsFamily: boolean;
  healthSignal: boolean;
  indirectExpression: boolean;
  keywords: string[];
  riskLevel: "L0" | "L1" | "L2" | "L3" | "L4";
  memoryCandidate?: string;
  suggestedAction?: string;
  rawText: string;
};

export type ChildContact = {
  id: string;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  priority: number;
};

export type ChildSettingsPayload = {
  parentDisplayName?: string;
  contacts?: ChildContact[];
  reminderTiers?: { L1?: boolean; L2?: boolean; L3?: boolean; L4?: boolean };
  memoryVisibility?: "curated" | "hidden" | "summary_only";
  emergencyContact?: { name?: string; phone?: string };
  consentAcknowledgedAt?: string;
};

export type DashboardCard = {
  parentName: string;
  state: "stable" | "lonely" | "low" | "watch" | "risk";
  summary: string;
  suggestedAction: string;
  trend: {
    lonely: number;
    /** Days in last 7 with overallState === low (V1.1 compact trend). */
    lowMoodDays: number;
    familyMentions: number;
    health: number;
    /** Highest risk tier seen in last 7 daily rows. */
    lastRiskLevel: "L0" | "L1" | "L2" | "L3" | "L4";
  };
};
