"use client";

import Image from "next/image";
import { MessageCircle, Sparkles } from "lucide-react";
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
 * 首页右侧 Hero：主家庭整图，左/下缘与背景 **渐变融边**；灯与 App 在下方
 * `LampAndAppShowcase` 独立展示。无整图时仅轻量回退（避免与下方展块重复）。
 */
export function HomeHeroVisual() {
  const [heroSrc, setHeroSrc] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void (async () => {
      let hero: string | null = null;
      if (await assetOk("/anyu/home/hero-lifestyle.jpg")) {
        hero = "/anyu/home/hero-lifestyle.jpg";
      } else if (await assetOk("/anyu/home/hero-lifestyle.webp")) {
        hero = "/anyu/home/hero-lifestyle.webp";
      } else if (await assetOk("/anyu/home/hero-lifestyle.png")) {
        hero = "/anyu/home/hero-lifestyle.png";
      }
      setHeroSrc(hero);
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
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-[#F8F3EC] shadow-2xl shadow-[#B08B6C]/20 ring-1 ring-white/50 lg:aspect-[5/6]">
          <Image
            src={heroSrc}
            alt="安语与家庭：让没说出口的话被听见"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 44vw"
            priority
          />
          {/* 与页面底色融边：靠文案一侧 + 底缘 */}
          <div
            className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-[min(100%,8rem)] bg-gradient-to-r from-[#F8F3EC] from-[8%] via-[#F8F3EC]/50 to-transparent sm:w-[10rem] md:from-25% lg:w-[6.5rem]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-24 bg-gradient-to-t from-[#F8F3EC] from-10% to-transparent sm:h-32"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-0 z-[1] h-20 w-24 bg-gradient-to-bl from-[#F8F3EC] to-transparent opacity-60 sm:opacity-80"
            aria-hidden
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[320px] w-full max-w-[540px] items-center justify-center rounded-[2.5rem] border border-dashed border-[#D9A27F]/50 bg-gradient-to-b from-white/50 to-[#F5EBE0]/40 p-6 lg:mx-0 lg:min-h-[400px]">
      <div className="w-full max-w-sm rounded-[2rem] border border-white bg-white/90 p-6 text-center shadow-lg shadow-[#B08B6C]/15">
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#A86F4C]">
          <Sparkles className="h-4 w-4" aria-hidden />
          主视觉图
        </div>
        <p className="mt-3 text-left text-sm leading-7 text-[#6D5F55]">
          在 <span className="font-mono text-xs text-[#8B7B70]">public/anyu/home/hero-lifestyle.jpg</span>{" "}
          放置家庭场景图后，将自动显示为右侧大图（带与背景的渐变融边）。灯与 App 见下方独立区块。
        </p>
        <div className="mt-4 rounded-2xl border border-[#F0E5DA] bg-[#FDF9F4] p-4 text-left">
          <div className="flex items-center gap-2 text-sm text-[#A86F4C]">
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
            安语整理为
          </div>
          <p className="mt-2 text-base text-[#4A3F37]">“我今天有点想你，想听听你的声音。”</p>
        </div>
      </div>
    </div>
  );
}
