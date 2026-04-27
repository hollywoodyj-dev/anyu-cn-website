export function buildFamilySafeMessage(input: {
  signal: "loneliness" | "relation" | "trend" | "risk";
  riskLevel?: string;
}) {
  switch (input.signal) {
    case "loneliness":
      return "她今天有点安静。可以找个合适的时候，打个电话。";

    case "relation":
      return "她今天提到你。语气有点低落。";

    case "trend":
      return "最近几天，她有点低落。可以温和地联系一下。";

    case "risk":
      return `她今天表达了明显低落或危险情绪。建议尽快联系她。风险等级：${input.riskLevel}`;

    default:
      return "她今天状态有点变化。可以轻轻关心一下。";
  }
}
