import Link from "next/link";
import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";
import { getNotifications } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

const levelLabel: Record<string, string> = {
  light: "轻提醒",
  watch: "关注",
  risk: "需要关注",
};

export default async function ChildNotificationsPage() {
  const list = await getNotifications("elder_demo");
  return (
    <ChildAppChrome>
      <h1 className="text-2xl font-semibold mb-1">提醒中心</h1>
      <p className="text-sm text-[var(--anyu-ink-muted)] mb-6">温和提醒，不替代你亲自关心。</p>
      <section className="space-y-3">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5 text-[var(--anyu-ink-muted)]">
            暂无提醒。
          </div>
        ) : (
          list.map((n, i) => (
            <article
              key={`${n.createdAt}-${i}`}
              className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5"
            >
              <p className="text-xs text-[var(--anyu-ink-muted)]">{levelLabel[n.level] ?? n.level}</p>
              <p className="font-medium mt-1 text-[var(--anyu-ink)]">{n.title}</p>
              <p className="mt-2 text-sm text-[var(--anyu-ink-muted)] leading-relaxed">{n.message}</p>
            </article>
          ))
        )}
      </section>
      <div className="mt-6">
        <Link href="/cn/child" className="rounded-full border px-4 py-2 text-sm">
          返回总览
        </Link>
      </div>
    </ChildAppChrome>
  );
}
