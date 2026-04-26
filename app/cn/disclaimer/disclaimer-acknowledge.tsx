"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  /** 已通过服务端校验的站内路径，默认 `/cn` */
  nextHref: string;
};

/**
 * 《免责声明页 Spec》交互：勾选后调用服务端写入 HttpOnly cookie，再跳转（与 middleware 一致）。
 */
export function DisclaimerAcknowledge({ nextHref }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onEnterHome() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/cn/disclaimer-ack", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) {
        setError("暂时无法完成确认，请稍后再试。");
        return;
      }
      window.location.assign(nextHref);
    } catch {
      setError("网络异常，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="space-y-6 rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 md:p-8"
      aria-labelledby="disclaimer-ack-title"
    >
      <h2 id="disclaimer-ack-title" className="text-xl font-medium text-[var(--anyu-ink)]">
        使用前确认
      </h2>

      <label className="flex cursor-pointer items-start gap-3 text-[var(--anyu-ink)]">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1.5 h-5 w-5 shrink-0 rounded border-[var(--anyu-border)] accent-[var(--anyu-accent)]"
        />
        <span>我已阅读并同意上述说明</span>
      </label>

      {!agreed ? (
        <p className="text-base text-[var(--anyu-ink-muted)]">请先勾选，再继续浏览本站其他页面。</p>
      ) : null}

      {error ? <p className="text-base text-[var(--anyu-risk)]">{error}</p> : null}

      <div>
        {agreed ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void onEnterHome()}
            className="inline-flex rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg)] px-6 py-4 text-lg text-[var(--anyu-ink)] shadow-sm hover:border-[var(--anyu-accent)]/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "处理中…" : "进入首页"}
          </button>
        ) : (
          <span className="inline-flex rounded-2xl border border-[var(--anyu-border)] px-6 py-4 text-lg text-[var(--anyu-ink-muted)] opacity-60">
            进入首页
          </span>
        )}
      </div>
    </section>
  );
}

/** 页内轻量导航（不写入 cookie），仍允许访问公开 `/cn` 子路径 */
export function DisclaimerInlineNav() {
  return (
    <nav className="flex flex-wrap justify-center gap-4 border-t border-[var(--anyu-border)] pt-8 text-base">
      <Link href="/cn/ethics" className="text-[var(--anyu-accent)] underline-offset-4 hover:underline">
        我们的原则
      </Link>
      <Link href="/cn/safety" className="text-[var(--anyu-accent)] underline-offset-4 hover:underline">
        安全与预警
      </Link>
      <Link href="/cn" className="text-[var(--anyu-accent)] underline-offset-4 hover:underline">
        返回首页
      </Link>
    </nav>
  );
}
