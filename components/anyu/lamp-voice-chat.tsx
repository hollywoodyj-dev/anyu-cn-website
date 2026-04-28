"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MediaRecorderBridgeSession } from "@/lib/anyu-voice/mediaRecorderBridgeAdapter";

type ChatRole = "user" | "assistant";
type ChatItem = {
  id: string;
  role: ChatRole;
  text: string;
};

type MessageOk = {
  assistant_message?: string;
  error?: string;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function LampVoiceChat() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());

  const bridgeRef = useRef<MediaRecorderBridgeSession | null>(null);

  function append(role: ChatRole, text: string) {
    const cleaned = text.trim();
    if (!cleaned) return;
    setItems((prev) => [...prev, { id: uid(), role, text: cleaned }]);
  }

  async function chatTurn(userText: string): Promise<string> {
    setBusy(true);
    try {
      const res = await fetch("/api/elder-chat/message", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: userText, lang: "zh" }),
      });
      const json = (await res.json()) as MessageOk;
      if (!res.ok || !json.assistant_message?.trim()) {
        throw new Error(json.error ?? "安语回复失败，请稍后再试。");
      }
      return json.assistant_message.trim();
    } finally {
      setBusy(false);
    }
  }

  async function startCall() {
    setError(null);
    try {
      const bridge = new MediaRecorderBridgeSession(
        {
          sttUrl: "/api/elder-chat/transcribe",
          timeoutMs: 20000,
          language: "zh",
          utteranceEndMode: "silence",
        },
        {
          onUserText: (text) => {
            const t = text.trim();
            if (!t) return;
            setError(null);
            append("user", t);
          },
          onAssistantText: (text) => {
            const t = text.trim();
            if (!t) return;
            setError(null);
            append("assistant", t);
          },
          onError: (msg) => setError(msg),
        },
        chatTurn,
      );
      bridgeRef.current = bridge;
      await bridge.start();
      setIsCallActive(true);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "无法启动通话模式，请检查麦克风权限。";
      setError(msg);
      setIsCallActive(false);
      bridgeRef.current = null;
    }
  }

  async function stopCall() {
    setIsCallActive(false);
    setBusy(false);
    try {
      await bridgeRef.current?.stop();
    } finally {
      bridgeRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      void bridgeRef.current?.stop();
      bridgeRef.current = null;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="space-y-3 text-center">
        <h1 className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">安语灯语音体验</h1>
        <p className="text-[var(--anyu-ink-muted)]">
          点击开始进入通话模式。说完一句后稍停，系统会转写、回复并播报；说很长也不会超过约半分钟一段。
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-[var(--anyu-border)] bg-[var(--anyu-bg-card)] p-6">
          <div className="mx-auto max-w-[320px]">
            <div className="relative mx-auto h-[260px] w-[180px]">
              <Image
                src="/anyu/home/lamp.png"
                alt="安语灯"
                fill
                className="object-contain object-center drop-shadow-sm"
                sizes="180px"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => void (isCallActive ? stopCall() : startCall())}
              disabled={busy && !isCallActive}
              className="w-full rounded-2xl bg-[#9D6A4D] px-5 py-3 text-white transition hover:bg-[#8a5d43] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCallActive ? "结束通话模式" : "开始通话模式"}
            </button>
            {isCallActive ? (
              <p className="text-center text-sm text-[#b85858]">
                {busy ? "安语正在回复…" : "正在聆听中…"}
              </p>
            ) : (
              <p className="text-center text-sm text-[var(--anyu-ink-muted)]">
                建议使用 Chrome，并允许麦克风权限。
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--anyu-border)] bg-white p-5 md:p-6">
          <h2 className="mb-4 text-lg font-medium text-[var(--anyu-ink)]">对话记录</h2>
          <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
            {items.length === 0 ? (
              <p className="rounded-2xl bg-[var(--anyu-bg-card)] p-4 text-sm text-[var(--anyu-ink-muted)]">
                还没有对话。点击左侧按钮开始。
              </p>
            ) : null}
            {items.map((item) => (
              <div
                key={item.id}
                className={
                  item.role === "user"
                    ? "ml-8 rounded-2xl bg-[#F6EDE5] px-4 py-3 text-[var(--anyu-ink)]"
                    : "mr-8 rounded-2xl bg-[#EEF4EC] px-4 py-3 text-[var(--anyu-ink)]"
                }
              >
                <p className="mb-1 text-xs text-[var(--anyu-ink-muted)]">
                  {item.role === "user" ? "你说" : "安语"}
                </p>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl border border-[#f0c4c4] bg-[#fff6f6] px-4 py-3 text-sm text-[#b85858]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
