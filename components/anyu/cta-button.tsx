import Link from "next/link";

type CTAButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/* Spec: rounded-2xl px-6 py-4 text-lg；温暖、大触控区 */
export function CTAButton({ href, children, className = "" }: CTAButtonProps) {
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center justify-center rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] px-6 py-4 text-lg text-[var(--anyu-ink)] shadow-sm transition hover:border-[var(--anyu-accent)]/40 hover:shadow " +
        className
      }
    >
      {children}
    </Link>
  );
}
