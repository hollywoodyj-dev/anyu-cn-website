import { getNotifications } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

export default async function ChildNotificationsPage() {
  const list = await getNotifications("elder_demo");
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold mb-4">提醒中心</h1>
      <section className="space-y-3">
        {list.length === 0 ? (
          <div className="rounded-2xl border p-5 bg-[var(--anyu-bg-card)] border-[var(--anyu-border)]">
            暂无提醒。
          </div>
        ) : (
          list.map((n, i) => (
            <article key={`${n.createdAt}-${i}`} className="rounded-2xl border p-5 bg-[var(--anyu-bg-card)] border-[var(--anyu-border)]">
              <p className="text-sm text-[var(--anyu-ink-muted)]">{n.level.toUpperCase()}</p>
              <p className="font-medium mt-1">{n.title}</p>
              <p className="mt-2">{n.message}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
