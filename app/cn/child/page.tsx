import Link from "next/link";
import { getDashboard } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

export default async function ChildDashboardPage() {
  const elderUserId = "elder_demo";
  const card = await getDashboard(elderUserId, "妈妈");
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold mb-4">子女端 V1</h1>
      <section className="rounded-2xl border p-5 bg-[var(--anyu-bg-card)] border-[var(--anyu-border)]">
        <p className="text-sm text-[var(--anyu-ink-muted)]">今日状态</p>
        <p className="text-2xl font-semibold mt-1">{card.state}</p>
        <p className="mt-3">{card.summary}</p>
        <p className="mt-3 text-[var(--anyu-ink-muted)]">建议：{card.suggestedAction}</p>
        <div className="mt-4 text-sm text-[var(--anyu-ink-muted)]">
          <p>7天小趋势</p>
          <p>孤单：{card.trend.lonely} 次</p>
          <p>提到家人：{card.trend.familyMentions} 次</p>
          <p>身体不适：{card.trend.health} 次</p>
        </div>
      </section>

      <nav className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link className="rounded-full border px-4 py-2" href="/cn/child/daily">
          今日详情
        </Link>
        <Link className="rounded-full border px-4 py-2" href="/cn/child/trend">
          趋势
        </Link>
        <Link className="rounded-full border px-4 py-2" href="/cn/child/memory">
          记忆卡片
        </Link>
        <Link className="rounded-full border px-4 py-2" href="/cn/child/notifications">
          提醒中心
        </Link>
      </nav>
    </main>
  );
}
