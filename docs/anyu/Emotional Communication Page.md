Nova Task:

Build AnYu Elder Emotional Communication Page



Route（与仓库一致）：

/app/cn/for-elder/page.tsx



Goal:

Create a warm, simple elder-facing page for AnYu.

This page helps elderly users express feelings, request family connection, and enter safe emotional communication.



Must follow:

- Very large text

- Few buttons

- Warm visual tone

- No technical words

- No “AI” emphasis

- One clear action per screen

- Risk/safety path must visually stand out



Core system must align with Risk Engine first, normal response second, and human support for L3/L4 risk.







// app/cn/for-elder/page.tsx



"use client";



import { useState } from "react";



type Mode =

  | "idle"

  | "response"

  | "family"

  | "safety";



export default function AnYuPage() {

  const [message, setMessage] = useState("");

  const [mode, setMode] = useState<Mode>("idle");

  const [response, setResponse] = useState("");



  const quickPrompts = [

    "我今天有点孤单",

    "我想孩子了",

    "我有点不舒服",

    "我不知道怎么说",

  ];



  async function handleSubmit() {

    if (!message.trim()) return;



    // Nova:

    // Replace this mock with POST /api/elder-chat/message

    // Risk Engine must run before normal response.

    if (

      message.includes("不想活") ||

      message.includes("活着没意思") ||

      message.includes("撑不下去")

    ) {

      setMode("safety");

      return;

    }



    setResponse("听起来你今天心里有点空。你不是想麻烦谁，只是希望有人听你说几句。");

    setMode("response");

  }



  return (

    <main className="min-h-screen bg-[#FFF8F0] text-[#3B2A1E] flex items-center justify-center px-5 py-8">

      <div className="w-full max-w-md">



        {mode === "idle" && (

          <section className="rounded-[32px] bg-white shadow-sm p-6 space-y-6">

            <div className="space-y-2">

              <p className="text-4xl">☀️</p>

              <h1 className="text-3xl font-semibold leading-tight">

                今天想说点什么？

              </h1>

              <p className="text-xl text-[#7A6250] leading-relaxed">

                慢慢说就好，不用说完整。

              </p>

            </div>



            <textarea

              value={message}

              onChange={(e) => setMessage(e.target.value)}

              placeholder="你可以说一句话……"

              className="w-full min-h-[150px] rounded-3xl border border-[#E8D8C8] bg-[#FFFDF9] p-5 text-2xl leading-relaxed outline-none focus:border-[#CFAE8A]"

            />



            <div className="grid grid-cols-1 gap-3">

              {quickPrompts.map((prompt) => (

                <button

                  key={prompt}

                  onClick={() => setMessage(prompt)}

                  className="rounded-2xl bg-[#F6E7D8] px-5 py-4 text-left text-xl hover:bg-[#EED8C2]"

                >

                  {prompt}

                </button>

              ))}

            </div>



            <button

              onClick={handleSubmit}

              className="w-full rounded-full bg-[#9B6B43] py-5 text-2xl font-medium text-white"

            >

              说出来

            </button>



            <p className="text-center text-sm text-[#8A7564] leading-relaxed">

              如果你不太舒服，也可以联系家人或身边的人。

            </p>

          </section>

        )}



        {mode === "response" && (

          <section className="rounded-[32px] bg-white shadow-sm p-6 space-y-6">

            <p className="text-4xl">🫧</p>



            <div className="rounded-3xl bg-[#FFF4EA] p-5">

              <p className="text-2xl leading-relaxed">

                {response}

              </p>

            </div>



            <div className="space-y-3">

              <button

                onClick={() => setMode("idle")}

                className="w-full rounded-full bg-[#F6E7D8] py-4 text-xl"

              >

                再说一点

              </button>



              <button

                onClick={() => {

                  setResponse("可以这样说：我今天有点想你。如果你有空，想听听你的声音。");

                  setMode("family");

                }}

                className="w-full rounded-full bg-[#F6E7D8] py-4 text-xl"

              >

                换一种说法

              </button>



              <button

                onClick={() => setMode("family")}

                className="w-full rounded-full bg-[#9B6B43] py-4 text-xl text-white"

              >

                发给家人

              </button>

            </div>

          </section>

        )}



        {mode === "family" && (

          <section className="rounded-[32px] bg-white shadow-sm p-6 space-y-6">

            <p className="text-4xl">💛</p>

            <h2 className="text-3xl font-semibold">

              可以这样发给家人

            </h2>



            <div className="rounded-3xl bg-[#FFF4EA] p-5">

              <p className="text-2xl leading-relaxed">

                我今天有点想你。你不用担心我，我只是想听听你的声音。有空的时候给我打个电话就好。

              </p>

            </div>



            <button className="w-full rounded-full bg-[#9B6B43] py-5 text-2xl text-white">

              发送给家人

            </button>



            <button

              onClick={() => setMode("idle")}

              className="w-full rounded-full bg-[#F6E7D8] py-4 text-xl"

            >

              回到首页

            </button>

          </section>

        )}



        {mode === "safety" && (

          <section className="rounded-[32px] bg-white shadow-sm p-6 space-y-6 border-2 border-[#D46A6A]">

            <p className="text-4xl">🧡</p>



            <h2 className="text-3xl font-semibold leading-tight">

              我有点担心你现在的状态

            </h2>



            <p className="text-2xl leading-relaxed text-[#5A4030]">

              你不需要一个人撑着。请联系家人、紧急联系人，或身边可信任的人。

            </p>



            <button className="w-full rounded-full bg-[#B94A48] py-5 text-2xl text-white">

              联系紧急联系人

            </button>



            <button className="w-full rounded-full bg-[#F6E7D8] py-5 text-2xl">

              打电话给家人

            </button>



            <p className="text-base leading-relaxed text-[#7A6250]">

              如果在澳洲，也可以联系 Lifeline：13 11 14

            </p>

          </section>

        )}



      </div>

    </main>

  );

}







Nova Notes:



1. Replace mock submit logic with:

POST /api/elder-chat/message



2. If API returns:

mode = urgent_alert or safety_risk

→ show safety screen



3. If API returns:

mode = family_message

→ show family message screen



4. Do not expose full risk language to elder.

Keep the UI calm.



5. Consent and emergency contacts must connect to:

ConsentSetting

EmergencyContact

RiskEvent