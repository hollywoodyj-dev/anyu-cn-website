import { getDashboard } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

export default async function ChildTrendPage() {
  const card = await getDashboard("elder_demo", "妈妈");
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold mb-4">趋势（7天）</h1>
      <section className="rounded-2xl border p-5 bg-[var(--anyu-bg-card)] border-[var(--anyu-border)]">
        <p>孤单趋势：{card.trend.lonely}</p>
        <p>提到家人：{card.trend.familyMentions}</p>
        <p>身体不适：{card.trend.health}</p>
      </section>
    </main>
  );
}
