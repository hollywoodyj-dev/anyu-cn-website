import Link from "next/link";
import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";
import { ChildStateChip } from "@/components/anyu/child/ChildStateChip";
import { getDailyInsight } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

function mapState(s: string): "stable" | "lonely" | "low" | "watch" | "risk" {
  if (s === "lonely" || s === "low" || s === "watch" || s === "risk") return s;
  return "stable";
}

export default async function ChildDailyPage() {
  const d = await getDailyInsight("elder_demo");
  const chipState = d.riskLevel === "L3" || d.riskLevel === "L4" ? "risk" : mapState(d.overallState);
  return (
    <ChildAppChrome>
      <h1 className="text-2xl font-semibold mb-1">今日详情</h1>
      <p className="text-sm text-[var(--anyu-ink-muted)] mb-6">摘要与片段，不含完整对话原文。</p>

      <section className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <ChildStateChip state={chipState} />
          <span className="text-sm text-[var(--anyu-ink-muted)]">风险等级：{d.riskLevel}</span>
        </div>
        <div className="grid gap-2 text-sm text-[var(--anyu-ink-muted)] sm:grid-cols-2">
          <p>提到家人：{d.familyMentions} 次</p>
          <p>孤单信号：{d.lonelinessScore} 次</p>
          <p>身体相关：{d.healthSignals} 次</p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--anyu-ink)] mb-2">关键片段</p>
          {d.keyMessages.length === 0 ? (
            <p className="text-sm text-[var(--anyu-ink-muted)]">今天暂无整理片段。</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1 text-[var(--anyu-ink)]">
              {d.keyMessages.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-[var(--anyu-ink-muted)]">建议：{d.suggestedAction}</p>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/cn/child" className="rounded-full border px-4 py-2 text-sm">
          返回总览
        </Link>
        <Link href="/cn/child/notifications" className="rounded-full border px-4 py-2 text-sm">
          查看提醒
        </Link>
      </div>
    </ChildAppChrome>
  );
}
