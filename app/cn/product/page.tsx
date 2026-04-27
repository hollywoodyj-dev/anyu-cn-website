import Link from "next/link";

/* HeartBridge 精简产品页：每屏一个主信息，保持家常表达 */
export default function ProductPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 md:space-y-10">
      <header className="rounded-3xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] px-6 py-8 md:px-8 md:py-10">
        <h1 className="text-3xl font-semibold leading-snug text-[var(--anyu-ink)] md:text-4xl">
          有些话，不是说不出来。
          <br />
          是说出来，总是变了。
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--anyu-ink-muted)] md:text-lg">
          安语在这里，帮长者把“心里的话”，变成可以被听见的样子。
        </p>
        <p className="mt-2 text-base font-medium text-[var(--anyu-ink)] md:text-lg">
          让家人，更早一点靠近彼此。
        </p>
      </header>

      <section className="rounded-3xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] px-6 py-7 md:px-8 md:py-8">
        <h2 className="text-xl font-semibold text-[var(--anyu-ink)]">这一切，其实每天都在发生</h2>
        <p className="mt-4 whitespace-pre-line leading-relaxed text-[var(--anyu-ink-muted)]">
          “你们都不管我了”
          {"\n"}
          “我不想麻烦你们”
          {"\n"}
          “你忙你的就好”
        </p>
        <p className="mt-4 leading-relaxed text-[var(--anyu-ink-muted)]">
          听起来像抱怨、退让、甚至冷漠。但很多时候，它真正的意思是：“我有点孤单，我还是需要你。”只是，这句话，从来没有被好好说出来。
        </p>
      </section>

      <section className="rounded-3xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] px-6 py-7 md:px-8 md:py-8">
        <h2 className="text-xl font-semibold text-[var(--anyu-ink)]">安语在做的事情</h2>
        <ul className="mt-4 space-y-4 text-[var(--anyu-ink-muted)]">
          <li>
            <p className="font-medium text-[var(--anyu-ink)]">1. 听懂真正的情绪</p>
            <p className="mt-1">把“抱怨”，听成“需要”。</p>
          </li>
          <li>
            <p className="font-medium text-[var(--anyu-ink)]">2. 帮忙换一种说法</p>
            <p className="mt-1">把容易让人防御的话，变成可以被接住的表达。</p>
          </li>
          <li>
            <p className="font-medium text-[var(--anyu-ink)]">3. 轻轻连接家人</p>
            <p className="mt-1">不是打扰，不是催促，只是让你更早一点知道，TA 最近不太一样。</p>
          </li>
        </ul>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] px-6 py-7">
          <h3 className="text-lg font-semibold text-[var(--anyu-ink)]">对长者来说</h3>
          <p className="mt-3 leading-relaxed text-[var(--anyu-ink-muted)]">
            你可以说任何话：“我今天有点孤单”“我不知道怎么跟孩子说”“我只是有点想他们”。安语不会评判你，也不会教你怎么做。它只是陪你，把话慢慢说清楚。
          </p>
        </article>
        <article className="rounded-3xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] px-6 py-7">
          <h3 className="text-lg font-semibold text-[var(--anyu-ink)]">对家人来说</h3>
          <p className="mt-3 leading-relaxed text-[var(--anyu-ink-muted)]">
            你不会看到复杂的数据。你只会看到：“她今天有点想你”“最近有点低落”“可能需要一点陪伴”。没有压力，没有责备，只是一个刚刚好的提醒。
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] px-6 py-7 md:px-8 md:py-8">
        <h2 className="text-xl font-semibold text-[var(--anyu-ink)]">当事情变得重要时</h2>
        <p className="mt-3 leading-relaxed text-[var(--anyu-ink-muted)]">
          如果系统感知到“活着没意思”“我撑不下去了”，安语不会继续聊天。它会做一件更重要的事：把人，带回人身边。
        </p>
      </section>

      <section className="rounded-3xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] px-6 py-7 md:px-8 md:py-8">
        <h2 className="text-xl font-semibold text-[var(--anyu-ink)]">我们的底线</h2>
        <ul className="mt-3 space-y-2 text-[var(--anyu-ink-muted)]">
          <li>安语不会替代家人。</li>
          <li>安语不会让人依赖。</li>
          <li>安语不会做决定、操控关系。</li>
        </ul>
        <p className="mt-4 font-medium text-[var(--anyu-ink)]">
          它只做一件事：让本来该发生的连接，更容易发生。
        </p>
      </section>

      <section className="rounded-3xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] px-6 py-8 text-center md:px-8 md:py-10">
        <p className="mx-auto max-w-2xl leading-relaxed text-[var(--anyu-ink-muted)]">
          很多关系，并不是不在了。只是卡在：说不出口，听不进去。安语做的，只是一点点改变：让一句话，被好好说出来；让一个人，被好好听见。
        </p>
        <p className="mt-5 text-base font-medium text-[var(--anyu-ink)]">
          如果你有一位你在乎的人，也许你不需要做很多事。只需要：更早一点，知道他们在想你。
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/cn/lamp-voice"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#9D6A4D] px-5 py-3 text-white transition hover:bg-[#8a5d43] sm:w-auto"
          >
            开始体验安语
          </Link>
          <Link
            href="/cn/for-family"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--anyu-border)] bg-white px-5 py-3 text-[var(--anyu-ink)] transition hover:bg-[#F9F2EA] sm:w-auto"
          >
            为家人开启连接
          </Link>
        </div>
      </section>
    </div>
  );
}
