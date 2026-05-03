"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/cn/child", label: "首页", match: (p: string) => p === "/cn/child" || p === "/cn/child/" || p.startsWith("/cn/child/dashboard") },
  { href: "/cn/child/daily", label: "今日", match: (p: string) => p.startsWith("/cn/child/daily") },
  { href: "/cn/child/memory", label: "记忆", match: (p: string) => p.startsWith("/cn/child/memory") },
  { href: "/cn/child/notifications", label: "提醒", match: (p: string) => p.startsWith("/cn/child/notifications") },
  { href: "/cn/child/settings", label: "设置", match: (p: string) => p.startsWith("/cn/child/settings") },
] as const;

export function ChildBottomNav() {
  const pathname = usePathname() || "";
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--child-nav-border)] bg-[var(--child-nav-bg)] px-1 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      aria-label="子女端主导航"
    >
      <ul className="mx-auto flex max-w-lg justify-between gap-0 px-1">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <li key={t.href} className="flex-1 min-w-0">
              <Link
                href={t.href}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-medium transition-colors ${
                  active
                    ? "text-[var(--child-tab-active)]"
                    : "text-[var(--child-tab-idle)] hover:text-[var(--anyu-ink)]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    active ? "bg-[var(--child-tab-pill)]" : "bg-transparent"
                  }`}
                  aria-hidden
                >
                  {t.label === "首页" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
                    </svg>
                  ) : t.label === "今日" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  ) : t.label === "记忆" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  ) : t.label === "提醒" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M18 8A6 6 0 1 0 6 8c0 7-3 7-3 7h12s-3 0-3-7" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="8" r="3" />
                      <path d="M5 20a7 7 0 0 1 14 0" />
                    </svg>
                  )}
                </span>
                <span className="truncate px-0.5">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
