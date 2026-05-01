"use client";

import { useEffect, useState } from "react";
import type { ChildSettingsPayload } from "@/lib/child-insights/types";

const ELDER_ID = "elder_demo";

export function ConsentForm() {
  const [draft, setDraft] = useState<ChildSettingsPayload>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch(`/api/child/settings?elderUserId=${ELDER_ID}`)
      .then((r) => r.json())
      .then((j) => setDraft((j.payload ?? {}) as ChildSettingsPayload))
      .catch(() => setDraft({}))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaved(false);
    await fetch("/api/child/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ elderUserId: ELDER_ID, payload: draft }),
    });
    setSaved(true);
  }

  const tiers = draft.reminderTiers ?? { L1: true, L2: true, L3: true, L4: true };

  if (loading) {
    return <p className="text-sm text-[var(--anyu-ink-muted)]">加载中…</p>;
  }

  return (
    <section className="mt-6 rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5 space-y-4">
      <p className="text-sm font-medium text-[var(--anyu-ink)]">提醒等级（示意，可按家庭需要调整）</p>
      <div className="space-y-2 text-sm text-[var(--anyu-ink-muted)]">
        {(
          [
            ["L1", "仅 App 内轻提醒"],
            ["L2", "温和通知（每日有上限）"],
            ["L3", "较强提醒（风险时优先）"],
            ["L4", "紧急路径（不建议关闭）"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tiers[k] !== false}
              disabled={k === "L4"}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  reminderTiers: { ...tiers, [k]: e.target.checked },
                })
              }
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--anyu-ink)] mb-2">记忆卡片展示</p>
        <select
          className="w-full rounded-lg border border-[var(--anyu-border)] bg-white px-3 py-2 text-sm"
          value={draft.memoryVisibility ?? "curated"}
          onChange={(e) =>
            setDraft({
              ...draft,
              memoryVisibility: e.target.value as ChildSettingsPayload["memoryVisibility"],
            })
          }
        >
          <option value="curated">展示整理后的记忆卡片</option>
          <option value="summary_only">仅展示情绪摘要</option>
          <option value="hidden">隐藏记忆卡片</option>
        </select>
      </div>

      <button
        type="button"
        className="rounded-full bg-[var(--anyu-accent)] text-white px-5 py-2 text-sm font-medium"
        onClick={() => void save()}
      >
        保存偏好
      </button>
      {saved ? <p className="text-xs text-emerald-800">已保存。</p> : null}
    </section>
  );
}
