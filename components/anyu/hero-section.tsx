import { CTAButton } from "./cta-button";

type HeroSectionProps = {
  title: string;
  /** 多行主文案 */
  lines: string[];
  ctas: { href: string; label: string }[];
};

export function HeroSection({ title, lines, ctas }: HeroSectionProps) {
  return (
    <section className="mb-16 space-y-8 text-center" aria-labelledby="anyu-hero-title">
      <h1
        id="anyu-hero-title"
        className="text-3xl font-normal tracking-tight text-[var(--anyu-ink)] md:text-4xl"
      >
        {title}
      </h1>
      {lines.length > 0 && (
        <div className="space-y-4 text-[var(--anyu-ink)]">
          {lines.map((line, i) => (
            <p key={i} className="whitespace-pre-line">
              {line}
            </p>
          ))}
        </div>
      )}
      {ctas.length > 0 && (
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          {ctas.map((c) => (
            <CTAButton key={c.href} href={c.href}>
              {c.label}
            </CTAButton>
          ))}
        </div>
      )}
    </section>
  );
}
