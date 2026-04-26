import type { Metadata } from "next";
import Link from "next/link";
import { TextBlock } from "@/components/anyu";

export const metadata: Metadata = {
  title: "我们的原则 | 安语",
  description:
    "不替代家人、不制造依赖、不做决定、不站队；危险时优先回到人身边。与 Risk Engine、Human Override 表述一致。",
};

/*
 * 《安语中文官网 · 伦理守则页 Spec》/cn/ethics
 * 目的不是「解释理念」，而是让人确认：不取代家人、不控制我、危险时回到人身边。
 * 须与 Risk Engine / QA / 安全框架一致。
 */
export default function EthicsPage() {
  return (
    <div className="space-y-14">
      <header className="space-y-4 text-center">
        <h1 className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">我们的原则</h1>
        <p className="mx-auto max-w-xl text-[var(--anyu-ink-muted)]">
          让人放心使用，
          <br />
          比让系统更聪明更重要
        </p>
      </header>

      <TextBlock as="section" className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 md:p-8">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">不替代家人</h2>
        <p>安语不会取代你的家人。</p>
        <p className="text-[var(--anyu-ink-muted)]">
          它不会成为你唯一的倾诉对象，也不会让你依赖它。它存在的目的，是让你更容易和真实的人连接。
        </p>
        <p className="text-sm text-[var(--anyu-ink-muted)]">（Non-Substitution）</p>
      </TextBlock>

      <TextBlock as="section" className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 md:p-8">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">不制造依赖</h2>
        <p>安语不会让你「离不开它」。</p>
        <p className="text-[var(--anyu-ink-muted)]">
          不会说：「只有我懂你」「你可以一直找我」。它会轻轻地提醒你：重要的人，仍然在现实世界里。
        </p>
      </TextBlock>

      <TextBlock as="section" className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 md:p-8">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">不做决定</h2>
        <p>安语不会替你做决定。</p>
        <p className="text-[var(--anyu-ink-muted)]">
          无论是健康、金钱、关系，它不会告诉你该怎么做，只会帮助你把话说清楚。
        </p>
      </TextBlock>

      <TextBlock as="section" className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 md:p-8">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">不站队</h2>
        <p>安语不会站在任何一方。</p>
        <p className="text-[var(--anyu-ink-muted)]">
          不会说：「他们就是不对」。它只会帮助你表达感受，而不是制造对立。
        </p>
      </TextBlock>

      <TextBlock as="section" className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 md:p-8">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">危险时优先人</h2>
        <p>当系统发现风险时：</p>
        <p className="text-[var(--anyu-ink-muted)]">
          它不会继续聊天，会优先建议联系家人，并在授权下通知亲人。因为有些时候，你需要的不是屏幕里的回答，而是一个真实的人。
        </p>
        <p className="text-sm text-[var(--anyu-ink-muted)]">（与 Risk Engine、Human Override 一致。）</p>
      </TextBlock>

      <TextBlock as="section" className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 md:p-8">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">数据与隐私</h2>
        <p className="font-medium text-[var(--anyu-ink)]">数据最小化</p>
        <p className="text-[var(--anyu-ink-muted)]">
          我们不会记录不必要的信息。只保存：情绪趋势（用于提醒）、风险记录（用于安全）。不会保存完整对话内容。
        </p>
        <p className="pt-4 font-medium text-[var(--anyu-ink)]">用户控制权</p>
        <p className="text-[var(--anyu-ink-muted)]">
          你可以随时关闭预警功能、删除数据、修改联系人。系统不会在你不知情的情况下联系任何人。
        </p>
      </TextBlock>

      <TextBlock as="section" className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 md:p-8">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">长者保护</h2>
        <p className="text-[var(--anyu-ink-muted)]">
          我们知道：长者更容易相信系统，也更容易依赖系统。所以我们设计安语时，始终保留一个边界：它只是一个帮助表达的工具，不是一个可以替代人的存在。
        </p>
      </TextBlock>

      <TextBlock as="section" className="border-t border-[var(--anyu-border)] pt-10 text-center">
        <p className="text-[var(--anyu-ink-muted)]">
          我们做这个系统，不是为了让系统更「聪明」。
          <br />
          而是为了让关系，不被沉默隔开。
        </p>
      </TextBlock>

      <nav className="flex flex-wrap justify-center gap-4 border-t border-[var(--anyu-border)] pt-8 text-base">
        <Link href="/cn/safety" className="text-[var(--anyu-accent)] underline-offset-4 hover:underline">
          安全与预警
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
