import Link from "next/link";
import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";
import { ConsentForm } from "./ConsentForm";

export const dynamic = "force-dynamic";

export default function ChildConsentPage() {
  return (
    <ChildAppChrome>
      <h1 className="text-2xl font-semibold mb-1">授权与说明</h1>
      <p className="text-sm text-[var(--anyu-ink-muted)] mb-6">请和家人一起阅读，可随时在「联系人」里调整。</p>

      <section className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5 space-y-4 text-[var(--anyu-ink)] leading-relaxed">
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>安语不会把完整聊天记录直接给家人。</li>
          <li>当出现明显风险时，系统会根据授权提醒联系人。</li>
          <li>你可以调整提醒等级和联系人。</li>
          <li>记忆卡片与摘要均为整理后的片段，不是原文导出。</li>
        </ul>
        <p className="text-xs text-[var(--anyu-ink-muted)]">
          系统不替代真人陪伴；紧急时请直接联系长辈或急救服务。
        </p>
      </section>

      <ConsentForm />

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/cn/child/contacts" className="rounded-full border px-4 py-2 text-sm">
          管理联系人
        </Link>
        <Link href="/cn/child" className="rounded-full border px-4 py-2 text-sm">
          返回总览
        </Link>
      </div>
    </ChildAppChrome>
  );
}
