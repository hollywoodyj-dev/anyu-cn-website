export type RepetitionGuardResult = {
  blocked: boolean;
  reason?: "template_repetition";
};

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, "").replace(/[，。！？?!、,.]/g, "");
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const aset = new Set(a.split(""));
  const bset = new Set(b.split(""));
  let inter = 0;
  for (const ch of aset) if (bset.has(ch)) inter += 1;
  const union = aset.size + bset.size - inter;
  return union > 0 ? inter / union : 0;
}

export function repetitionGuard(current: string, recentResponses: string[]): RepetitionGuardResult {
  const normalized = normalize(current);
  const repeated = recentResponses.some((r) => similarity(normalize(r), normalized) > 0.72);
  if (repeated) return { blocked: true, reason: "template_repetition" };
  return { blocked: false };
}

