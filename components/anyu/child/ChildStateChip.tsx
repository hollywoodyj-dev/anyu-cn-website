import type { DashboardCard } from "@/lib/child-insights/types";

const copy: Record<DashboardCard["state"], { label: string; className: string }> = {
  stable: { label: "稳定", className: "bg-emerald-50 text-emerald-900 border-emerald-200" },
  lonely: { label: "有点孤单", className: "bg-amber-50 text-amber-950 border-amber-200" },
  low: { label: "有点低落", className: "bg-amber-50 text-amber-950 border-amber-200" },
  watch: { label: "需要关注", className: "bg-orange-50 text-orange-950 border-orange-200" },
  risk: { label: "风险提醒", className: "bg-red-50 text-red-950 border-red-200" },
};

export function ChildStateChip({ state }: { state: DashboardCard["state"] }) {
  const c = copy[state];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium ${c.className}`}
    >
      {c.label}
    </span>
  );
}
