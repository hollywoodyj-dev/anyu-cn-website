import type { Metadata } from "next";
import { TextBlock } from "@/components/anyu";
import { sanitizeDisclaimerNext } from "@/lib/anyu/site-disclaimer";
import { DisclaimerAcknowledge, DisclaimerInlineNav } from "./disclaimer-acknowledge";

export const metadata: Metadata = {
  title: "免责声明 | 安语",
  description:
    "非医疗、非紧急服务；不替代人类关系；风险与数据边界说明。与 Risk Engine、伦理页一致。",
};

/*
 * 《安语中文官网 · 免责声明页 Spec》/cn/disclaimer
 * 目标：明确边界、防止误用；清楚、直接、无歧义（不是「安慰」页）。
 */
type PageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function DisclaimerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const rawNext = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const nextHref = sanitizeDisclaimerNext(rawNext);
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">免责声明</h1>
        <p className="text-[var(--anyu-ink-muted)]">请在使用前了解这些重要说明</p>
      </header>

      <TextBlock as="section" className="space-y-4">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">非医疗 / 非心理服务</h2>
        <p>安语不是医疗工具，也不是心理咨询服务。</p>
        <p className="font-medium text-[var(--anyu-ink)]">它不能用于：</p>
        <ul className="list-disc space-y-2 pl-6 text-[var(--anyu-ink-muted)]">
          <li>诊断疾病</li>
          <li>提供治疗建议</li>
          <li>替代医生或心理咨询师</li>
        </ul>
        <p className="text-[var(--anyu-ink-muted)]">
          如果你有身体或心理方面的不适，请及时联系医生或专业人员。
        </p>
      </TextBlock>

      <TextBlock as="section" className="space-y-4">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">非紧急服务</h2>
        <p>安语不是紧急救援系统。</p>
        <p className="font-medium text-[var(--anyu-ink)]">在以下情况，请直接联系：</p>
        <ul className="list-disc space-y-2 pl-6 text-[var(--anyu-ink-muted)]">
          <li>紧急医疗服务</li>
          <li>当地急救电话</li>
          <li>或身边的家人</li>
        </ul>
        <p className="text-[var(--anyu-ink-muted)]">不要依赖本系统处理紧急情况。</p>
        <p className="text-sm text-[var(--anyu-risk)]">
          系统会建议人类介入，但不承担救援功能。（与风险逻辑一致。）
        </p>
      </TextBlock>

      <TextBlock as="section" className="space-y-4">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">不替代人类关系</h2>
        <p>安语不会替代家人或照护人员。</p>
        <p className="font-medium text-[var(--anyu-ink)]">它不能：</p>
        <ul className="list-disc space-y-2 pl-6 text-[var(--anyu-ink-muted)]">
          <li>提供实际照护</li>
          <li>承担家庭责任</li>
          <li>成为主要情感支持来源</li>
        </ul>
        <p className="text-[var(--anyu-ink-muted)]">重要的支持，仍然来自现实中的人。</p>
      </TextBlock>

      <TextBlock as="section" className="space-y-4">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">风险预警说明</h2>
        <p className="text-[var(--anyu-ink-muted)]">
          在获得授权的情况下，当系统检测到可能的风险时，可能会通知你设置的紧急联系人。
        </p>
        <p className="font-medium text-[var(--anyu-risk)]">但请注意：</p>
        <p className="text-[var(--anyu-ink-muted)]">
          系统无法保证识别所有风险情况，或在任何情况下都能及时通知。你仍需对自身安全保持判断。
        </p>
      </TextBlock>

      <TextBlock as="section" className="space-y-4">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">数据与隐私</h2>
        <p className="text-[var(--anyu-ink-muted)]">系统会记录必要的信息用于：情绪趋势分析、风险识别。</p>
        <p className="font-medium text-[var(--anyu-ink)]">但不会：</p>
        <ul className="list-disc space-y-2 pl-6 text-[var(--anyu-ink-muted)]">
          <li>用于广告</li>
          <li>用于商业营销</li>
        </ul>
        <p className="text-[var(--anyu-ink-muted)]">你可以随时查看、修改、删除数据。</p>
      </TextBlock>

      <TextBlock as="section" className="space-y-4">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">使用责任</h2>
        <p className="text-[var(--anyu-ink-muted)]">
          使用安语，表示你理解：本系统仅用于情感沟通辅助，不用于决策或判断依据。你需要对自己的行为与决定负责。
        </p>
      </TextBlock>

      <TextBlock as="section" className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 md:p-8">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">如果你是长者用户</h2>
        <p className="text-[var(--anyu-ink-muted)]">
          安语只是一个帮助你表达的工具，它不能替你做决定，也不能代替家人陪伴。当你感到不舒服或不安全时，请优先联系真实的人。
        </p>
      </TextBlock>

      <TextBlock as="section" className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 md:p-8">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">如果你是子女或监护人</h2>
        <p className="text-[var(--anyu-ink-muted)]">
          安语提供的是辅助信息，不能替代你的判断或照护责任。请在接收到提醒时，主动与家人联系，并根据情况采取行动。
        </p>
      </TextBlock>

      <TextBlock as="section" className="text-[var(--anyu-ink-muted)]">
        <p>如果你对这些内容有疑问，请在使用前确认理解。</p>
        <p className="pt-2">继续使用本系统，即表示你已阅读并同意上述说明。</p>
      </TextBlock>

      <DisclaimerAcknowledge nextHref={nextHref} />

      <DisclaimerInlineNav />
    </div>
  );
}
