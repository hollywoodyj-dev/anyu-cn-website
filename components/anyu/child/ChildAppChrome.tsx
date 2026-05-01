import Link from "next/link";

const links = [
  { href: "/cn/child", label: "总览" },
  { href: "/cn/child/daily", label: "今日详情" },
  { href: "/cn/child/trend", label: "趋势" },
  { href: "/cn/child/notifications", label: "提醒" },
  { href: "/cn/child/memory", label: "记忆" },
  { href: "/cn/child/consent", label: "授权与说明" },
  { href: "/cn/child/contacts", label: "联系人" },
] as const;

export function ChildAppChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--anyu-bg)] text-[var(--anyu-ink)] text-[15px] leading-relaxed">
      <header className="border-b border-[var(--anyu-border)] bg-[var(--anyu-bg-card)]">
        <div className="mx-auto max-w-3xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/cn/child" className="text-lg font-semibold tracking-tight text-[var(--anyu-ink)]">
            子女端
          </Link>
          <nav className="flex flex-wrap gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-[var(--anyu-border)] px-3 py-1.5 text-sm text-[var(--anyu-ink-muted)] hover:bg-[var(--anyu-bg)] hover:text-[var(--anyu-ink)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
    </div>
  );
}
