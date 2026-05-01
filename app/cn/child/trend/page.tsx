import Link from "next/link";
import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";
import { getDashboard } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

export default async function ChildTrendPage() {
  const card = await getDashboard("elder_demo", "妈妈");
  return (
    <ChildAppChrome>
      <h1 className="text-2xl font-semibold mb-1">趋势（近 7 天）</h1>
      <p className="text-sm text-[var(--anyu-ink-muted)] mb-6">数字来自每日摘要，不是逐句聊天。</p>
      <section className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5 space-y-2 text-sm text-[var(--anyu-ink-muted)]">
        <p>
          孤单相关：<span className="font-medium text-[var(--anyu-ink)]">{card.trend.lonely}</span> 次
        </p>
        <p>
          低落倾向日数：<span className="font-medium text-[var(--anyu-ink)]">{card.trend.lowMoodDays}</span> 天
        </p>
        <p>
          提到家人：<span className="font-medium text-[var(--anyu-ink)]">{card.trend.familyMentions}</span> 次
        </p>
        <p>
          身体不适信号：<span className="font-medium text-[var(--anyu-ink)]">{card.trend.health}</span> 次
        </p>
        <p>
          最近一周最高风险：<span className="font-medium text-[var(--anyu-ink)]">{card.trend.lastRiskLevel}</span>
        </p>
      </section>
      <div className="mt-6">
        <Link href="/cn/child" className="rounded-full border px-4 py-2 text-sm">
          返回总览
        </Link>
      </div>
    </ChildAppChrome>
  );
}
