import Image from "next/image";
import Link from "next/link";
import { BarChart2, Lightbulb, MessageSquare, Mic, Shield, Sparkles } from "lucide-react";

/**
 * 首页：安语灯与子女端 **独立** 展块（在 Hero 主家庭图之下），与设计稿大双卡一致。
 * 图：`/anyu/home/lamp.png`、`/anyu/home/child-app.png`
 */
export function LampAndAppShowcase() {
  return (
    <section
      className="mx-auto max-w-6xl border-t border-[#E8DED4]/80 pb-2 pt-10 md:pt-14"
      aria-labelledby="lamp-app-block-title"
    >
      <h2
        id="lamp-app-block-title"
        className="mb-8 text-center text-2xl font-semibold text-[#342B25] md:mb-10 md:text-3xl"
      >
        安语灯与子女端
      </h2>
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <article className="overflow-hidden rounded-[2rem] border border-white/90 bg-white/75 shadow-lg shadow-[#B08B6C]/10">
          <div className="grid items-center gap-6 p-6 md:min-h-[280px] md:grid-cols-2 md:gap-0 md:p-8">
            <div className="order-2 flex flex-col justify-center space-y-4 md:order-1 md:pr-4">
              <h3 className="text-xl font-semibold text-[#322A24] md:text-2xl">安语灯</h3>
              <ul className="space-y-3 text-sm leading-7 text-[#6D5F55] md:text-base">
                <li className="flex gap-2">
                  <Mic className="mt-0.5 h-5 w-5 shrink-0 text-[#9D6A4D]" aria-hidden />
                  <span>用说话表达想念与不安，慢慢说即可。</span>
                </li>
                <li className="flex gap-2">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[#9D6A4D]" aria-hidden />
                  <span>暖光陪伴，不刺眼，夜里也安心。</span>
                </li>
                <li className="flex gap-2">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[#9D6A4D]" aria-hidden />
                  <span>需要时，让人先回到身边。</span>
                </li>
              </ul>
              <Link
                href="/cn/product#anyu-lamp"
                className="inline-flex w-fit items-center gap-1 text-base font-medium text-[#9D6A4D] underline-offset-4 hover:underline"
              >
                了解更多
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="relative order-1 h-60 w-full max-w-[200px] justify-self-center md:order-2 md:h-72 md:max-w-[240px] md:justify-self-end">
              <Image
                src="/anyu/home/lamp.png"
                alt="安语灯产品"
                fill
                className="object-contain object-center drop-shadow-sm"
                sizes="(max-width: 768px) 200px, 240px"
              />
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-[2rem] border border-white/90 bg-white/75 shadow-lg shadow-[#B08B6C]/10">
          <div className="grid items-center gap-6 p-6 md:min-h-[280px] md:grid-cols-2 md:gap-0 md:p-8">
            <div className="order-2 flex flex-col justify-center space-y-4 md:order-1 md:pr-4">
              <h3 className="text-xl font-semibold text-[#322A24] md:text-2xl">子女端 App</h3>
              <ul className="space-y-3 text-sm leading-7 text-[#6D5F55] md:text-base">
                <li className="flex gap-2">
                  <BarChart2 className="mt-0.5 h-5 w-5 shrink-0 text-[#9D6A4D]" aria-hidden />
                  <span>情绪趋势，看见波动而不是评判。</span>
                </li>
                <li className="flex gap-2">
                  <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-[#9D6A4D]" aria-hidden />
                  <span>轻量提醒，帮你知道何时靠近一点。</span>
                </li>
                <li className="flex gap-2">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#9D6A4D]" aria-hidden />
                  <span>不替你做决定，不打扰父母日常。</span>
                </li>
              </ul>
              <Link
                href="/cn/for-family"
                className="inline-flex w-fit items-center gap-1 text-base font-medium text-[#9D6A4D] underline-offset-4 hover:underline"
              >
                了解更多
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="relative order-1 h-64 w-full max-w-[200px] justify-self-center overflow-hidden rounded-2xl md:order-2 md:h-80 md:max-w-[220px] md:justify-self-end">
              <Image
                src="/anyu/home/child-app.png"
                alt="子女端 App 界面"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 200px, 220px"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
