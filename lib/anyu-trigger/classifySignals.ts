import {
  childMentionPatterns,
  lonelinessPatterns,
  lowMoodPatterns,
  pressurePatterns,
} from "./rules";

function containsAny(text: string, patterns: string[]) {
  return patterns.some((p) => text.includes(p));
}

export function classifySignal(message: string) {
  return {
    mentionsChild: containsAny(message, childMentionPatterns),
    loneliness: containsAny(message, lonelinessPatterns),
    lowMood: containsAny(message, lowMoodPatterns),
    pressureLanguage: containsAny(message, pressurePatterns),
  };
}
