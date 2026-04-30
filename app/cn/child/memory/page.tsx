import { getMemoryCards } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

export default async function ChildMemoryPage() {
  const cards = await getMemoryCards("elder_demo");
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold mb-4">记忆卡片</h1>
      <section className="space-y-3">
        {cards.length === 0 ? (
          <div className="rounded-2xl border p-5 bg-[var(--anyu-bg-card)] border-[var(--anyu-border)]">
            今日暂无记忆片段。
          </div>
        ) : (
          cards.map((c) => (
            <article key={c.id} className="rounded-2xl border p-5 bg-[var(--anyu-bg-card)] border-[var(--anyu-border)]">
              <p>{c.content}</p>
              <p className="mt-2 text-sm text-[var(--anyu-ink-muted)]">
                标签：{c.tag} · {c.saved ? "已保存" : "未保存"}
              </p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
