import type { ChildStateDisplay } from "./types";

export function resolveChildStateDisplay(args: {
  overallState: string;
  riskLevel: string;
  familyMentionsToday: number;
  lonelinessToday: number;
}): ChildStateDisplay {
  const r = args.riskLevel;
  if (r === "L4") return "urgent";
  if (r === "L3") return "risk";
  if (args.overallState === "risk") return "risk";
  if (args.overallState === "watch") return "watch";
  if (args.overallState === "low") return "low";
  if (args.overallState === "lonely") {
    return args.familyMentionsToday >= 1 ? "missing_family" : "lonely";
  }
  if (args.familyMentionsToday >= 2) return "missing_family";
  if (args.familyMentionsToday >= 1 && args.lonelinessToday >= 1) return "missing_family";
  return "steady";
}

/** Curated dashboard copy — no diagnosis, no blame (Nova 子女端). */
export function chipLabelFor(display: ChildStateDisplay): string {
  const m: Record<ChildStateDisplay, string> = {
    steady: "平稳",
    lonely: "有点孤单",
    missing_family: "有点想家人",
    low: "有点低落",
    watch: "需要关注",
    risk: "风险提醒",
    urgent: "紧急提醒",
  };
  return m[display];
}

export function dashboardHeroCopy(input: {
  parentName: string;
  display: ChildStateDisplay;
}): {
  primaryFeeling: string;
  overallNote: string;
  body: string;
  suggestLead: string;
  suggestExample: string;
} {
  const { parentName, display } = input;
  const n = parentName || "家人";
  switch (display) {
    case "urgent":
      return {
        primaryFeeling: "紧急提醒",
        overallNote: `请尽快联系${n}，或联系紧急联系人 / 护理人员。`,
        body: "如果无法联系到她，请考虑联系附近家人、邻居或当地紧急服务。",
        suggestLead: "可以先说：",
        suggestExample: "“我刚刚想到你，想听听你的声音。”",
      };
    case "risk":
      return {
        primaryFeeling: "风险提醒",
        overallNote: `${n}今天表达了明显低落或危险情绪。`,
        body: "建议你尽快主动联系她。语气轻一点，不要追问。",
        suggestLead: "可以先说：",
        suggestExample: "“我刚刚想到你，想听听你的声音。”",
      };
    case "watch":
      return {
        primaryFeeling: "需要关注",
        overallNote: `${n}最近几天有些低落。`,
        body: "这种状态不是今天才出现，最近出现得比以前多一点。",
        suggestLead: "建议：",
        suggestExample: "今天尽量主动联系一下，不必说很多。",
      };
    case "low":
      return {
        primaryFeeling: "有点低落",
        overallNote: `${n}今天情绪有点沉。`,
        body: "可能只是累了，也可能需要多一点陪伴。",
        suggestLead: "可以：",
        suggestExample: "发个短消息，问问今天过得怎么样。",
      };
    case "lonely":
      return {
        primaryFeeling: "有点孤单",
        overallNote: `${n}今天提到家里比较安静。`,
        body: "可能想有人陪她说几句。",
        suggestLead: "可以：",
        suggestExample: "打个短电话，听她说几句就好。",
      };
    case "missing_family":
      return {
        primaryFeeling: "有点想家人",
        overallNote: `${n}今天提到想一家人一起吃饭。`,
        body: "这可能是想见你们的表达。",
        suggestLead: "可以问一句：",
        suggestExample: "“今晚吃了什么？最近想不想一起吃顿饭？”",
      };
    default:
      return {
        primaryFeeling: "平稳",
        overallNote: `${n}今天整体平稳。`,
        body: "她今天有简单说话，没有明显风险信号。",
        suggestLead: "建议：",
        suggestExample: "有空可以发一句问候。",
      };
  }
}

export function suggestActionCard(input: { display: ChildStateDisplay }): { title: string; hint: string } {
  const { display } = input;
  if (display === "urgent" || display === "risk") {
    return { title: "她今天可能需要", hint: "你尽快联系她，或联系紧急联系人。" };
  }
  if (display === "missing_family") {
    return { title: "她今天可能需要", hint: "一个轻轻的电话" };
  }
  if (display === "lonely") {
    return { title: "她今天可能需要", hint: "有人听她说几句" };
  }
  return { title: "她今天可能需要", hint: "一个轻轻的电话" };
}

export function dailySignals(input: {
  familyMentions: number;
  lonelinessScore: number;
  suggestedAction: string;
}): string[] {
  const s: string[] = [];
  if (input.familyMentions > 0) s.push("提到家人");
  if (input.lonelinessScore > 0) s.push("有轻微孤单感");
  if (/吃|饭|餐|晚饭|午饭|一起/.test(input.suggestedAction)) s.push("提到吃饭");
  return s.length ? s : ["状态较平稳"];
}
