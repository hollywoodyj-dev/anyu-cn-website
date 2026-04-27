import Link from "next/link";
import { EmotionList, TextBlock } from "@/components/anyu";

/* 产品形态：说明通道，不堆功能术语 */
export default function ProductPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-12">
      <header>
        <h1 className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">
          安语可以通过不同方式使用
        </h1>
      </header>

      <section id="anyu-lamp" className="scroll-mt-24 space-y-6" aria-label="安语灯与使用形态">
        <EmotionList
          items={["安语灯（家中设备）", "手机 App", "子女端提醒系统"]}
        />
      </section>

      <TextBlock>
        <p className="text-[var(--anyu-ink-muted)]">你不需要学会复杂操作，只需要说话。</p>
      </TextBlock>

      <section className="rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5 md:p-6">
        <h2 className="text-xl font-medium text-[var(--anyu-ink)]">现在可本地体验安语灯语音对话</h2>
        <p className="mt-2 text-[var(--anyu-ink-muted)]">
          点击安语灯开始说话，系统会转写你的话、给出安语回复，并自动朗读回复内容。
        </p>
        <Link
          href="/cn/lamp-voice"
          className="mt-4 inline-flex rounded-2xl bg-[#9D6A4D] px-5 py-3 text-white transition hover:bg-[#8a5d43]"
        >
          进入灯语音体验
        </Link>
      </section>
    </div>
  );
}
