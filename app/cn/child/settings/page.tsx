import Link from "next/link";
import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";

export const dynamic = "force-dynamic";

export default function ChildSettingsPage() {
  return (
    <ChildAppChrome>
      <h1 className="text-xl font-semibold text-[var(--anyu-ink)] mb-1">联系人与授权</h1>
      <p className="text-sm text-[var(--anyu-ink-muted)] mb-6">信任层：谁会被通知、提醒有多强、记忆可见范围。</p>

      <section className="rounded-[1.25rem] bg-[var(--anyu-bg-card)] p-5 shadow-[var(--child-card-shadow)] ring-1 ring-black/[0.04] mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="text-base font-semibold text-[var(--anyu-ink)]">通知联系人</h2>
          <Link
            href="/cn/child/contacts"
            className="rounded-full bg-[var(--child-tab-active)] px-3 py-1.5 text-xs font-medium text-white"
          >
            管理联系人
          </Link>
        </div>
        <p className="text-sm text-[var(--anyu-ink-muted)] leading-relaxed">
          在「联系人」里设置主要 / 次要 / 护理联系人。安语不会替你把信息发给陌生人。
        </p>
      </section>

      <section className="rounded-[1.25rem] bg-[var(--anyu-bg-card)] p-5 shadow-[var(--child-card-shadow)] ring-1 ring-black/[0.04] mb-4">
        <h2 className="text-base font-semibold text-[var(--anyu-ink)] mb-1">提醒等级偏好</h2>
        <p className="text-xs text-[var(--anyu-ink-muted)] mb-4">根据父母状态，安语会按以下等级提醒你（网页端为示意）。</p>
        <ul className="space-y-2 text-sm text-[var(--anyu-ink-muted)]">
          <li className="rounded-xl bg-[var(--anyu-bg)] px-3 py-2">L1：仅 App 内显示</li>
          <li className="rounded-xl bg-[var(--child-pill-soft)] px-3 py-2 ring-1 ring-amber-200/60">L2：轻提醒（推送）</li>
          <li className="rounded-xl bg-[var(--anyu-bg)] px-3 py-2">L3：强提醒（建议及时联系）</li>
          <li className="rounded-xl bg-[var(--anyu-bg)] px-3 py-2">L4：紧急提醒（立即通知）</li>
        </ul>
        <p className="mt-3 text-xs text-[var(--anyu-ink-muted)]">红色视觉仅用于 L4，避免日常被「训练」成焦虑。</p>
      </section>

      <section className="rounded-[1.25rem] bg-[var(--anyu-bg-card)] p-5 shadow-[var(--child-card-shadow)] ring-1 ring-black/[0.04] mb-4">
        <h2 className="text-base font-semibold text-[var(--anyu-ink)] mb-2">记忆卡片权限</h2>
        <p className="text-sm text-[var(--anyu-ink-muted)] leading-relaxed mb-3">
          默认只展示整理后的精选记忆，不展示完整聊天记录。
        </p>
        <ul className="space-y-2 text-sm text-[var(--anyu-ink)]">
          <li className="flex gap-2">
            <span aria-hidden>·</span>
            显示整理后的今日状态
          </li>
          <li className="flex gap-2">
            <span aria-hidden>·</span>
            显示精选记忆卡片
          </li>
          <li className="flex gap-2">
            <span aria-hidden>·</span>
            风险时通知紧急联系人
          </li>
        </ul>
      </section>

      <section className="rounded-[1.25rem] bg-[var(--anyu-bg-card)] p-5 shadow-[var(--child-card-shadow)] ring-1 ring-black/[0.04] mb-4">
        <h2 className="text-base font-semibold text-[var(--anyu-ink)] mb-2">隐私与授权</h2>
        <p className="text-sm text-[var(--anyu-ink-muted)] leading-relaxed mb-3">
          没有隐藏分享。完整对话默认不向子女端开放；若未来提供，也会以非常明确的双向授权为前提。
        </p>
        <Link href="/cn/child/consent" className="text-sm text-[var(--child-tab-active)] font-medium">
          查看授权与说明 →
        </Link>
      </section>

      <section className="rounded-[1.25rem] bg-[var(--anyu-bg-card)] p-5 shadow-[var(--child-card-shadow)] ring-1 ring-black/[0.04]">
        <h2 className="text-base font-semibold text-[var(--anyu-ink)] mb-2">紧急联系人</h2>
        <p className="text-sm text-[var(--anyu-ink-muted)] leading-relaxed">
          请在「联系人」中填写可在风险或紧急情况下协助的家人或护理人员。
        </p>
      </section>
    </ChildAppChrome>
  );
}
