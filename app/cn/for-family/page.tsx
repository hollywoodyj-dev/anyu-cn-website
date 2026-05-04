import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Clock3, PhoneCall, TrendingUp } from "lucide-react";
import { CTAButton, EmotionList, TextBlock } from "@/components/anyu";

/* 给子女：不替代照护者；只帮助被听见。 */
export default function ForFamilyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-12">
      <header className="space-y-3">
        <h1 className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">
          子女端 App：让你更早听见父母近况
        </h1>
        <p className="text-[var(--anyu-ink-muted)]">
          不替代照护责任，只把需要你在场的时候，提前告诉你。
        </p>
        <p className="text-sm text-[var(--anyu-ink-muted)]">
          <Link href="/cn/child" className="font-medium text-[var(--anyu-accent)] underline-offset-4 hover:underline">
            在浏览器打开家人页
          </Link>
          ，查看今日近况与提醒（演示数据）。
        </p>
      </header>

      <section className="grid gap-6 rounded-3xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5 md:grid-cols-[1.1fr_0.9fr] md:p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">父母今天近况</h2>
          <div className="rounded-2xl border border-[var(--anyu-border)] bg-white p-4 md:p-5">
            <p className="text-sm text-[var(--anyu-ink-muted)]">今日主状态</p>
            <p className="mt-2 text-2xl font-medium text-[var(--anyu-ink)]">有点想你</p>
            <p className="mt-3 text-[var(--anyu-ink-muted)]">
              情绪偏低但可沟通，建议今天抽 5-10 分钟通话，先听她说几句。
            </p>
          </div>
          <TextBlock>
            <p>父母不是没有话，而是常常：</p>
          </TextBlock>
          <EmotionList items={["不敢说", "不想麻烦", "怕你太忙"]} />
        </div>
        <div className="relative mx-auto h-[300px] w-full max-w-[220px] overflow-hidden rounded-3xl border border-[var(--anyu-border)] bg-white">
          <Image
            src="/anyu/home/child-app.png"
            alt="子女端 App 界面示意"
            fill
            className="object-cover object-top"
            sizes="220px"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2" aria-labelledby="core-functions">
        <h2 id="core-functions" className="sr-only">
          核心功能
        </h2>
        <article className="rounded-3xl border border-[var(--anyu-border)] bg-white p-5 md:p-6">
          <div className="flex items-center gap-2 text-[var(--anyu-accent)]">
            <TrendingUp className="h-5 w-5" aria-hidden />
            <h3 className="text-lg font-medium text-[var(--anyu-ink)]">父母状态图与分析</h3>
          </div>
          <svg viewBox="0 0 320 90" className="mt-4 w-full text-[#c59e82]" aria-hidden>
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              points="0,66 36,60 72,56 108,50 144,43 180,38 216,35 252,30 288,28 320,24"
            />
          </svg>
          <p className="mt-3 text-[var(--anyu-ink-muted)]">
            看到趋势变化，而不是看大量聊天细节。重点是“是否需要你靠近一点”。
          </p>
        </article>

        <article className="rounded-3xl border border-[var(--anyu-border)] bg-white p-5 md:p-6">
          <div className="flex items-center gap-2 text-[var(--anyu-accent)]">
            <Clock3 className="h-5 w-5" aria-hidden />
            <h3 className="text-lg font-medium text-[var(--anyu-ink)]">通话建议</h3>
          </div>
          <ul className="mt-4 space-y-3 text-[var(--anyu-ink-muted)]">
            <li className="rounded-2xl bg-[var(--anyu-bg-card)] px-4 py-3">
              <span className="font-medium text-[var(--anyu-ink)]">建议时间：</span>今晚 19:30-20:00
            </li>
            <li className="rounded-2xl bg-[var(--anyu-bg-card)] px-4 py-3">
              <span className="font-medium text-[var(--anyu-ink)]">建议开场：</span>“妈，我刚好有几分钟，想听你说说今天。”
            </li>
            <li className="rounded-2xl bg-[var(--anyu-bg-card)] px-4 py-3">
              <span className="font-medium text-[var(--anyu-ink)]">建议内容：</span>先听感受，再问一句“我能怎么帮你？”
            </li>
          </ul>
        </article>
      </section>

      <section
        className="rounded-3xl border border-[#f2c7c7] bg-[#fff7f7] p-5 md:p-6"
        aria-labelledby="emergency"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#b85858]" aria-hidden />
          <h2 id="emergency" className="text-xl font-medium text-[#8f3d3d] md:text-2xl">
            紧急情况
          </h2>
        </div>
        <p className="mt-3 text-[#8f3d3d]">
          当父母出现高风险信号（如“我不想活了”“我撑不下去了”），系统会停止普通建议，优先提示你立即联系真人并视情况求助当地紧急服务。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#9D6A4D] px-5 py-3 text-white"
          >
            <PhoneCall className="h-4 w-4" aria-hidden />
            立即联系父母
          </button>
          <p className="self-center text-sm text-[#8f3d3d]">此提醒不会替你做决定，只提醒你该在场了。</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        <CTAButton href="/cn/child">打开家人页</CTAButton>
        <CTAButton href="/cn/lamp-voice">进入语音体验</CTAButton>
        <CTAButton href="/cn/product">绑定父母设备</CTAButton>
      </div>
    </div>
  );
}
