"use client";

import { useEffect, useState } from "react";
import type { ChildContact, ChildSettingsPayload } from "@/lib/child-insights/types";

const ELDER_ID = "elder_demo";

function emptyContact(): ChildContact {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}`,
    name: "",
    relationship: "",
    phone: "",
    email: "",
    priority: 1,
  };
}

export function ContactsClient() {
  const [draft, setDraft] = useState<ChildSettingsPayload>({ contacts: [emptyContact()] });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch(`/api/child/settings?elderUserId=${ELDER_ID}`)
      .then((r) => r.json())
      .then((j) => {
        const p = (j.payload ?? {}) as ChildSettingsPayload;
        setDraft({
          ...p,
          contacts: p.contacts?.length ? p.contacts : [emptyContact()],
        });
      })
      .catch(() => setDraft({ contacts: [emptyContact()] }))
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

  const contacts = draft.contacts?.length ? draft.contacts : [emptyContact()];

  function setContacts(next: ChildContact[]) {
    setDraft((d) => ({ ...d, contacts: next }));
  }

  if (loading) {
    return <p className="text-sm text-[var(--anyu-ink-muted)]">加载中…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--anyu-ink)] mb-1">长辈称呼（用于提醒里）</label>
        <input
          className="w-full rounded-lg border border-[var(--anyu-border)] px-3 py-2 text-sm"
          value={draft.parentDisplayName ?? ""}
          placeholder="例如：妈妈"
          onChange={(e) => setDraft((d) => ({ ...d, parentDisplayName: e.target.value }))}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--anyu-ink)] mb-2">紧急联系人（L3/L4 路径）</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className="rounded-lg border border-[var(--anyu-border)] px-3 py-2 text-sm"
            placeholder="姓名"
            value={draft.emergencyContact?.name ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                emergencyContact: { ...d.emergencyContact, name: e.target.value },
              }))
            }
          />
          <input
            className="rounded-lg border border-[var(--anyu-border)] px-3 py-2 text-sm"
            placeholder="电话"
            value={draft.emergencyContact?.phone ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                emergencyContact: { ...d.emergencyContact, phone: e.target.value },
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--anyu-ink)]">提醒对象</p>
          <button
            type="button"
            className="text-sm rounded-full border border-[var(--anyu-border)] px-3 py-1"
            onClick={() => setContacts([...contacts, emptyContact()])}
          >
            添加联系人
          </button>
        </div>
        {contacts.map((c, i) => (
          <div key={c.id} className="rounded-xl border border-[var(--anyu-border)] p-4 space-y-2 bg-[var(--anyu-bg-card)]">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="rounded-lg border px-2 py-1.5 text-sm"
                placeholder="姓名"
                value={c.name}
                onChange={(e) => {
                  const next = [...contacts];
                  next[i] = { ...c, name: e.target.value };
                  setContacts(next);
                }}
              />
              <input
                className="rounded-lg border px-2 py-1.5 text-sm"
                placeholder="关系（如：儿子）"
                value={c.relationship}
                onChange={(e) => {
                  const next = [...contacts];
                  next[i] = { ...c, relationship: e.target.value };
                  setContacts(next);
                }}
              />
              <input
                className="rounded-lg border px-2 py-1.5 text-sm"
                placeholder="电话"
                value={c.phone ?? ""}
                onChange={(e) => {
                  const next = [...contacts];
                  next[i] = { ...c, phone: e.target.value };
                  setContacts(next);
                }}
              />
              <input
                className="rounded-lg border px-2 py-1.5 text-sm"
                placeholder="邮箱（可选）"
                value={c.email ?? ""}
                onChange={(e) => {
                  const next = [...contacts];
                  next[i] = { ...c, email: e.target.value };
                  setContacts(next);
                }}
              />
              <label className="flex items-center gap-2 text-sm text-[var(--anyu-ink-muted)] sm:col-span-2">
                优先级（1 最先）
                <input
                  type="number"
                  min={1}
                  max={9}
                  className="w-16 rounded border px-2 py-1"
                  value={c.priority}
                  onChange={(e) => {
                    const next = [...contacts];
                    next[i] = { ...c, priority: Number(e.target.value) || 1 };
                    setContacts(next);
                  }}
                />
              </label>
            </div>
            <button
              type="button"
              className="text-xs text-[var(--anyu-risk)]"
              onClick={() =>
                setContacts(contacts.length > 1 ? contacts.filter((_, idx) => idx !== i) : [emptyContact()])
              }
            >
              移除此联系人
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="rounded-full bg-[var(--anyu-accent)] text-white px-5 py-2 text-sm font-medium"
        onClick={() => void save()}
      >
        保存更改
      </button>
      {saved ? <p className="text-xs text-emerald-800">已保存。</p> : null}
    </div>
  );
}
