import { chipLabelFor } from "@/lib/child-insights/childUiCopy";
import type { ChildStateDisplay } from "@/lib/child-insights/types";

const styles: Record<ChildStateDisplay, string> = {
  steady: "bg-emerald-50/90 text-emerald-900 border-emerald-200/80",
  lonely: "bg-amber-50/90 text-amber-950 border-amber-200/80",
  missing_family: "bg-sky-50/90 text-sky-950 border-sky-200/80",
  low: "bg-orange-50/80 text-orange-950 border-orange-200/70",
  watch: "bg-orange-50/90 text-orange-950 border-orange-300/80",
  risk: "bg-orange-50/95 text-orange-950 border-orange-400/90",
  urgent: "bg-red-50 text-red-950 border-red-300",
};

type Props = {
  display: ChildStateDisplay;
  riskLevel?: "L1" | "L2" | "L3" | "L4";
};

export function ChildStateChip({ display, riskLevel }: Props) {
  const label = chipLabelFor(display);
  const className =
    riskLevel === "L4" || display === "urgent"
      ? styles.urgent
      : display === "risk"
        ? styles.risk
        : styles[display];
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-3.5 py-1.5 text-base font-semibold tracking-tight ${className}`}
    >
      {label}
    </span>
  );
}
