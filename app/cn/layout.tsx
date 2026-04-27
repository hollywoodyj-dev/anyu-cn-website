import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Circle, MessageCircle, Send } from "lucide-react";

/** Mockup 对齐：header / footer 使用同款无字 logo */
const ANYU_LOGO_MARK = "/anyu/mockup/anyu-logo-no-font.png" as const;

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
  { href: "/cn/for-family", label: "子女端 App" },
  { href: "/cn/safety", label: "安全与隐私" },
  { href: "/cn/about", label: "关于我们" },
] as const;

export default function CnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <header className="border-b border-[#E8DDD0] bg-[#FDF8F3]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link
            href="/cn"
            aria-label="安语首页"
            className="flex shrink-0 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--anyu-accent)]"
          >
            <Image
              src={ANYU_LOGO_MARK}
              alt=""
              width={76}
              height={76}
              className="h-[62px] w-[62px] shrink-0 object-contain"
              sizes="62px"
              priority
            />
            <div className="leading-tight">
              <div className="text-[1.75rem] font-semibold text-[#2D2D2D]">安语</div>
              <div className="text-[0.7rem] tracking-wide text-[#8B7E74]">让爱，被听见</div>
            </div>
          </Link>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3 md:gap-6">
            <nav
              className="hidden max-w-full flex-wrap justify-end gap-x-8 gap-y-1 text-sm text-[#8B7E74] md:flex"
              aria-label="主导航"
            >
              {nav.map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap pb-1 transition-colors hover:text-[#2D2D2D] ${
                    idx === 0 ? "border-b-2 border-[#D4A574] font-medium text-[#2D2D2D]" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/cn/product"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#D4A574] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#C4956A]"
            >
              申请试用
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">{children}</main>
      <footer className="border-t border-[#E8DDD0] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-sm text-[#8B7E74] md:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <Image src={ANYU_LOGO_MARK} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#2D2D2D]">安语 AnYu</span>
              <span className="text-sm text-[#8B7E74]">让爱，被听见</span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-6">
            <Link href="/cn/ethics" className="transition-colors hover:text-[#2D2D2D]">
              我们的原则
            </Link>
            <Link href="/cn/disclaimer" className="transition-colors hover:text-[#2D2D2D]">
              免责声明
            </Link>
            <Link href="/cn/safety" className="transition-colors hover:text-[#2D2D2D]">
              安全与预警
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span>© 2024 AnYu. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4" />
              <Circle className="h-4 w-4 fill-current stroke-none" />
              <Send className="h-4 w-4" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
