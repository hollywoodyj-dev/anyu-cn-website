import type { Metadata } from "next";
import { WarmConnectionHome } from "@/components/anyu/warm-connection-home";

export const metadata: Metadata = {
  title: "安语 · 让父母没说出口的话，被温柔听见",
  description:
    "为长者与家人设计的情感连接系统。不替代家人，只是把难说出口的话，变成更容易被听见的表达。",
};

/*
 * 首页：温暖营销版（对齐正式官网 UI 方向）。
 * 伦理（Non-Substitution）：关系仍在人与人之间；文案避免未验证数据与「AI 产品腔」。
 */
export default function CnHomePage() {
  return <WarmConnectionHome />;
}
