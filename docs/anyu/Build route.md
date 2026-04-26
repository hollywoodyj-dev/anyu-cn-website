Build route（与仓库一致：中文官网在 `app/cn/`，本草稿对应首页 `page.tsx`，线上 `/cn`）：

app/cn/page.tsx



Purpose:

AnYu official marketing webpage.

Warm, trustworthy, family-connection focused.

Not a chatbot website.

// app/cn/page.tsx



export default function AnYuLandingPage() {

  return (

    <main className="min-h-screen bg-[#FFF8F0] text-[#3B2A1E]">

      <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-20 md:grid md:grid-cols-2 md:gap-16">

        <div>

          <p className="mb-6 text-lg font-medium text-[#9B6B43]">安语 AnYu</p>



          <h1 className="max-w-xl text-5xl font-semibold leading-tight md:text-6xl">

            让长者更容易说出心里的话

          </h1>



          <p className="mt-8 max-w-lg text-2xl leading-relaxed text-[#6F5846]">

            不是替代家人，

            <br />

            而是让彼此重新听见。

          </p>



          <div className="mt-10 flex flex-col gap-4 sm:flex-row">

            <a

              href="#demo"

              className="rounded-full bg-[#9B6B43] px-8 py-4 text-center text-lg font-medium text-white"

            >

              观看 Demo

            </a>

            <a

              href="#contact"

              className="rounded-full border border-[#9B6B43] px-8 py-4 text-center text-lg font-medium text-[#9B6B43]"

            >

              申请试用

            </a>

          </div>

        </div>



        <div className="mt-16 w-full md:mt-0">

          <div className="rounded-[40px] bg-white p-6 shadow-sm">

            <div className="rounded-[32px] bg-[#FFF4EA] p-8">

              <p className="text-4xl">☀️</p>

              <h2 className="mt-6 text-3xl font-semibold">

                今天想说点什么？

              </h2>

              <p className="mt-4 text-xl leading-relaxed text-[#7A6250]">

                慢慢说就好，不用说完整。

              </p>



              <div className="mt-8 rounded-3xl bg-white p-5 text-xl text-[#8A7564]">

                我今天有点孤单……

              </div>



              <div className="mt-6 grid gap-3">

                <button className="rounded-2xl bg-[#F6E7D8] px-5 py-4 text-left text-lg">

                  我想孩子了

                </button>

                <button className="rounded-2xl bg-[#F6E7D8] px-5 py-4 text-left text-lg">

                  我不知道怎么说

                </button>

              </div>



              <button className="mt-6 w-full rounded-full bg-[#9B6B43] py-4 text-xl text-white">

                说出来

              </button>

            </div>

          </div>

        </div>

      </section>



      <section className="mx-auto max-w-6xl px-6 py-24">

        <h2 className="max-w-3xl text-4xl font-semibold leading-tight">

          很多长者不是没有话说，

          <br />

          而是不知道怎么开口。

        </h2>



        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {[

            "我怕麻烦孩子",

            "我想他们，但不想打扰",

            "我不舒服，但不好意思说",

          ].map((quote) => (

            <div

              key={quote}

              className="rounded-[32px] bg-white p-8 text-2xl leading-relaxed shadow-sm"

            >

              “{quote}”

            </div>

          ))}

        </div>

      </section>



      <section className="bg-white px-6 py-24">

        <div className="mx-auto max-w-6xl">

          <h2 className="text-4xl font-semibold">安语在做什么</h2>



          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {[

              {

                icon: "🫧",

                title: "帮长者表达情绪",

                text: "把说不出口的话，变得温和可说。",

              },

              {

                icon: "💛",

                title: "帮家庭重新连接",

                text: "让子女收到更容易回应的信息。",

              },

              {

                icon: "🧡",

                title: "在需要时提醒家人",

                text: "当出现危险情绪时，让人回到人身边。",

              },

            ].map((item) => (

              <div

                key={item.title}

                className="rounded-[32px] bg-[#FFF8F0] p-8 shadow-sm"

              >

                <p className="text-4xl">{item.icon}</p>

                <h3 className="mt-6 text-2xl font-semibold">{item.title}</h3>

                <p className="mt-4 text-xl leading-relaxed text-[#6F5846]">

                  {item.text}

                </p>

              </div>

            ))}

          </div>

        </div>

      </section>



      <section id="demo" className="mx-auto max-w-6xl px-6 py-24">

        <h2 className="text-4xl font-semibold">真实 Demo Flow</h2>



        <div className="mt-12 grid gap-6 md:grid-cols-3">

          <DemoCard

            step="Step 1"

            title="长者说"

            text="我今天有点孤单"

          />

          <DemoCard

            step="Step 2"

            title="安语帮他说"

            text="我今天有点想你。有空给我打个电话就好。"

          />

          <DemoCard

            step="Step 3"

            title="家人收到"

            text="妈妈刚刚想听听你的声音。"

          />

        </div>

      </section>



      <section className="bg-[#F6E7D8] px-6 py-24">

        <div className="mx-auto max-w-6xl">

          <h2 className="text-4xl font-semibold">安全与伦理</h2>



          <div className="mt-10 grid gap-4 md:grid-cols-2">

            {[

              "安语不会替代家人",

              "安语不会制造依赖",

              "安语不会做医疗或人生决定",

              "安语在危险时，会把人带回人身边",

            ].map((item) => (

              <div

                key={item}

                className="rounded-3xl bg-white px-6 py-5 text-xl shadow-sm"

              >

                {item}

              </div>

            ))}

          </div>



          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#6F5846]">

            这个原则与安语的安全伦理框架一致：AI 不替代真实关系，不制造依赖，并在高风险时让位给人类支持系统。 [oai_citation:0‡长者情感沟通AI.txt](sediment://file_000000006c7871fa93ef00195e9d561a)

          </p>

        </div>

      </section>



      <section className="mx-auto max-w-6xl px-6 py-24">

        <h2 className="text-4xl font-semibold">适合使用场景</h2>



        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {["家庭使用", "养老机构", "护理服务"].map((item) => (

            <div

              key={item}

              className="rounded-[32px] bg-white p-8 text-2xl font-medium shadow-sm"

            >

              {item}

            </div>

          ))}

        </div>

      </section>



      <section

        id="contact"

        className="mx-auto max-w-5xl px-6 pb-28 pt-10 text-center"

      >

        <div className="rounded-[40px] bg-[#3B2A1E] px-8 py-16 text-white">

          <h2 className="text-4xl font-semibold">让沟通变得更容易</h2>

          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-[#F6E7D8]">

            为家庭、护理机构与长者服务设计。

          </p>



          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

            <a

              href="mailto:hello@anyu.ai"

              className="rounded-full bg-white px-8 py-4 text-lg font-medium text-[#3B2A1E]"

            >

              申请 Demo

            </a>

            <a

              href="mailto:hello@anyu.ai"

              className="rounded-full border border-white px-8 py-4 text-lg font-medium text-white"

            >

              联系我们

            </a>

          </div>

        </div>

      </section>

    </main>

  );

}



function DemoCard({

  step,

  title,

  text,

}: {

  step: string;

  title: string;

  text: string;

}) {

  return (

    <div className="rounded-[32px] bg-white p-8 shadow-sm">

      <p className="text-sm font-semibold uppercase tracking-wide text-[#9B6B43]">

        {step}

      </p>

      <h3 className="mt-4 text-2xl font-semibold">{title}</h3>

      <p className="mt-5 text-2xl leading-relaxed text-[#6F5846]">

        “{text}”

      </p>

    </div>

  );

}

Nova Notes:



1. Replace hello@anyu.ai with the final contact email.

2. Add AnYu logo once final logo is locked.

3. Later connect “观看 Demo” to an embedded product demo video.

4. This is the marketing webpage, not the elder-use app screen.

5. Safety messaging must remain visible but not frightening.

这版已经可以作为官网第一版上线基础。

