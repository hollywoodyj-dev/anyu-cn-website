import Link from "next/link";
import { EmotionList, SafetyNotice, TextBlock } from "@/components/anyu";

/*
 * 给长者：字少、无评价、不责备（Spec 5）
 * 《Emotional Communication Page》要点：大字、少按钮、安全路径醒目；风险先于人。
 */
export default function ForElderPage() {
  return (
    <div className="space-y-16">
      <header>
        <h1 className="text-3xl font-normal leading-snug text-[var(--anyu-ink)] md:text-4xl">
          你可以慢慢说，不用想太多
        </h1>
      </header>

      <section className="space-y-4" aria-labelledby="usage">
        <h2 id="usage" className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">
          你可以说：
        </h2>
        <EmotionList
          items={["我今天有点孤单", "我有点想孩子", "我不知道怎么说"]}
        />
        <TextBlock>
          <p className="text-lg text-[var(--anyu-ink-muted)] md:text-xl">
            不用说得很完整，安语会帮你整理。
          </p>
        </TextBlock>
      </section>

      <section className="space-y-4" aria-labelledby="safety-feel">
        <h2 id="safety-feel" className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">
          它不会：
        </h2>
        <EmotionList items={["评价你", "责备你", "要求你做什么"]} />
        <TextBlock>
          <p className="text-lg text-[var(--anyu-ink)] md:text-xl">只是听你说。</p>
        </TextBlock>
      </section>

      <SafetyNotice title="若心里很难受，或觉得不安全">
        <p className="text-lg">
          请优先联系你信任的家人、朋友，或身边的工作人员。也可以先看我们写好的说明：
        </p>
        <ul className="list-none space-y-3 pl-0 text-lg">
          <li>
            <Link href="/cn/safety" className="font-medium text-[var(--anyu-accent)] underline-offset-4 hover:underline">
              安全与预警
            </Link>
          </li>
          <li>
            <Link href="/cn/ethics" className="font-medium text-[var(--anyu-accent)] underline-offset-4 hover:underline">
              我们的原则
            </Link>
          </li>
        </ul>
      </SafetyNotice>
    </div>
  );
}
