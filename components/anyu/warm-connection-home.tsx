import Link from "next/link";
import {
  Bell,
  Heart,
  Leaf,
  Link2,
  Lock,
  MessageCircle,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { HomeHeroVisual } from "./home-hero-visual";
import { SafetyNotice } from "./safety-notice";

/**
 * 首页 · 温暖连接版（对齐正式官网 UI 方向；动效仅用轻量 hover，符合「几乎无动效」）。
 * 文案避免未经验证的具体数字；不堆「AI 产品腔」。
 */
export function WarmConnectionHome() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#F8F3EC] text-[#3C332C] md:rounded-[2rem]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-[-80px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#F2C9A8]/30 blur-3xl" />
        <div className="absolute right-[-120px] top-[180px] h-[520px] w-[520px] rounded-full bg-[#F7D9C4]/40 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[20%] h-[520px] w-[520px] rounded-full bg-[#E7D7C8]/50 blur-3xl" />
      </div>

      <div className="relative z-10 px-1 pb-16 pt-4 md:px-2 md:pb-24 md:pt-6">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 pb-16 pt-4 lg:grid-cols-2 lg:gap-14 lg:pb-24 lg:pt-8">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-2 text-sm text-[#7D6757] shadow-sm">
              <Sparkles className="h-4 w-4 shrink-0 text-[#9D6A4D]" aria-hidden />
              为长者与家人设计的情感连接系统
            </div>

            <h1 className="font-semibold leading-tight tracking-tight text-[#322A24]">
              <span className="block text-[clamp(1.2rem,4.5vw,3.75rem)] whitespace-nowrap md:text-5xl lg:text-6xl">
                让父母没说出口的话，
              </span>
              <span className="mt-2 block text-[clamp(1.2rem,4.8vw,3.75rem)] text-[#A86F4C] md:text-5xl lg:text-6xl">
                被温柔听见。
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#6D5F55] md:text-xl md:leading-9">
              安语不是来替代家人的。它只是帮助长者把心里的话慢慢说出来，也让子女更早听见那些没有说出口的需要。
            </p>

            <div className="mt-7 flex flex-wrap gap-2 text-sm text-[#8B7B70]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1">
                许多家庭正在慢慢用安语，把不好说的话说清楚一点。
              </span>
            </div>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-2xl bg-[#9D6A4D] px-7 py-4 text-center text-base text-white shadow-lg shadow-[#9D6A4D]/20 transition hover:bg-[#8a5d43]"
              >
                看看它如何连接家人
              </Link>
              <Link
                href="/cn/product"
                className="inline-flex items-center justify-center rounded-2xl border border-white bg-white/80 px-7 py-4 text-center text-base text-[#6D4F3D] shadow-sm transition hover:bg-white"
              >
                申请试用
              </Link>
            </div>
          </div>

          {/* Hero 视觉：有整图则与设计稿一致；否则回退 CSS 三卡 + 可选 lamp/app 截图 */}
          <HomeHeroVisual />
        </section>

        {/* 共鸣 */}
        <section className="mx-auto max-w-6xl pb-16 md:pb-20" aria-labelledby="empathy-heading">
          <div className="rounded-[2.5rem] border border-white bg-white/65 p-8 shadow-sm md:p-12">
            <h2 id="empathy-heading" className="text-2xl font-semibold text-[#342B25] md:text-4xl">
              很多时候，他们不是不想说。
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                "拿着手机很久，却没有发出那条消息。",
                "嘴上说“没事”，其实心里已经很久没人问。",
                "想你，但又怕打扰你、麻烦你。",
              ].map((text) => (
                <div
                  key={text}
                  className="rounded-3xl border border-[#F0E7DE] bg-[#FBF6F0] p-6 text-base leading-7 text-[#6C5D53] md:text-lg md:leading-8"
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 如何工作 */}
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl scroll-mt-28 pb-16 md:pb-24"
          aria-labelledby="how-heading"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="how-heading" className="text-3xl font-semibold text-[#342B25] md:text-4xl">
              安语让连接重新发生
            </h2>
            <p className="mt-5 text-base leading-7 text-[#74665B] md:text-lg md:leading-8">
              不分析，不评判，不替代家人。只是把难说出口的话，变成更容易被听见的表达。
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: MessageCircle,
                title: "父母说一句话",
                text: "可以是不完整的、含糊的，甚至只是“今天有点累”。",
              },
              {
                icon: Heart,
                title: "安语温柔整理",
                text: "把情绪背后的需要，整理成不伤人的表达。",
              },
              {
                icon: Bell,
                title: "家人更早听见",
                text: "子女收到轻提醒，知道什么时候该靠近一点。",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-[2rem] border border-white bg-white/80 p-7 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3D6C1] text-[#8C5B3E]">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#3D332C]">{title}</h3>
                <p className="mt-3 text-base leading-7 text-[#74665B]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 四卡能力 */}
        <section className="mx-auto max-w-6xl pb-16 md:pb-20" aria-labelledby="features-heading">
          <h2 id="features-heading" className="sr-only">
            安语能为你做什么
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Heart, title: "理解情绪", text: "听懂话里的想念、委屈和累。" },
              { icon: Users, title: "连接家人", text: "把两端的话，轻轻对齐。" },
              { icon: ShieldCheck, title: "安全守护", text: "不对劲时，优先回到人身边。" },
              { icon: Lock, title: "隐私保护", text: "数据边界清楚，不做营销滥用。" },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-[2rem] border border-white bg-white/75 p-6 text-center shadow-sm md:p-7"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3D6C1]/90 text-[#8C5B3E]">
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#3D332C]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#74665B] md:text-base md:leading-7">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 我们的承诺 — 对齐伦理四向 */}
        <section className="mx-auto max-w-6xl pb-16 md:pb-20" aria-labelledby="promise-heading">
          <h2 id="promise-heading" className="text-center text-3xl font-semibold text-[#342B25] md:text-4xl">
            我们的承诺
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-[#74665B] md:text-lg">
            与
            <Link href="/cn/ethics" className="mx-1 text-[#9D6A4D] underline-offset-2 hover:underline">
              我们的原则
            </Link>
            、
            <Link href="/cn/safety" className="mx-1 text-[#9D6A4D] underline-offset-2 hover:underline">
              安全与预警
            </Link>
            一致。
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Users,
                title: "不替代关系",
                text: "不代替子女或照护者；重要的支持仍在人与人之间。",
              },
              {
                icon: Leaf,
                title: "不制造依赖",
                text: "鼓励真实联系与面对面陪伴。",
              },
              {
                icon: Shield,
                title: "不做人生决定",
                text: "不提供医疗诊断或家庭决策结论。",
              },
              {
                icon: Link2,
                title: "安全优先",
                text: "高风险时，让人回到家人与专业人员身边。",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-[2rem] border border-[#F0E7DE] bg-[#FBF7F2] p-6 text-center md:p-7"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#9D6A4D] shadow-sm">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#3D332C]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6D5F55]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 深色信任带 */}
        <section className="mx-auto max-w-6xl pb-16 md:pb-28" aria-labelledby="trust-band">
          <div className="grid items-center gap-10 rounded-[2.5rem] bg-[#3B312B] p-8 text-white shadow-2xl shadow-[#3B312B]/20 md:grid-cols-[1.2fr_0.8fr] md:p-12">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#F2C9A8] md:text-base">
                <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden />
                安全与伦理
              </div>
              <h2 id="trust-band" className="mt-5 text-2xl font-semibold leading-tight md:text-4xl">
                安语不会取代家人。
              </h2>
              <p className="mt-5 text-base leading-7 text-[#E8DDD4] md:text-lg md:leading-8">
                它不会制造依赖，不会替人做决定，也不会站在任何一方。当情况变严重时，系统会让人回到人身边。
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
              {[
                "不替代真实关系",
                "不制造情感依赖",
                "不做医疗或家庭决定",
                "高风险时优先联系真人",
              ].map((text) => (
                <div key={text} className="border-b border-white/10 py-4 text-[#F6EDE6] last:border-b-0">
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl">
          <SafetyNotice title="安全提示">
            <p>
              当系统发现父母情绪异常或有风险时，不会继续聊天，会优先建议联系家人，并在授权下通知亲人。
            </p>
            <p className="text-[var(--anyu-ink-muted)]">因为有些时候，他们需要的是身边的人。</p>
            <p className="text-sm text-[var(--anyu-ink-muted)]">（Human Override：人始终优先。）</p>
          </SafetyNotice>
        </div>

        <section
          className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-4 border-t border-[#E5D9CE] pt-12 text-center"
          aria-labelledby="cta-bottom"
        >
          <h2 id="cta-bottom" className="text-xl font-medium text-[#322A24] md:text-2xl">
            让沟通变得更容易
          </h2>
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-2xl border border-[#E5D9CE] bg-white px-6 py-3 text-[#6D4F3D] transition hover:border-[#9D6A4D]/40"
            >
              看看如何工作
            </Link>
            <Link
              href="/cn/product"
              className="inline-flex items-center justify-center rounded-2xl bg-[#9D6A4D] px-6 py-3 text-white transition hover:bg-[#8a5d43]"
            >
              申请试用
            </Link>
          </div>
          <p className="text-sm text-[#8B7B70]">
            联系：
            <a href="mailto:hello@anyu.ai" className="text-[#9D6A4D] underline-offset-2 hover:underline">
              hello@anyu.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
