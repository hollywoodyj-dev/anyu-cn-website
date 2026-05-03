import Link from "next/link";
import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";
import { ChildStateChip } from "@/components/anyu/child/ChildStateChip";
import { getDailyInsight } from "@/lib/child-insights/repository";
import { dashboardHeroCopy, resolveChildStateDisplay } from "@/lib/child-insights/childUiCopy";
import { formatTodayLineZh } from "@/components/anyu/child/childDateFormat";

export const dynamic = "force-dynamic";

const ELDER_DEMO = "elder_demo";

export default async function ChildDailyPage() {
  const d = await getDailyInsight(ELDER_DEMO);
  const stateDisplay = resolveChildStateDisplay({
    overallState: d.overallState,
    riskLevel: d.riskLevel,
    familyMentionsToday: d.familyMentions,
    lonelinessToday: d.lonelinessScore,
  });
  const riskLevel = (["L1", "L2", "L3", "L4"].includes(d.riskLevel) ? d.riskLevel : "L1") as "L1" | "L2" | "L3" | "L4";
  const hero = dashboardHeroCopy({ parentName: "妈妈", display: stateDisplay });
  const insightLine = `${hero.overallNote}${hero.body}`;

  return (
    <ChildAppChrome>
      <div className="mb-5 flex items-center justify-between gap-2">
        <Link
          href="/cn/child"
          className="rounded-full p-2 text-[var(--anyu-ink-muted)] hover:bg-[var(--anyu-bg-card)]"
          aria-label="返回首页"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-[var(--anyu-ink)]">今日简报</h1>
        <span className="w-10" aria-hidden />
      </div>
      <p className="text-center text-sm text-[var(--anyu-ink-muted)] -mt-3 mb-6">{formatTodayLineZh()}</p>

      <section className="rounded-[1.25rem] bg-[var(--anyu-bg-card)] p-5 shadow-[var(--child-card-shadow)] ring-1 ring-black/[0.04]">
        <p className="text-sm font-medium text-[var(--anyu-ink)]">今日状态</p>
        <div className="mt-3">
          <ChildStateChip display={stateDisplay} riskLevel={riskLevel} />
        </div>
        <p className="mt-5 text-sm font-medium text-[var(--anyu-ink)]">今天出现的信号</p>
        <ul className="mt-2 space-y-2 text-sm text-[var(--anyu-ink-muted)]">
          {d.signals.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--child-tab-active)]" />
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-[1.25rem] bg-[#faf4ee] p-5 shadow-[var(--child-card-shadow)] ring-1 ring-[rgba(180,140,100,0.12)]">
        <p className="text-sm font-semibold text-[var(--anyu-ink)]">安语整理</p>
        <p className="mt-2 text-[var(--anyu-ink)] leading-relaxed">{insightLine}</p>
      </section>

      <section className="mt-4 rounded-[1.25rem] bg-[var(--anyu-bg-card)] p-5 shadow-[var(--child-card-shadow)] ring-1 ring-black/[0.04]">
        <p className="text-sm font-semibold text-[var(--anyu-ink)]">你可以做的小事</p>
        <ul className="mt-3 divide-y divide-[var(--anyu-border)] text-sm">
          <li className="flex items-center gap-3 py-3 first:pt-0">
            <span className="text-[var(--child-cta-call-ink)]" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <span className="text-[var(--anyu-ink)]">打个电话，听她说几句</span>
          </li>
          <li className="flex items-center gap-3 py-3">
            <span className="text-[var(--child-cta-msg-ink)]" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </span>
            <span className="text-[var(--anyu-ink)]">发一句问候</span>
          </li>
          <li className="flex items-center gap-3 py-3 last:pb-0">
            <span className="text-[var(--child-cta-call-ink)]" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V2M3 2h18M8 2v4m8-4v4" />
              </svg>
            </span>
            <span className="text-[var(--anyu-ink)]">约一顿饭</span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-[var(--anyu-ink-muted)] leading-relaxed">
          以上为整理后的状态摘要，不含完整对话原文。
        </p>
      </section>
    </ChildAppChrome>
  );
}
