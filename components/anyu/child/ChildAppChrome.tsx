import Link from "next/link";
import { ChildBottomNav } from "@/components/anyu/child/ChildBottomNav";

export function ChildAppChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--child-app-bg)] text-[var(--anyu-ink)] text-[16px] leading-relaxed pb-28">
      <header className="sticky top-0 z-30 border-b border-[var(--anyu-border)] bg-[var(--child-app-bg)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-start justify-between gap-3 px-4 py-4">
          <div>
            <Link href="/cn/child" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-[var(--anyu-ink)]">
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-[var(--child-brand-heart)]" aria-hidden>
                <path
                  fill="currentColor"
                  d="M12 21s-7-4.35-10-9c-2.5-4 1-8 5.5-8 2.5 0 4.5 1.5 4.5 4 0-2.5 2-4 4.5-4 4.5 0 8 4 5.5 8-3 4.65-10 9-10 9Z"
                  opacity="0.9"
                />
              </svg>
              安语
            </Link>
            <p className="mt-0.5 text-xs text-[var(--anyu-ink-muted)]">家庭连接从理解开始</p>
          </div>
          <Link
            href="/cn/child/notifications"
            className="rounded-full p-2 text-[var(--anyu-ink-muted)] hover:bg-[var(--anyu-bg-card)] hover:text-[var(--anyu-ink)]"
            aria-label="提醒中心"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M18 8A6 6 0 1 0 6 8c0 7-3 7-3 7h12s-3 0-3-7" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-5">{children}</main>
      <ChildBottomNav />
    </div>
  );
}
