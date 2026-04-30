import { getDailyInsight } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

export default async function ChildDailyPage() {
  const d = await getDailyInsight("elder_demo");
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold mb-4">今日详情</h1>
      <section className="rounded-2xl border p-5 bg-[var(--anyu-bg-card)] border-[var(--anyu-border)]">
        <p>今日情绪：{d.overallState}</p>
        <p>提到家人：{d.familyMentions} 次</p>
        <p>身体信号：{d.healthSignals} 次</p>
        <p>风险：{d.riskLevel}</p>
        <div className="mt-4">
          <p className="font-medium">关键表达</p>
          {d.keyMessages.length === 0 ? <p className="text-[var(--anyu-ink-muted)]">暂无</p> : null}
          <ul className="list-disc pl-6">
            {d.keyMessages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        <p className="mt-4">建议：{d.suggestedAction}</p>
      </section>
    </main>
  );
}
