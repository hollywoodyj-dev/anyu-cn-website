import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

/** 圆形标（`public/anyu/`）；全站头图与 favicon 可与此一致 */
const ANYU_LOGO_MARK = "/anyu/anyu-logo-mark.png" as const;

/* 安语：导航清晰、字少、无科技腔；宽版式便于首页营销栅格 */
export const metadata: Metadata = {
  title: "安语 AnYu | 让爱，被听见",
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
  { href: "/cn/product", label: "产品介绍" },
  { href: "/cn/product#anyu-lamp", label: "安语灯" },
  { href: "/cn/for-elder", label: "给长者" },
  { href: "/cn/for-family", label: "子女端 App" },
  { href: "/cn/safety", label: "安全与隐私" },
  { href: "/cn/about", label: "关于我们" },
] as const;

export default function CnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--anyu-bg)]">
      <header className="border-b border-[var(--anyu-border)] bg-[var(--anyu-bg-card)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link
            href="/cn"
            aria-label="安语首页"
            className="flex shrink-0 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--anyu-accent)]"
          >
            <Image
              src={ANYU_LOGO_MARK}
              alt=""
              width={48}
              height={48}
              className="h-11 w-auto max-h-11 shrink-0 object-contain object-left"
              sizes="(max-width: 768px) 48px, 56px"
              priority
            />
            <div className="leading-tight">
              <div className="text-lg font-medium text-[var(--anyu-ink)]">安语</div>
              <div className="text-xs tracking-wide text-[var(--anyu-ink-muted)]">让爱，被听见</div>
            </div>
          </Link>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3 md:gap-5">
            <nav
              className="flex max-w-full flex-wrap justify-end gap-x-3 gap-y-1 text-sm text-[var(--anyu-ink-muted)] md:gap-x-5 md:text-base"
              aria-label="主导航"
            >
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap hover:text-[var(--anyu-accent)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/cn/product"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#9D6A4D] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#8a5d43] md:px-5"
            >
              申请试用
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">{children}</main>
      <footer className="mt-16 border-t border-[var(--anyu-border)] py-8 text-sm text-[var(--anyu-ink-muted)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 md:px-6">
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
