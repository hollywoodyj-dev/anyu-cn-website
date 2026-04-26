import { EmotionList, TextBlock } from "@/components/anyu";

/* 产品形态：说明通道，不堆功能术语 */
export default function ProductPage() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">
          安语可以通过不同方式使用
        </h1>
      </header>

      <EmotionList
        items={["安语灯（家中设备）", "手机 App", "子女端提醒系统"]}
      />

      <TextBlock>
        <p className="text-[var(--anyu-ink-muted)]">你不需要学会复杂操作，只需要说话。</p>
      </TextBlock>
    </div>
  );
}
