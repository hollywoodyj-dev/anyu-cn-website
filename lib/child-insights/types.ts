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

export type DashboardCard = {
  parentName: string;
  state: "stable" | "lonely" | "low" | "watch" | "risk";
  summary: string;
  suggestedAction: string;
  trend: {
    lonely: number;
    familyMentions: number;
    health: number;
  };
};
