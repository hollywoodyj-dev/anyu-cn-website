import Link from "next/link";
import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";
import { getMemoryCards } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

export default async function ChildMemoryPage() {
  const cards = await getMemoryCards("elder_demo");
  return (
    <ChildAppChrome>
      <h1 className="text-2xl font-semibold mb-1">记忆卡片</h1>
      <p className="text-sm text-[var(--anyu-ink-muted)] mb-6">仅展示整理后的片段，不是聊天记录。</p>
      <section className="space-y-3">
        {cards.length === 0 ? (
          <div className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5 text-[var(--anyu-ink-muted)]">
            今日暂无记忆片段。
          </div>
        ) : (
          cards.map((c) => (
            <article
              key={c.id}
              className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5"
            >
              <p className="text-[var(--anyu-ink)]">{c.content}</p>
              <p className="mt-2 text-xs text-[var(--anyu-ink-muted)]">
                标签：{c.tag} · {c.saved ? "已保存" : "未保存"}
              </p>
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
