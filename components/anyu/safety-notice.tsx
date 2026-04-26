import type { ReactNode } from "react";

type SafetyNoticeProps = {
  children: ReactNode;
  title?: string;
};

/* 与 Risk / Human Override 表述一致；不恐吓、不技术腔 */
export function SafetyNotice({ children, title = "安全提示" }: SafetyNoticeProps) {
  return (
    <aside
      className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-5 text-[var(--anyu-ink)] shadow-sm md:px-6"
      role="note"
    >
      {title ? (
        <p className="mb-3 text-base font-medium text-amber-900/90 md:text-lg">{title}</p>
      ) : null}
      <div className="space-y-3 text-[var(--anyu-ink)]">{children}</div>
    </aside>
  );
}
