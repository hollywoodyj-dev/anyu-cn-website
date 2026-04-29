export type DirectRequestType =
  | "recipe"
  | "joke"
  | "family_message"
  | "question_answer"
  | "story"
  | "none";

/** Ordered: first match wins (Nova V6). */
export function detectDirectRequest(input: string): DirectRequestType {
  const t = input.trim();
  if (/(怎么做|點整|点整|教我做|做法|红烧肉|煮)/.test(t)) return "recipe";
  if (/(笑话|講個笑話|讲个笑话|逗我笑)/.test(t)) return "joke";
  if (/(怎么说|點講|点讲|帮我说|发给|打电话|回来吃饭)/.test(t)) return "family_message";
  if (/(以前|当年|嗰阵|小时候|年轻时)/.test(t)) return "story";
  if (/(什么|为什么|能不能|可以吗|你觉得|告诉我)/.test(t)) return "question_answer";
  return "none";
}

export function extractMainTopic(input: string, request: DirectRequestType): string | undefined {
  if (request === "recipe") {
    const m = input.match(/[\u4e00-\u9fa5]{2,12}(肉|排骨|鸡|雞|鱼|魚|汤|湯|菜|饭|飯|豆腐)/);
    if (m) return m[0];
  }
  if (request === "story") {
    const m = input.match(/(以前[^。！？]{0,16}|当年[^。！？]{0,16}|小时候[^。！？]{0,16})/);
    if (m) return m[0].slice(0, 20);
  }
  const short = input.trim().slice(0, 12);
  if (short.length >= 2 && /^[\u4e00-\u9fa5]+$/.test(short)) return short;
  return undefined;
}
