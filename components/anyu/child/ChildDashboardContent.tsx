import Link from "next/link";
import type { ChildStateDisplay, DashboardCard } from "@/lib/child-insights/types";
import { dashboardHeroCopy, suggestActionCard } from "@/lib/child-insights/childUiCopy";
import { ChildStateChip } from "@/components/anyu/child/ChildStateChip";
import { ChildDashboardQuickActions } from "@/components/anyu/child/ChildDashboardQuickActions";
import { formatTodayLineZh, formatUpdatedClockZh } from "@/components/anyu/child/childDateFormat";

function overallPillLabel(display: ChildStateDisplay): string {
  if (display === "urgent" || display === "risk") return "请尽快关心";
  if (display === "watch" || display === "low") return "需要多一点陪伴";
  return "平稳";
}

type Props = {
  card: DashboardCard;
  elderUserId: string;
};

export function ChildDashboardContent({ card, elderUserId }: Props) {
  const hero = dashboardHeroCopy({ parentName: card.parentName, display: card.stateDisplay });
  const need = suggestActionCard({ display: card.stateDisplay });
  const updated = formatUpdatedClockZh(card.lastUpdatedAt);
  const riskNone =
    card.trend.lastRiskLevel === "L0" || card.trend.lastRiskLevel === "L1" || card.trend.lastRiskLevel === "L2";

  return (
    <>
      <p className="text-sm text-[var(--anyu-ink-muted)] mb-5">今天 {formatTodayLineZh()}</p>

      <section className="rounded-[1.35rem] bg-[var(--child-card-hero)] p-5 shadow-[var(--child-card-shadow)] ring-1 ring-black/[0.04]">
        <div className="flex gap-4">
          <div
            className="h-16 w-16 shrink-0 rounded-full bg-[var(--anyu-bg-card)] ring-1 ring-[var(--anyu-border)]"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[var(--anyu-ink-muted)]">{card.parentName}今天的状态</p>
            <div className="mt-2">
              <ChildStateChip display={card.stateDisplay} riskLevel={card.riskLevelToday} />
            </div>
            <p className="mt-2 inline-flex rounded-full bg-[var(--child-pill-soft)] px-3 py-1 text-xs text-[var(--anyu-ink-muted)]">
              整体状态：{overallPillLabel(card.stateDisplay)}
            </p>
            {updated ? (
              <p className="mt-2 text-xs text-[var(--anyu-ink-muted)]">最近一次更新：{updated}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[var(--child-nested-blue)] p-4 ring-1 ring-[var(--child-nested-blue-ring)]">
          <p className="text-xs text-[var(--anyu-ink-muted)]">{need.title}</p>
          <p className="mt-1 text-lg font-semibold text-[var(--anyu-ink)]">{need.hint}</p>
          <p className="mt-2 text-sm text-[var(--anyu-ink-muted)]">
            {hero.suggestLead}
            <span className="text-[var(--anyu-ink)]"> {hero.suggestExample}</span>
          </p>
        </div>

        <ChildDashboardQuickActions elderUserId={elderUserId} />
      </section>

      <section className="mt-5 rounded-[1.25rem] bg-[var(--anyu-bg-card)] p-5 shadow-[var(--child-card-shadow)] ring-1 ring-black/[0.04]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-sm font-semibold text-[var(--anyu-ink)]">最近 7 天</p>
          <Link href="/cn/child/trend" className="text-xs text-[var(--child-tab-active)]">
            查看全部
          </Link>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <p>
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--child-dot-lonely)] align-middle mr-1.5" />
            <span className="text-[var(--anyu-ink-muted)]">孤单</span>{" "}
            <span className="font-medium text-[var(--anyu-ink)]">{card.trend.lonely}</span> 次
          </p>
          <p>
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--child-dot-family)] align-middle mr-1.5" />
            <span className="text-[var(--anyu-ink-muted)]">想家人</span>{" "}
            <span className="font-medium text-[var(--anyu-ink)]">{card.trend.familyMentions}</span> 次
          </p>
          <p>
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--child-dot-risk)] align-middle mr-1.5" />
            <span className="text-[var(--anyu-ink-muted)]">风险</span>{" "}
            <span className="font-medium text-[var(--anyu-ink)]">{riskNone ? "无" : "需留意"}</span>
          </p>
        </div>
      </section>

      <section className="mt-5 rounded-[1.25rem] bg-[var(--anyu-bg-card)] p-4 shadow-[var(--child-card-shadow)] ring-1 ring-black/[0.04] flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--child-memory-icon-bg)] text-[var(--anyu-ink-muted)]"
          aria-hidden
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--anyu-ink)]">今日记忆</p>
          <p className="text-sm text-[var(--anyu-ink-muted)] line-clamp-2">
            {card.memoryTeaser?.excerpt ?? "今天还没有新的记忆片段。"}
          </p>
        </div>
        <Link href="/cn/child/memory" className="shrink-0 text-sm text-[var(--child-tab-active)]">
          查看
        </Link>
      </section>
    </>
  );
}
