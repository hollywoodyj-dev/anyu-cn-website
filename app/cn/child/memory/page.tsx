import Link from "next/link";
import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";
import { getMemoryCards } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

const ELDER_DEMO = "elder_demo";

const tagClass: Record<string, string> = {
  想念表达: "bg-sky-50 text-sky-900 ring-sky-200/60",
  家庭故事: "bg-orange-50 text-orange-900 ring-orange-200/50",
  生活记忆: "bg-emerald-50 text-emerald-900 ring-emerald-200/50",
  感谢表达: "bg-amber-50 text-amber-950 ring-amber-200/50",
};

export default async function ChildMemoryPage() {
  const cards = await getMemoryCards(ELDER_DEMO);
  const featured = cards[0];
  const rest = cards.slice(1);

  return (
    <ChildAppChrome>
      <div className="mb-5 flex items-center justify-between gap-2">
        <Link
          href="/cn/child"
          className="rounded-full p-2 text-[var(--anyu-ink-muted)] hover:bg-[var(--anyu-bg-card)]"
          aria-label="返回"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-[var(--anyu-ink)]">记忆卡片</h1>
        <span className="rounded-full border border-[var(--anyu-border)] px-2.5 py-1 text-xs text-[var(--anyu-ink-muted)]">
          全部
        </span>
      </div>
      <p className="text-sm text-[var(--anyu-ink-muted)] mb-5">像家庭便签，不是医疗记录。</p>

      {cards.length === 0 ? (
        <div className="rounded-[1.25rem] border border-[var(--anyu-border)] bg-[#faf6f0] p-6 text-[var(--anyu-ink-muted)]">
          今日暂无记忆片段。
        </div>
      ) : (
        <div className="space-y-4">
          {featured ? (
            <article className="rounded-[1.35rem] bg-[#faf6f0] p-5 shadow-[var(--child-card-shadow)] ring-1 ring-[rgba(120,90,60,0.08)]">
              <div className="flex justify-between items-start gap-2 mb-3">
                <p className="text-xs text-[var(--anyu-ink-muted)]">今天</p>
                <span className="text-[var(--child-cta-heart-ink)]" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </span>
              </div>
              <p className="text-sm text-[var(--anyu-ink-muted)]">妈妈今天提到：</p>
              <p className="mt-2 text-lg font-semibold text-[var(--anyu-ink)] leading-snug">{featured.content}</p>
              <p className="mt-3 text-sm text-[var(--anyu-ink-muted)]">这可能是一段值得保存的家庭记忆。</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--anyu-bg-card)] px-4 py-2 text-sm font-medium text-[var(--anyu-ink)] ring-1 ring-[var(--anyu-border)]">
                  保存
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--child-nested-blue)] px-4 py-2 text-sm font-medium text-[var(--anyu-ink)] ring-1 ring-[var(--child-nested-blue-ring)]">
                  回应她
                </span>
              </div>
            </article>
          ) : null}

          {rest.map((c) => (
            <article
              key={c.id}
              className="rounded-[1.15rem] bg-[var(--anyu-bg-card)] p-4 shadow-[var(--child-card-shadow)] ring-1 ring-black/[0.04]"
            >
              <p className="text-[var(--anyu-ink)] leading-relaxed">{c.content}</p>
              <p className="mt-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${tagClass[c.tag] ?? "bg-[var(--anyu-bg)] text-[var(--anyu-ink-muted)] ring-[var(--anyu-border)]"}`}
                >
                  {c.tag}
                </span>
                {c.saved ? (
                  <span className="ml-2 text-xs text-[var(--anyu-ink-muted)]">已保存</span>
                ) : null}
              </p>
            </article>
          ))}
        </div>
      )}
    </ChildAppChrome>
  );
}
