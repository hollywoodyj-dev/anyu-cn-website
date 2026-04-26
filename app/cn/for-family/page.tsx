import { CTAButton, EmotionList, TextBlock } from "@/components/anyu";

/* 给子女：不替代照护者；只帮助被听见。 */
export default function ForFamilyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-16">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">
          为什么父母越来越不说话？
        </h1>
      </header>

      <TextBlock>
        <p>不是他们没有话，而是他们开始：</p>
      </TextBlock>
      <EmotionList
        items={["不敢说", "不想麻烦", "说了也被忽略"]}
      />

      <section className="space-y-4" aria-labelledby="help">
        <h2 id="help" className="text-xl font-medium md:text-2xl">
          安语如何帮助
        </h2>
        <TextBlock>
          <p>安语不会替你照顾父母，也不会替代你。</p>
          <p>它只是：</p>
        </TextBlock>
        <EmotionList
          items={[
            "让他们更容易说出真实感受",
            "让你在事情变严重前，就听见",
          ]}
        />
      </section>

      <section className="space-y-4" aria-labelledby="link-logic">
        <h2 id="link-logic" className="text-xl font-medium md:text-2xl">
          你可以：
        </h2>
        <EmotionList
          items={[
            "接收提醒",
            "看到情绪趋势（不看具体内容）",
            "在需要的时候，主动联系他们",
          ]}
        />
      </section>

      <div className="pt-2">
        <CTAButton href="/cn/product">绑定父母设备</CTAButton>
      </div>
    </div>
  );
}
