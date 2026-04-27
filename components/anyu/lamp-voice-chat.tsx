"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

type ChatRole = "user" | "assistant";
type ChatItem = {
  id: string;
  role: ChatRole;
  text: string;
};

type TranscribeOk = {
  text?: string;
};

type MessageOk = {
  assistant_message?: string;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  const hit = types.find((t) => MediaRecorder.isTypeSupported(t));
  return hit ?? "";
}

function speakZh(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";
  const zhVoice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("zh"));
  if (zhVoice) u.voice = zhVoice;
  synth.speak(u);
}

/** 安语灯语音体验：点击灯按钮开始/结束录音 -> STT -> message -> 语音播报回复。 */
export function LampVoiceChat() {
  const [isRecording, setIsRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ChatItem[]>([]);

  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const canStart = useMemo(() => !busy && !isRecording, [busy, isRecording]);
  const canStop = useMemo(() => !busy && isRecording, [busy, isRecording]);

  function append(role: ChatRole, text: string) {
    if (!text.trim()) return;
    setItems((prev) => [...prev, { id: uid(), role, text: text.trim() }]);
  }

  async function startRecording() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("当前浏览器不支持麦克风录音。");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];
      const mimeType = pickMime();
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecRef.current = rec;
      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      rec.start();
      setIsRecording(true);
    } catch {
      setError("无法访问麦克风，请检查浏览器权限。");
    }
  }

  async function stopRecording() {
    setError(null);
    const rec = mediaRecRef.current;
    if (!rec) return;
    setBusy(true);
    const stopped = new Promise<Blob>((resolve) => {
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        resolve(blob);
      };
    });
    rec.stop();
    setIsRecording(false);
    const audioBlob = await stopped;
    mediaRecRef.current = null;
    chunksRef.current = [];
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    try {
      if (audioBlob.size <= 0) {
        setError("没有录到声音，请再试一次。");
        return;
      }

      const fd = new FormData();
      fd.append("audio", audioBlob, "lamp-utterance.webm");
      fd.append("lang", "zh");
      const tRes = await fetch("/api/elder-chat/transcribe", { method: "POST", body: fd });
      const tJson = (await tRes.json()) as TranscribeOk & { error?: string };
      if (!tRes.ok || !tJson.text?.trim()) {
        setError(tJson.error ?? "转写失败，请稍后再试。");
        return;
      }
      const userText = tJson.text.trim();
      append("user", userText);

      const mRes = await fetch("/api/elder-chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: userText, lang: "zh" }),
      });
      const mJson = (await mRes.json()) as MessageOk & { error?: string };
      const reply = (mJson.assistant_message ?? "").trim();
      if (!mRes.ok || !reply) {
        setError(mJson.error ?? "安语回复失败，请稍后再试。");
        return;
      }
      append("assistant", reply);
      speakZh(reply);
    } catch {
      setError("网络异常，请检查本地服务或稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="space-y-3 text-center">
        <h1 className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">安语灯语音体验</h1>
        <p className="text-[var(--anyu-ink-muted)]">
          点击安语灯开始说话；松开后自动转写并与安语对话，回复会自动朗读。
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
              onClick={() => void (canStart ? startRecording() : stopRecording())}
              disabled={busy || (!canStart && !canStop)}
              className="w-full rounded-2xl bg-[#9D6A4D] px-5 py-3 text-white transition hover:bg-[#8a5d43] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "处理中…" : isRecording ? "结束并发送" : "按这里开始说话"}
            </button>
            {isRecording ? (
              <p className="text-center text-sm text-[#b85858]">正在录音中…说完后请点“结束并发送”。</p>
            ) : (
              <p className="text-center text-sm text-[var(--anyu-ink-muted)]">建议在安静环境中说完整一句话。</p>
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

