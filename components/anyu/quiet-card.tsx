type QuietCardProps = {
  /** 小标签，如 emoji 或短词（少用、不炫） */
  kicker?: string;
  title: string;
  body: string;
};

/** 营销页三卡、场景卡：浅底、字大、无动效 */
export function QuietCard({ kicker, title, body }: QuietCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5 md:p-6">
      {kicker ? (
        <p className="mb-2 text-sm text-[var(--anyu-ink-muted)]" aria-hidden>
          {kicker}
        </p>
      ) : null}
      <h3 className="text-lg font-medium text-[var(--anyu-ink)] md:text-xl">{title}</h3>
      <p className="mt-3 flex-1 text-base leading-relaxed text-[var(--anyu-ink-muted)] md:text-lg">
        {body}
      </p>
    </article>
  );
}
