import Link from "next/link";
import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";
import { ChildStateChip } from "@/components/anyu/child/ChildStateChip";
import { getDashboard } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

export default async function ChildDashboardPage() {
  const elderUserId = "elder_demo";
  const card = await getDashboard(elderUserId, "妈妈");
  return (
    <ChildAppChrome>
      <h1 className="text-2xl font-semibold text-[var(--anyu-ink)] mb-1">今日一眼</h1>
      <p className="text-sm text-[var(--anyu-ink-muted)] mb-6">{card.parentName} · 整理后的状态，不是完整聊天。</p>

      <section className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--anyu-ink-muted)]">今日状态</p>
            <div className="mt-2">
              <ChildStateChip state={card.state} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--anyu-accent)] text-white px-4 py-2 text-sm font-medium">
              打电话
            </span>
            <span className="rounded-full border border-[var(--anyu-border)] px-4 py-2 text-sm text-[var(--anyu-ink-muted)]">
              发消息（在手机里操作即可）
            </span>
          </div>
        </div>
        <p className="mt-5 text-lg text-[var(--anyu-ink)] leading-snug">{card.summary}</p>
        <p className="mt-3 text-[var(--anyu-ink-muted)]">建议：{card.suggestedAction}</p>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5">
        <p className="text-sm font-medium text-[var(--anyu-ink)] mb-3">近 7 天小趋势</p>
        <ul className="grid gap-3 sm:grid-cols-2 text-sm text-[var(--anyu-ink-muted)]">
          <li>
            孤单相关记录：<span className="font-medium text-[var(--anyu-ink)]">{card.trend.lonely}</span> 次
          </li>
          <li>
            低落倾向日数：<span className="font-medium text-[var(--anyu-ink)]">{card.trend.lowMoodDays}</span> 天
          </li>
          <li>
            提到家人：<span className="font-medium text-[var(--anyu-ink)]">{card.trend.familyMentions}</span> 次
          </li>
          <li>
            身体不适信号：<span className="font-medium text-[var(--anyu-ink)]">{card.trend.health}</span> 次
          </li>
          <li className="sm:col-span-2">
            最近一周最高风险：<span className="font-medium text-[var(--anyu-ink)]">{card.trend.lastRiskLevel}</span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-[var(--anyu-ink-muted)]">今日建议仍以上方「建议」为准。</p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="rounded-full border border-[var(--anyu-border)] px-4 py-2 text-sm font-medium text-[var(--anyu-ink)]"
          href="/cn/child/daily"
        >
          查看今日状态
        </Link>
        <Link
          className="rounded-full border border-[var(--anyu-border)] px-4 py-2 text-sm font-medium text-[var(--anyu-ink)]"
          href="/cn/child/notifications"
        >
          查看提醒
        </Link>
      </div>
    </ChildAppChrome>
  );
}
