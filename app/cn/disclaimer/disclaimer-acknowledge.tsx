"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * 《免责声明页 Spec》交互：勾选后才可进入站点。
 * 全产品注册流程另有独立校验；此处为官网阅读确认。
 */
export function DisclaimerAcknowledge() {
  const [agreed, setAgreed] = useState(false);

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

      <div>
        {agreed ? (
          <Link
            href="/cn"
            className="inline-flex rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg)] px-6 py-4 text-lg text-[var(--anyu-ink)] shadow-sm hover:border-[var(--anyu-accent)]/40"
          >
            进入首页
          </Link>
        ) : (
          <span className="inline-flex rounded-2xl border border-[var(--anyu-border)] px-6 py-4 text-lg text-[var(--anyu-ink-muted)] opacity-60">
            进入首页
          </span>
        )}
      </div>
    </section>
  );
}
