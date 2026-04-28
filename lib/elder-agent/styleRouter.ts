export type AnYuStyle = "mandarin_gentle" | "cantonese_chat";

type ResolveStyleInput = {
  explicitStyle?: unknown;
  lang?: string;
  message: string;
};

export function resolveAnYuStyle(input: ResolveStyleInput): AnYuStyle {
  if (input.explicitStyle === "cantonese_chat") return "cantonese_chat";
  if (input.explicitStyle === "mandarin_gentle") return "mandarin_gentle";

  const l = (input.lang ?? "").toLowerCase();
  if (l.startsWith("zh-hk") || l.startsWith("yue")) return "cantonese_chat";

  // Lightweight Cantonese markers for no-style clients.
  if (/[唔冇咁喺佢哋啲]/.test(input.message)) {
    return "cantonese_chat";
  }
  return "mandarin_gentle";
}
