import {
  CTAButton,
  EmotionList,
  HeroSection,
  QuietCard,
  SafetyNotice,
  SimpleSteps,
  TextBlock,
} from "@/components/anyu";

/*
 * 网站目标（Spec 0）：
 * 不是推广 AI，而是让子女理解「父母为何越来越不说话」、如何帮助他们重新表达；
 * 让长者不害怕使用。
 *
 * 伦理（Non-Substitution）：不替代人与人之间的关系；关系仍在人与人之间。
 *
 * 首页结构对齐《安语 · 正式官网 UI（V1 上线版）》Marketing Website.md：
 * 定位句、情绪共鸣三卡、方案三卡、Demo 三步、信任五句、场景三卡、转化 CTA。
 */
export default function CnHomePage() {
  return (
    <>
      <HeroSection
        title="安语"
        lines={[
          "让父母的话，被温柔听见",
          "",
          "安语不是一个聊天机器人。",
          "它只是帮父母把那些难说出口的话，\n慢慢说出来。",
          "",
          "也让子女，能更早听见。",
        ]}
        ctas={[
          { href: "#demo-flow", label: "观看 Demo" },
          { href: "/cn/product", label: "申请试用" },
        ]}
      />

      <TextBlock as="section" className="mb-16 text-center" aria-labelledby="positioning">
        <p id="positioning" className="text-[var(--anyu-ink-muted)]">
          安语不是一个聊天机器人。
          <br />
          它是一座让长者与家人重新连接的心桥。
        </p>
      </TextBlock>

      <section className="mb-16 space-y-6" aria-labelledby="sympathy">
        <h2 id="sympathy" className="text-xl font-medium md:text-2xl">
          很多长者不是没有话说，而是不知道怎么开口
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <QuietCard title="「我怕麻烦孩子」" body="想说，又怕打扰。" />
          <QuietCard title="「我想他们，但不想打扰」" body="想念在心里压着。" />
          <QuietCard title="「我不舒服，但不好意思说」" body="难受也不轻易开口。" />
        </div>
      </section>

      <section className="mb-16 space-y-6" aria-labelledby="parents-angle">
        <h2 id="parents-angle" className="text-xl font-medium md:text-2xl">
          很多父母不是不想说，而是：
        </h2>
        <EmotionList
          items={[
            "不知道怎么说",
            "怕被嫌烦",
            "怕变成负担",
            "说了也没有人认真听",
          ]}
        />
      </section>

      <section className="mb-16 space-y-6" aria-labelledby="solution">
        <h2 id="solution" className="text-xl font-medium md:text-2xl">
          安语在做什么
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <QuietCard
            kicker="表达"
            title="帮长者表达情绪"
            body="把说不出口的话，变得温和可说。"
          />
          <QuietCard
            kicker="连接"
            title="帮家庭重新连接"
            body="让子女更容易回应。"
          />
          <QuietCard
            kicker="安全"
            title="在需要时提醒家人"
            body="当情绪危险时，让人回到人身边。"
          />
        </div>
        <TextBlock>
          <p className="text-[var(--anyu-ink-muted)]">
            不是替代沟通，
            <br />
            而是让沟通重新发生。
          </p>
        </TextBlock>
      </section>

      <section id="demo-flow" className="mb-16 scroll-mt-24 space-y-6" aria-labelledby="demo-heading">
        <h2 id="demo-heading" className="text-xl font-medium md:text-2xl">
          一句话，怎么传到家人那里
        </h2>
        <SimpleSteps
          steps={[
            {
              title: "长者说：「我今天有点孤单」",
              body: "慢慢说就好。",
            },
            {
              title: "安语帮他说：「我今天有点想你…」",
              body: "语气更温和，更容易被听见。",
            },
            {
              title: "家人收到：「妈妈刚刚想听听你的声音」",
              body: "不是告状，是搭桥。",
            },
          ]}
        />
      </section>

      <section className="mb-16 space-y-6" aria-labelledby="trust-principles">
        <h2 id="trust-principles" className="text-xl font-medium md:text-2xl">
          你可以放心这几件事
        </h2>
        <ul className="list-none space-y-4 text-[var(--anyu-ink)]">
          <li className="flex gap-3">
            <span className="text-[var(--anyu-accent)]" aria-hidden>
              ·
            </span>
            <span>安语不会替代家人</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--anyu-accent)]" aria-hidden>
              ·
            </span>
            <span>安语不会制造依赖</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--anyu-accent)]" aria-hidden>
              ·
            </span>
            <span>安语不会做决定</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--anyu-accent)]" aria-hidden>
              ·
            </span>
            <span>安语不会站队指责谁</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--anyu-accent)]" aria-hidden>
              ·
            </span>
            <span>安语在危险时，让人回到人身边</span>
          </li>
        </ul>
        <p className="text-sm text-[var(--anyu-ink-muted)]">
          与安全框架、Risk Engine、Human Override 一致。详见
          <a href="/cn/ethics" className="mx-1 text-[var(--anyu-accent)] underline-offset-2 hover:underline">
            我们的原则
          </a>
          与
          <a href="/cn/safety" className="mx-1 text-[var(--anyu-accent)] underline-offset-2 hover:underline">
            安全与预警
          </a>
          。
        </p>
      </section>

      <section className="mb-16 space-y-6" aria-labelledby="scenarios">
        <h2 id="scenarios" className="text-xl font-medium md:text-2xl">
          可以用在哪里
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <QuietCard title="家庭使用" body="父母在家，子女在外地。" />
          <QuietCard title="养老机构" body="在照护场景里辅助沟通。" />
          <QuietCard title="护理服务" body="在专业人员协作下使用。" />
        </div>
      </section>

      <SafetyNotice title="安全提示">
        <p>
          当系统发现父母情绪异常或有风险时，不会继续聊天，会优先建议联系家人，并在授权下通知亲人。
        </p>
        <p className="text-[var(--anyu-ink-muted)]">因为有些时候，他们需要的是身边的人。</p>
        <p className="text-sm text-[var(--anyu-ink-muted)]">
          （与风险系统逻辑一致：Human Override）
        </p>
      </SafetyNotice>

      <section
        className="mt-16 flex flex-col items-center gap-4 border-t border-[var(--anyu-border)] pt-12 text-center"
        aria-labelledby="cta-bottom"
      >
        <h2 id="cta-bottom" className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">
          让沟通变得更容易
        </h2>
        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <CTAButton href="#demo-flow">观看 Demo</CTAButton>
          <CTAButton href="/cn/for-family">我想连接父母</CTAButton>
        </div>
        <p className="text-sm text-[var(--anyu-ink-muted)]">
          联系：
          <a href="mailto:hello@anyu.ai" className="text-[var(--anyu-accent)] underline-offset-2 hover:underline">
            hello@anyu.ai
          </a>
          （上线前可替换为正式邮箱。）
        </p>
      </section>
    </>
  );
}
