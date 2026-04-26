type Step = { title: string; body?: string };

type SimpleStepsProps = {
  heading?: string;
  steps: Step[];
};

export function SimpleSteps({ heading, steps }: SimpleStepsProps) {
  return (
    <div className="space-y-6">
      {heading ? (
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">{heading}</h2>
      ) : null}
      <ol className="list-none space-y-6 pl-0">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] text-sm text-[var(--anyu-accent)]"
              aria-hidden
            >
              {i + 1}
            </span>
            <div>
              <p className="font-medium text-[var(--anyu-ink)]">{s.title}</p>
              {s.body ? (
                <p className="mt-1 text-[var(--anyu-ink-muted)]">{s.body}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
