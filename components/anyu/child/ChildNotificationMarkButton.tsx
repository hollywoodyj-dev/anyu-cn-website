"use client";

import { useState } from "react";

type Props = {
  elderUserId: string;
  notificationId: string;
  initiallyContacted: boolean;
};

export function ChildNotificationMarkButton({ elderUserId, notificationId, initiallyContacted }: Props) {
  const [done, setDone] = useState(initiallyContacted);
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (busy || done) return;
    setBusy(true);
    try {
      const res = await fetch("/api/child/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderUserId, action: "mark_contacted", notificationId }),
      });
      if (res.ok) setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="mt-4 text-sm text-[var(--anyu-ink-muted)]" role="status">
        已标记为已联系
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="mt-4 w-full rounded-2xl py-3.5 text-sm font-medium text-[var(--anyu-ink)] ring-1 ring-inset ring-[var(--anyu-border)] bg-[var(--anyu-bg-card)] hover:bg-[var(--anyu-bg)] disabled:opacity-60"
    >
      {busy ? "…" : "标记已联系"}
    </button>
  );
}
