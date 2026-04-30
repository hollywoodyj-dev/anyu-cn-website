export type DirectRequestType =
  | "family_message"
  | "none";

/** V7 tighten: only family-connection phrasing is treated as a pending task. */
export function detectDirectRequest(input: string): DirectRequestType {
  const t = input.trim();
  if (/(怎么说|點講|点讲|帮我说|帮我发|發俾|发给|打电话|回来吃饭|返嚟食飯|返嚟食饭)/.test(t)) {
    return "family_message";
  }
  return "none";
}

export function extractMainTopic(input: string, request: DirectRequestType): string | undefined {
  if (request === "family_message") {
    const m = input.match(/(家人|子女|仔女|儿子|女儿|吃饭|返嚟|回来|电话|联系)/);
    if (m) return m[0];
  }
  const short = input.trim().slice(0, 12);
  if (short.length >= 2 && /^[\u4e00-\u9fa5]+$/.test(short)) return short;
  return undefined;
}
