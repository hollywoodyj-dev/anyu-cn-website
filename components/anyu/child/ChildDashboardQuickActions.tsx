"use client";

import { useState } from "react";

type Props = { elderUserId: string };

export function ChildDashboardQuickActions({ elderUserId }: Props) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function markContacted() {
    if (busy || done) return;
    setBusy(true);
    try {
      const res = await fetch("/api/child/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderUserId, action: "mark_today_contacted" }),
      });
      if (res.ok) setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      <span className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--child-cta-call-bg)] px-2 py-4 text-center text-sm font-medium text-[var(--child-cta-call-ink)]">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </span>
        打电话
      </span>
      <span className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--child-cta-msg-bg)] px-2 py-4 text-center text-sm font-medium text-[var(--child-cta-msg-ink)]">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </span>
        发消息
      </span>
      <button
        type="button"
        onClick={markContacted}
        disabled={busy || done}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--child-cta-heart-bg)] px-2 py-4 text-center text-sm font-medium text-[var(--child-cta-heart-ink)] disabled:opacity-70"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </span>
        {done ? "已记录" : busy ? "…" : "我已联系"}
      </button>
    </div>
  );
}
