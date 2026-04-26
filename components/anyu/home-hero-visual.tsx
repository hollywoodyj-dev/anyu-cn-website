"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Heart, MessageCircle, PhoneCall } from "lucide-react";
import { useEffect, useState } from "react";

async function assetOk(path: string): Promise<boolean> {
  try {
    const res = await fetch(path, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 首页右侧 Hero：优先整幅 `hero-lifestyle.jpg`（与设计稿一致）；
 * 否则回退为三卡 CSS 示意，并可选 `lamp.png` / `child-app.png` 替换局部。
 */
export function HomeHeroVisual() {
  const [heroSrc, setHeroSrc] = useState<string | null>(null);
  const [lampPhoto, setLampPhoto] = useState(false);
  const [appPhoto, setAppPhoto] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void (async () => {
      let hero: string | null = null;
      if (await assetOk("/anyu/home/hero-lifestyle.jpg")) {
        hero = "/anyu/home/hero-lifestyle.jpg";
      } else if (await assetOk("/anyu/home/hero-lifestyle.webp")) {
        hero = "/anyu/home/hero-lifestyle.webp";
      }
      const [l, a] = await Promise.all([
        assetOk("/anyu/home/lamp.png"),
        assetOk("/anyu/home/child-app.png"),
      ]);
      setHeroSrc(hero);
      setLampPhoto(l);
      setAppPhoto(a);
      setChecked(true);
    })();
  }, []);

  if (!checked) {
    return (
      <div className="relative mx-auto w-full max-w-[640px] lg:mx-0" aria-hidden>
        <div className="aspect-[4/5] w-full rounded-[2.5rem] bg-[#EDE4D9]/70 ring-1 ring-white/50 lg:aspect-[5/6]" />
      </div>
    );
  }

  if (heroSrc) {
    return (
      <div className="relative mx-auto w-full max-w-[640px] lg:mx-0">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-[#B08B6C]/25 ring-1 ring-white/60 lg:aspect-[5/6]">
          <Image
            src={heroSrc}
            alt="安语灯与家庭：让没说出口的话被听见"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 44vw"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-[480px] w-full max-w-[560px] lg:mx-0 lg:min-h-[520px]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 520" fill="none" aria-hidden>
        <path
          d="M160 250 C230 110, 375 130, 415 230 C450 315, 345 390, 255 342"
          stroke="#D9A27F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="7 10"
          opacity="0.55"
        />
      </svg>

      <div className="absolute left-0 top-24 flex w-56 flex-col items-center rounded-[3rem] border border-white bg-white/80 py-8 shadow-2xl shadow-[#B08B6C]/20 backdrop-blur sm:left-4 sm:w-64 md:top-32 md:py-10">
        {lampPhoto ? (
          <div className="relative h-36 w-28 sm:h-40 sm:w-32">
            <Image
              src="/anyu/home/lamp.png"
              alt="安语灯"
              fill
              className="object-contain object-bottom drop-shadow-md"
              sizes="128px"
            />
          </div>
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF8EE] via-[#F6CFAE] to-[#EAA981] shadow-[0_0_60px_rgba(230,157,111,0.45)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/60">
              <Heart className="h-7 w-7 text-[#A86543]" aria-hidden />
            </div>
          </div>
        )}
        <div className="mt-6 text-lg font-medium text-[#4B4038]">安语灯</div>
        <p className="mt-2 max-w-[11rem] px-4 text-center text-sm leading-6 text-[#85766C]">
          “我今天有点想孩子。”
        </p>
        <div className="mt-5 h-14 w-14 rounded-full border-4 border-white bg-[#F5D7BE] shadow-inner md:mt-7 md:h-16 md:w-16" aria-hidden />
      </div>

      <div className="absolute right-0 top-6 w-[min(100%,18rem)] rounded-[2rem] border border-white bg-white/90 p-5 shadow-xl shadow-[#B08B6C]/15 backdrop-blur sm:right-2 sm:w-72 md:right-6 md:p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-[#A86F4C] md:text-base">
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
          安语整理为
        </div>
        <p className="mt-3 text-base leading-7 text-[#4A3F37] md:mt-4 md:text-lg md:leading-8">
          “我今天有点想你，想听听你的声音。”
        </p>
      </div>

      <div className="absolute bottom-4 right-0 w-[min(100%,18rem)] rounded-[2.4rem] bg-[#332B27] p-2.5 shadow-2xl shadow-[#4A3325]/30 sm:right-4 sm:w-72 md:bottom-12 md:right-8">
        <div className="flex min-h-[280px] flex-col overflow-hidden rounded-[2rem] bg-[#FFF9F2] md:min-h-[300px]">
          {appPhoto ? (
            <div className="relative min-h-[200px] w-full flex-1">
              <Image
                src="/anyu/home/child-app.png"
                alt="子女端：情绪趋势与提醒"
                fill
                className="object-cover object-top"
                sizes="288px"
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col p-4 md:p-5">
              <div className="flex items-center justify-between text-sm text-[#8A7A6E]">
                <span>子女端 · 情绪趋势</span>
                <Bell className="h-4 w-4" aria-hidden />
              </div>
              <svg viewBox="0 0 200 48" className="mt-3 w-full text-[#C49A7C]" aria-hidden>
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  points="0,38 28,34 56,28 84,22 112,16 140,12 168,8 200,6"
                />
              </svg>
              <div className="mt-4 rounded-2xl border border-[#F0E5DA] bg-white p-4 shadow-sm">
                <div className="text-sm text-[#9A7C65]">妈妈今天</div>
                <div className="mt-1 text-2xl font-semibold text-[#3E342D]">有点想你</div>
                <p className="mt-3 text-sm leading-6 text-[#76685E]">
                  有空时，可以给她打个电话。先不用问太多，听她说几句就好。
                </p>
              </div>
            </div>
          )}
          <div className="border-t border-[#F0E5DA] bg-[#FFF9F2] p-3 md:p-4">
            <Link
              href="/cn/for-family"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#9D6A4D] py-3 text-sm text-white transition hover:bg-[#8a5d43]"
            >
              <PhoneCall className="h-4 w-4" aria-hidden />
              了解子女端
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
