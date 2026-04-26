import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "安语 · 让父母的话，被温柔听见",
  description:
    "老人孤独、父母沟通、陪伴父母、老年情感、子女关怀、情绪支持。安语帮助家庭重新表达与倾听。",
  icons: {
    icon: "/anyu/F53449AC-4EA7-4F9C-94E4-B3A2D6B4EA30.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
