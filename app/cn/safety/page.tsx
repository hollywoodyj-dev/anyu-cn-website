import Link from "next/link";
import { SafetyNotice, TextBlock } from "@/components/anyu";

/* 安全与预警：须与 Risk Engine 分级、QA 与产品说明一致。 */
export default function SafetyPage() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">
          当情况变严重时，我们会这样处理
        </h1>
      </header>

      <TextBlock>
        <p>如果系统检测到：</p>
        <ul className="list-disc space-y-2 pl-6 text-[var(--anyu-ink)]">
          <li>强烈低落</li>
          <li>极端孤独</li>
          <li>或安全风险</li>
        </ul>
        <p className="pt-2">系统会：</p>
        <ul className="list-disc space-y-2 pl-6 text-[var(--anyu-ink)]">
          <li>建议你联系家人</li>
          <li>或在你授权下通知亲人</li>
        </ul>
      </TextBlock>

      <section className="space-y-4" aria-labelledby="risk-tiers">
        <h2 id="risk-tiers" className="text-xl font-medium md:text-2xl">
          风险分级
        </h2>
        <ul className="space-y-4 text-[var(--anyu-ink)]">
          <li>
            <span className="font-medium">普通情绪</span>
            <span className="text-[var(--anyu-ink-muted)]"> → 只是陪你说话</span>
          </li>
          <li>
            <span className="font-medium">持续低落</span>
            <span className="text-[var(--anyu-ink-muted)]"> → 建议联系家人</span>
          </li>
          <li>
            <span className="font-medium">明显风险</span>
            <span className="text-[var(--anyu-ink-muted)]"> → 通知亲人</span>
          </li>
          <li>
            <span className="font-medium">紧急情况</span>
            <span className="text-[var(--anyu-ink-muted)]"> → 优先联系紧急联系人</span>
          </li>
        </ul>
        <p className="text-sm text-[var(--anyu-ink-muted)]">（与 Risk Engine 分级一致。）</p>
      </section>

      <SafetyNotice title="重要">
        <p>有需要时，人比系统更重要。我们会优先促成人与人之间的联系。</p>
      </SafetyNotice>

      <nav className="flex flex-wrap justify-center gap-4 border-t border-[var(--anyu-border)] pt-8 text-base" aria-label="相关说明">
        <Link href="/cn/ethics" className="text-[var(--anyu-accent)] underline-offset-4 hover:underline">
          我们的原则
        </Link>
        <Link href="/cn/disclaimer" className="text-[var(--anyu-accent)] underline-offset-4 hover:underline">
          免责声明
        </Link>
        <Link href="/cn" className="text-[var(--anyu-accent)] underline-offset-4 hover:underline">
          返回首页
        </Link>
      </nav>
    </div>
  );
}
