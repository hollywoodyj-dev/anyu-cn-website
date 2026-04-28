export type IndirectExpressionSignal = {
  hasIndirectRestraint: boolean;
  matchedPhrases: string[];
  suggestedHandling: "gentle_surface_feeling" | "normal";
};

const indirectPhrases = [
  "不用管我",
  "唔使理我",
  "不用理我",
  "我都习惯了",
  "我都習慣",
  "没关系",
  "冇所谓",
  "你们忙",
  "你哋忙",
];

export function detectIndirectExpression(text: string): IndirectExpressionSignal {
  const raw = text.trim();
  const matchedPhrases = indirectPhrases.filter((p) => raw.includes(p));
  const hasIndirectRestraint = matchedPhrases.length > 0;
  return {
    hasIndirectRestraint,
    matchedPhrases,
    suggestedHandling: hasIndirectRestraint ? "gentle_surface_feeling" : "normal",
  };
}
