import Link from "next/link";
import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";
import { ChildNotificationMarkButton } from "@/components/anyu/child/ChildNotificationMarkButton";
import { getNotifications } from "@/lib/child-insights/repository";
import type { ChildNotificationItem } from "@/lib/child-insights/types";

export const dynamic = "force-dynamic";

const ELDER_DEMO = "elder_demo";

function dayBucket(iso: string): "today" | "yesterday" | "earlier" {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startToday.getTime() - startThat.getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  return "earlier";
}

function formatEarlierHeading(iso: string): string {
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric" }).format(new Date(iso));
}

function formatTimeZh(iso: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

function cardShellClass(n: ChildNotificationItem): string {
  if (n.title === "紧急提醒") {
    return "bg-red-50/80 ring-red-200/90 border-red-100/80";
  }
  if (n.level === "risk") {
    return "bg-orange-50/70 ring-orange-200/80 border-orange-100/70";
  }
  if (n.level === "watch") {
    return "bg-amber-50/70 ring-amber-200/70 border-amber-100/60";
  }
  return "bg-sky-50/60 ring-sky-200/70 border-sky-100/60";
}

function titleClass(n: ChildNotificationItem): string {
  if (n.title === "紧急提醒") return "text-red-800";
  if (n.level === "risk") return "text-orange-900";
  if (n.level === "watch") return "text-amber-900";
  return "text-sky-900";
}

export default async function ChildNotificationsPage() {
  const list = await getNotifications(ELDER_DEMO);
  const groups: Record<"today" | "yesterday" | "earlier", ChildNotificationItem[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };
  for (const n of list) {
    groups[dayBucket(n.createdAt)].push(n);
  }
  const earlierDays = [...new Set(groups.earlier.map((n) => n.createdAt.slice(0, 10)))].sort((a, b) =>
    b.localeCompare(a),
  );

  function renderCard(n: ChildNotificationItem) {
    return (
      <article
        key={n.id}
        className={`rounded-[1.25rem] border p-5 shadow-[var(--child-card-shadow)] ring-1 ${cardShellClass(n)}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className={`text-base font-semibold ${titleClass(n)}`}>{n.title}</p>
          <time className="shrink-0 text-xs text-[var(--anyu-ink-muted)]" dateTime={n.createdAt}>
            {formatTimeZh(n.createdAt)}
          </time>
        </div>
        <p className="mt-2 text-sm text-[var(--anyu-ink-muted)] leading-relaxed">{n.message}</p>
        <ChildNotificationMarkButton
          elderUserId={ELDER_DEMO}
          notificationId={n.id}
          initiallyContacted={Boolean(n.contactedAt)}
        />
      </article>
    );
  }

  return (
    <ChildAppChrome>
      <div className="mb-5 flex items-center justify-between gap-2">
        <Link
          href="/cn/child"
          className="rounded-full p-2 text-[var(--anyu-ink-muted)] hover:bg-[var(--anyu-bg-card)]"
          aria-label="返回"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-[var(--anyu-ink)]">提醒中心</h1>
        <span className="rounded-full border border-[var(--anyu-border)] px-2.5 py-1 text-xs text-[var(--anyu-ink-muted)]">
          全部
        </span>
      </div>
      <p className="text-sm text-[var(--anyu-ink-muted)] mb-6">温和提醒，不替代你亲自关心。</p>

      {list.length === 0 ? (
        <div className="rounded-[1.25rem] border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6 text-[var(--anyu-ink-muted)]">
          暂无提醒。
        </div>
      ) : (
        <div className="space-y-8">
          {groups.today.length > 0 ? (
            <section>
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--anyu-ink-muted)]">今天</h2>
              <div className="space-y-3">{groups.today.map(renderCard)}</div>
            </section>
          ) : null}
          {groups.yesterday.length > 0 ? (
            <section>
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--anyu-ink-muted)]">昨天</h2>
              <div className="space-y-3">{groups.yesterday.map(renderCard)}</div>
            </section>
          ) : null}
          {groups.earlier.length > 0 ? (
            <section>
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--anyu-ink-muted)]">更早</h2>
              <div className="space-y-6">
                {earlierDays.map((day) => (
                  <div key={day}>
                    <h3 className="mb-2 text-xs text-[var(--anyu-ink-muted)]">{formatEarlierHeading(`${day}T12:00:00`)}</h3>
                    <div className="space-y-3">
                      {groups.earlier.filter((n) => n.createdAt.slice(0, 10) === day).map(renderCard)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </ChildAppChrome>
  );
}
