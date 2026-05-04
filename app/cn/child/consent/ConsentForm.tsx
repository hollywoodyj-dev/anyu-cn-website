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
  const channels = draft.allowedNotificationChannels ?? { app: true, push: false, sms: false, email: false };

  if (loading) {
    return <p className="text-sm text-[var(--anyu-ink-muted)]">加载中…</p>;
  }

  return (
    <section className="mt-6 rounded-2xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-5 space-y-5">
      <div>
        <p className="text-sm font-medium text-[var(--anyu-ink)] mb-2">家庭通知总开关</p>
        <label className="flex items-center gap-2 text-sm text-[var(--anyu-ink-muted)]">
          <input
            type="checkbox"
            checked={draft.familyAlertsEnabled !== false}
            onChange={(e) => setDraft({ ...draft, familyAlertsEnabled: e.target.checked })}
          />
          允许向家人发送整理后的提醒（关闭后不会生成新的家庭通知）
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--anyu-ink)] mb-2">通知渠道（V1.2）</p>
        <label className="flex items-center gap-2 text-sm text-[var(--anyu-ink-muted)]">
          <input
            type="checkbox"
            checked={channels.app !== false}
            onChange={(e) =>
              setDraft({
                ...draft,
                allowedNotificationChannels: { ...channels, app: e.target.checked },
              })
            }
          />
          App 内提醒（当前网页 / App 列表）
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm text-[var(--anyu-ink-muted)]">
          <input
            type="checkbox"
            checked={channels.email !== false}
            onChange={(e) =>
              setDraft({
                ...draft,
                allowedNotificationChannels: { ...channels, email: e.target.checked },
              })
            }
          />
          邮件（占位：需配置 ANYU_NOTIFY_EMAIL_ENABLED 与后续 SMTP 才实发）
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm text-[var(--anyu-ink-muted)]">
          <input
            type="checkbox"
            checked={channels.sms !== false}
            onChange={(e) =>
              setDraft({
                ...draft,
                allowedNotificationChannels: { ...channels, sms: e.target.checked },
              })
            }
          />
          短信（占位：需 ANYU_NOTIFY_SMS_ENABLED）
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm text-[var(--anyu-ink-muted)]">
          <input
            type="checkbox"
            checked={channels.push !== false}
            onChange={(e) =>
              setDraft({
                ...draft,
                allowedNotificationChannels: { ...channels, push: e.target.checked },
              })
            }
          />
          推送（占位：需 ANYU_NOTIFY_PUSH_ENABLED）
        </label>
        <p className="mt-1 text-xs text-[var(--anyu-ink-muted)]">
          外发渠道关闭时，审计表会记录为 skipped；不会静默外发。
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--anyu-ink)] mb-2">紧急与 L4 提醒</p>
        <label className="flex items-center gap-2 text-sm text-[var(--anyu-ink-muted)]">
          <input
            type="checkbox"
            checked={draft.emergencyContactMode === true}
            onChange={(e) => setDraft({ ...draft, emergencyContactMode: e.target.checked })}
          />
          紧急联系人模式（开启后，即使关闭「L4 紧急」等级，仍会在极端风险时尝试通知）
        </label>
        <label className="mt-3 block text-xs text-[var(--anyu-ink-muted)]">
          紧急联系电话（可选）
          <input
            type="tel"
            className="mt-1 w-full rounded-lg border border-[var(--anyu-border)] bg-white px-3 py-2 text-sm text-[var(--anyu-ink)]"
            placeholder="用于紧急路径登记，不会在子女端展示完整对话"
            value={draft.emergencyContact?.phone ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                emergencyContact: {
                  ...draft.emergencyContact,
                  name: draft.emergencyContact?.name,
                  phone: e.target.value,
                },
              })
            }
          />
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--anyu-ink)]">提醒等级（示意，可按家庭需要调整）</p>
        <p className="mt-1 text-xs text-[var(--anyu-ink-muted)] leading-relaxed">
          关闭某一等级后，系统不会为该等级生成新的家庭通知；L4 在「紧急联系人模式」或填写了紧急电话时仍可能发送紧急提醒。
        </p>
        <div className="mt-2 space-y-2 text-sm text-[var(--anyu-ink-muted)]">
          {(
            [
              ["L1", "仅 App 内轻提醒"],
              ["L2", "温和通知（每日有上限）"],
              ["L3", "较强提醒（风险时优先）"],
              ["L4", "紧急路径"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tiers[k] !== false}
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
