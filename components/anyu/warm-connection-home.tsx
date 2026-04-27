import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Feather,
  Heart,
  Leaf,
  Lightbulb,
  Lock,
  MessageCircle,
  Mic,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

/**
 * 首页（按 ImagetoCode 整页版式迁入）
 * 仅保留指定文案：`许多家庭正在慢慢用安语，把不好说的话说清楚一点。`
 */
export function WarmConnectionHome() {
  const featureCards = [
    { icon: <Heart className="h-6 w-6 text-white" fill="white" />, bg: "bg-[#D4A574]", title: "理解情绪", desc: "安语理解长者的情绪，心怀评判，不否定。" },
    { icon: <Users className="h-6 w-6 text-white" />, bg: "bg-[#C4A882]", title: "连接家人", desc: "让子女更早知道父母的状态，拉近彼此距离。" },
    { icon: <Shield className="h-6 w-6 text-white" />, bg: "bg-[#8B9A7E]", title: "安全守护", desc: "在风险出现时，安语会及时提醒家人或紧急联系人。" },
    { icon: <Lock className="h-6 w-6 text-white" />, bg: "bg-[#9B8BAA]", title: "隐私保护", desc: "你的数据只为帮助家人，多重加密，安心使用。" },
  ];

  const commitments = [
    { icon: <Users className="h-6 w-6 text-[#8B7E74]" />, title: "不替代", desc: "安语不替代人类关系，只做连接的桥梁。" },
    { icon: <Leaf className="h-6 w-6 text-[#8B7E74]" />, title: "不制造依赖", desc: "鼓励真实互动，不让长者依赖设备。" },
    { icon: <ShieldCheck className="h-6 w-6 text-[#8B7E74]" />, title: "不做决定", desc: "不提供诊断或治疗建议，重要时刻交还给人。" },
    { icon: <UserCheck className="h-6 w-6 text-[#8B7E74]" />, title: "安全为先", desc: "在危险时刻，让爱回到人身边。" },
  ];

  return (
    <div className="bg-[#FDF8F3] text-[#2D2D2D]">
      <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-8 md:px-8 md:py-12 lg:min-h-[560px]">
        <div className="absolute inset-0 hidden lg:block">
          <div
            className="absolute inset-0 rounded-[2rem]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(253,248,243,1) 0%, rgba(253,248,243,0.975) 31%, rgba(253,248,243,0.62) 39%, rgba(253,248,243,0.22) 46%, rgba(253,248,243,0.06) 51%, rgba(253,248,243,0.01) 55%, rgba(253,248,243,0) 60%), url('/anyu/mockup/anyu-hero.png')",
              backgroundRepeat: "no-repeat, no-repeat",
              backgroundPosition: "left top, right center",
              backgroundSize: "100% 100%, auto 118%",
            }}
          />
        </div>

        <div className="relative z-20 flex min-h-[480px] items-center">
          <div className="w-full max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f0e4d8] bg-white/80 px-4 py-2 text-sm text-[#8B7E74]">
              <Sparkles className="h-4 w-4 text-[#D4A574]" />
              为长者与家人设计的情感连接系统
            </div>
            <h1 className="text-4xl font-bold leading-tight text-[#2D2D2D] md:text-5xl">
              让父母没说出口的话，
              <br />
              <span className="text-[#A86F4C]">被温柔听见。</span>
            </h1>
            <p className="max-w-md leading-relaxed text-[#8B7E74]">
              安语，连接长者与家人的情感沟通系统。
              <br />
              帮助他们表达，也帮助你更早靠近。
            </p>
            <div className="flex items-center gap-4">
              <Link href="#how-it-works" className="rounded-full bg-[#D4A574] px-6 py-3 text-white transition-colors hover:bg-[#C4956A]">
                看看它如何连接家人
              </Link>
              <Link href="/cn/product" className="rounded-full border border-[#D4A574] px-6 py-3 text-[#D4A574] transition-colors hover:bg-[#D4A574] hover:text-white">
                申请试用
              </Link>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                {["刘", "吴", "周"].map((n) => (
                  <div key={n} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#E8DDD0] text-xs text-[#6D5F55]">
                    {n}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm text-[#8B7E74]">许多家庭正在慢慢用安语，把不好说的话说清楚一点。</div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-[#D4A574]" fill="#D4A574" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-[2rem] bg-[#F5EDE4] shadow-[0_24px_60px_rgba(212,165,116,0.12)] lg:hidden">
          <Image src="/anyu/mockup/anyu-hero.png" alt="安语首页首屏展示图" width={1200} height={720} className="h-[320px] w-full object-cover object-[center_56%]" />
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="inline-flex items-center gap-2 text-3xl font-bold text-[#2D2D2D] md:text-4xl">
            它是如何工作的
            <Heart className="h-5 w-5 text-[#E0A46F]" fill="#E0A46F" />
          </h2>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3 md:gap-10">
          <svg
            className="pointer-events-none absolute left-[18%] top-[46%] hidden w-[64%] -translate-y-1/2 md:block"
            viewBox="0 0 760 120"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M4 54 C 110 16, 170 92, 255 64 S 410 28, 500 60 S 650 100, 756 52"
              stroke="#E7D6C7"
              strokeWidth="2"
              strokeDasharray="4 7"
              strokeLinecap="round"
            />
          </svg>
          {[
            { n: "1", title: "父母说一句话", desc: "妈妈在安语灯前，轻轻说出\n此刻真实的心情。", side: "left" },
            { n: "2", title: "安语温柔整理", desc: "安语会结合语气和状态，\n整理成更容易被看见的话。", side: "middle" },
            { n: "3", title: "家人收到提醒", desc: "你会看到状态摘要与建议，\n知道什么时候回应更合适。", side: "right" },
          ].map((s) => (
            <div key={s.n} className="relative">
              <div className="relative flex min-h-[23rem] flex-col rounded-[2rem] border border-[#F4E6D9] bg-white px-7 pb-5 pt-6 shadow-[0_14px_38px_rgba(230,205,182,0.25)]">
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0A46F] text-sm font-semibold text-white">{s.n}</div>
                  <div>
                    <h3 className="mb-1 text-2xl font-semibold leading-none text-[#2D2D2D]">{s.title}</h3>
                    <p className="mt-2 whitespace-pre-line text-base leading-7 text-[#6F655D]">{s.desc}</p>
                  </div>
                </div>
                {s.side === "left" && (
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <div className="ml-1 w-[8rem] overflow-hidden rounded-[1.6rem] bg-[#FBF5EE]">
                      <Image src="/anyu/mockup/how-it-works-left.png" alt="安语灯产品图" width={320} height={360} className="h-[9rem] w-full object-cover object-center" />
                    </div>
                    <div className="flex min-h-[6.75rem] flex-1 items-center justify-center rounded-[1.2rem] bg-[#F7EFE6] px-4 py-3 text-center text-base leading-7 text-[#3B332E] whitespace-pre-line">
                      家里都挺好。{"\n"}晚点和你说说话就好了。
                    </div>
                  </div>
                )}
                {s.side === "middle" && (
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <div className="ml-1 flex h-24 w-24 items-center justify-center rounded-full bg-[#F7EFE6]">
                      <Image src="/anyu/mockup/anyu-logo-no-font.png" alt="安语 logo" width={84} height={84} className="h-[5.2rem] w-[5.2rem] object-contain" />
                    </div>
                    <div className="flex min-h-[6.75rem] flex-1 items-center rounded-[1.2rem] bg-[#F7F1E8] px-4 py-3 text-left text-base leading-7 text-[#3B332E] whitespace-pre-line">
                      妈妈状态挺好，{"\n"}就是有点想你。
                    </div>
                  </div>
                )}
                {s.side === "right" && (
                  <div className="relative mt-auto flex min-h-[120px] items-end justify-center pt-1">
                    <div className="w-[13rem] overflow-hidden rounded-[1.9rem] bg-[#FCF7F1]">
                      <Image src="/anyu/mockup/how-it-works-right.png" alt="安语子女端应用界面" width={360} height={520} className="h-[12.5rem] w-full object-cover object-top" />
                    </div>
                  </div>
                )}
                {s.side !== "right" ? (
                  <div className="absolute -right-5 top-1/2 z-20 hidden -translate-y-1/2 md:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_10px_25px_rgba(232,212,195,0.45)]">
                    <Heart className="h-4 w-4 text-[#E0A46F]" fill="#FFF3EA" />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="inline-flex items-center gap-2 text-2xl font-bold md:text-3xl">
            安语的陪伴，温柔而可靠
            <Feather className="h-5 w-5 text-[#D4A574]" />
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${f.bg}`}>{f.icon}</div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#8B7E74]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative min-h-[33rem] overflow-hidden rounded-3xl shadow-sm">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,251,247,1) 0%, rgba(255,251,247,0.985) 24%, rgba(255,251,247,0.9) 40%, rgba(255,251,247,0.42) 56%, rgba(255,251,247,0.08) 72%, rgba(255,251,247,0) 84%), url('/anyu/mockup/final-light-right-composition.png')",
                backgroundSize: "100% 100%, cover",
                backgroundPosition: "left top, right center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="relative z-10 p-8">
              <h3 className="mb-2 text-2xl font-bold">安语灯</h3>
              <p className="text-[#8B7E74]">为长者设计的温暖设备</p>
              <div className="space-y-3 pt-[15rem]">
                <div className="flex items-center gap-3"><Mic className="h-5 w-5 text-[#D4A574]" /><span className="text-sm">语音表达，简单自然</span></div>
                <div className="flex items-center gap-3"><Lightbulb className="h-5 w-5 text-[#D4A574]" /><span className="text-sm">柔和灯光，温暖陪伴</span></div>
                <div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-[#D4A574]" /><span className="text-sm">一键求助，安全安心</span></div>
              </div>
              <Link href="/cn/lamp-voice" className="mt-6 inline-flex items-center gap-2 text-sm text-[#D4A574] transition-all hover:gap-3">
                了解更多 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative min-h-[33rem] overflow-hidden rounded-3xl shadow-sm">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,251,247,1) 0%, rgba(255,251,247,0.98) 26%, rgba(255,251,247,0.9) 46%, rgba(255,251,247,0.52) 68%, rgba(255,251,247,0.12) 88%, rgba(255,251,247,0) 100%), url('/anyu/mockup/final-app-status-right-composition.png')",
                backgroundSize: "100% 100%, cover",
                backgroundPosition: "left top, right center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="relative z-10 p-8">
              <h3 className="mb-2 text-2xl font-bold">子女端 App</h3>
              <p className="text-[#8B7E74]">随时了解父母的状态</p>
              <div className="space-y-3 pt-[15rem]">
                <div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-[#D4A574]" /><span className="text-sm">情绪趋势，清晰可见</span></div>
                <div className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-[#D4A574]" /><span className="text-sm">贴心建议，轻松行动</span></div>
                <div className="flex items-center gap-3"><Bell className="h-5 w-5 text-[#D4A574]" /><span className="text-sm">不打扰，只在需要时提醒</span></div>
              </div>
              <Link href="/cn/for-family" className="mt-6 inline-flex items-center gap-2 text-sm text-[#D4A574] transition-all hover:gap-3">
                了解更多 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold md:text-3xl">我们的承诺</h2>
              <p className="mb-4 leading-relaxed text-[#8B7E74]">
                安语不是替代家人，
                <br />
                而是帮助家人更好地在一起。
              </p>
              <Link href="/cn/ethics" className="inline-flex items-center gap-2 text-sm text-[#D4A574] transition-all hover:gap-3">
                查看我们的伦理守则 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {commitments.map((item) => (
                <div key={item.title} className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5EDE4]">
                    {item.icon}
                  </div>
                  <h4 className="mb-1 font-semibold">{item.title}</h4>
                  <p className="text-xs leading-relaxed text-[#8B7E74]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
