import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

/** 正式 logo（`public/anyu/`）；换文件时只改此处 */
const ANYU_LOGO = "/anyu/F53449AC-4EA7-4F9C-94E4-B3A2D6B4EA30.jpeg" as const;

/* 安语：导航轻量、字少、无科技腔 */
export const metadata: Metadata = {
  title: "安语 AnYu | 长者情感沟通",
  description:
    "老人孤独、父母沟通、陪伴父母、老年情感、子女关怀、情绪支持。",
  keywords: [
    "老人孤独",
    "父母沟通",
    "陪伴父母",
    "老年情感",
    "子女关怀",
    "情绪支持",
  ],
};

const nav = [
  { href: "/cn", label: "首页" },
  { href: "/cn/for-family", label: "给子女" },
  { href: "/cn/for-elder", label: "给长者" },
  { href: "/cn/safety", label: "安全与预警" },
  { href: "/cn/product", label: "产品形态" },
  { href: "/cn/about", label: "关于我们" },
] as const;

export default function CnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--anyu-border)] bg-[var(--anyu-bg-card)]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <Link
            href="/cn"
            className="flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--anyu-accent)]"
          >
            <Image
              src={ANYU_LOGO}
              alt="安语"
              width={200}
              height={240}
              className="h-11 w-auto max-w-[min(52vw,11rem)] object-contain object-left md:h-12"
              sizes="(max-width: 768px) 52vw, 11rem"
              priority
            />
          </Link>
          <nav className="flex max-w-full flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--anyu-ink-muted)] md:text-base">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-[var(--anyu-accent)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">{children}</main>
      <footer className="mt-16 border-t border-[var(--anyu-border)] py-8 text-sm text-[var(--anyu-ink-muted)]">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 md:px-6">
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="页脚">
            <Link href="/cn/ethics" className="hover:text-[var(--anyu-accent)]">
              我们的原则
            </Link>
            <Link href="/cn/disclaimer" className="hover:text-[var(--anyu-accent)]">
              免责声明
            </Link>
            <Link href="/cn/safety" className="hover:text-[var(--anyu-accent)]">
              安全与预警
            </Link>
          </nav>
          <p className="text-center">安语</p>
        </div>
      </footer>
    </div>
  );
}
