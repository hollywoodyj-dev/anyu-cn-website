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
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [isCallActive, setIsCallActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [textInput, setTextInput] = useState("");
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

  async function switchMode(nextMode: "voice" | "text") {
    if (nextMode === mode) return;
    if (isCallActive) {
      await stopCall();
    }
    setError(null);
    setMode(nextMode);
  }

  async function sendTextTurn() {
    const text = textInput.trim();
    if (!text || busy) return;
    setError(null);
    append("user", text);
    setTextInput("");
    try {
      const reply = await chatTurn(text);
      append("assistant", reply);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "发送失败，请稍后重试。";
      setError(msg);
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
          可切换通话模式或文字模式。文字模式可直接验证对话逻辑，不依赖麦克风与 STT。
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-md rounded-2xl border border-[var(--anyu-border)] bg-white p-1">
        <button
          type="button"
          onClick={() => void switchMode("voice")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm ${
            mode === "voice" ? "bg-[#F6EDE5] text-[var(--anyu-ink)]" : "text-[var(--anyu-ink-muted)]"
          }`}
        >
          通话模式
        </button>
        <button
          type="button"
          onClick={() => void switchMode("text")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm ${
            mode === "text" ? "bg-[#EEF4EC] text-[var(--anyu-ink)]" : "text-[var(--anyu-ink-muted)]"
          }`}
        >
          文字模式
        </button>
      </div>

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
            {mode === "voice" ? (
              <>
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
              </>
            ) : (
              <p className="text-center text-sm text-[var(--anyu-ink-muted)]">
                当前为文字模式：可直接输入并验证安语对话逻辑。
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--anyu-border)] bg-white p-5 md:p-6">
          <h2 className="mb-4 text-lg font-medium text-[var(--anyu-ink)]">对话记录</h2>
          {mode === "text" ? (
            <div className="mb-4 flex gap-2">
              <input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void sendTextTurn();
                  }
                }}
                placeholder="输入你想说的话，按 Enter 发送"
                className="flex-1 rounded-xl border border-[var(--anyu-border)] px-3 py-2 text-sm outline-none focus:border-[#9D6A4D]"
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => void sendTextTurn()}
                disabled={busy || !textInput.trim()}
                className="rounded-xl bg-[#9D6A4D] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "发送中…" : "发送"}
              </button>
            </div>
          ) : null}
          <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
            {items.length === 0 ? (
              <p className="rounded-2xl bg-[var(--anyu-bg-card)] p-4 text-sm text-[var(--anyu-ink-muted)]">
                还没有对话。请开始通话，或切换到文字模式发送第一句。
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
