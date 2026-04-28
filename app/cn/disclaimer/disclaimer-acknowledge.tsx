import Link from "next/link";

type Props = {
  /** 已通过服务端校验的站内路径，默认 `/cn` */
  nextHref: string;
};

export function DisclaimerAcknowledge({ nextHref }: Props) {
  return (
    <section
      className="space-y-6 rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 md:p-8"
      aria-labelledby="disclaimer-ack-title"
    >
      <h2 id="disclaimer-ack-title" className="text-xl font-medium text-[var(--anyu-ink)]">
        使用前确认
      </h2>

      <form
        method="POST"
        action={`/api/cn/disclaimer-ack?next=${encodeURIComponent(nextHref)}`}
        className="space-y-6"
      >
        <label className="flex cursor-pointer items-start gap-3 text-[var(--anyu-ink)]">
          <input
            type="checkbox"
            name="agree"
            required
            className="mt-1.5 h-5 w-5 shrink-0 rounded border-[var(--anyu-border)] accent-[var(--anyu-accent)]"
          />
          <span>我已阅读并同意上述说明</span>
        </label>

        <p className="text-base text-[var(--anyu-ink-muted)]">请先勾选，再继续浏览本站其他页面。</p>

        <div>
          <button
            type="submit"
            className="inline-flex rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg)] px-6 py-4 text-lg text-[var(--anyu-ink)] shadow-sm hover:border-[var(--anyu-accent)]/40"
          >
            进入首页
          </button>
        </div>
      </form>
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
