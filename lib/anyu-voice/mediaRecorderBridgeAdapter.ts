type UtteranceEndMode = "silence" | "interval";

type BridgeConfig = {
  sttUrl: string;
  timeoutMs?: number;
  /**
   * 判句方式：`silence` = 有说话后连续静音再送 STT；`interval` = 固定时长切段。
   * 默认 `silence`。
   */
  utteranceEndMode?: UtteranceEndMode;
  /**
   * 每段录满多少毫秒就 stop（仅 `interval` 模式；`silence` 时用作**最长**上限时可另见 maxUtteranceMs）。
   * 建议 4000–10000。
   */
  segmentIntervalMs?: number;
  /**
   * `silence` 模式：RMS 低于该值视为「静音段」，与 silenceHoldMs 一起判句尾。
   * 约 0.012–0.03，环境吵可调高。
   */
  silenceRmsThreshold?: number;
  /** 连续静音达多少毫秒后结束本句并送 STT。 */
  silenceHoldMs?: number;
  /** 本段至少录多久才允许用静音收句，避免开麦噪声误切。 */
  minUtteranceMs?: number;
  /**
   * 单段最长（毫秒），超时强制切段，防一人说满不停。
   * 默认 25000。
   */
  maxUtteranceMs?: number;
  token?: string;
  tokenHeader?: string;
  language?: string;
};

type BridgeCallbacks = {
  onLog?: (msg: string) => void;
  onUserText?: (text: string) => void;
  onAssistantText?: (text: string) => void;
  onError?: (err: string) => void;
};

type ChatTurn = (userText: string) => Promise<string>;

/** 用于与上一轮 STT 比对的规范化（小写、去首尾标点与空白） */
function sttDedupeKey(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, " ")
    .replace(/^[.!?;:,，。！？、]+|[.!?;:,，。！？、]+$/g, "");
}

/**
 * 中文体验（lang=zh）下：无汉字时，静音/回声常被误识成短英文（如 "The." "Um"）；
 * 与「至少 2 个汉字」的门槛对齐，无汉字则需足够长的英文，或至少两个词，避免进对话队列。
 */
function isMeaningfulText(text: string, language?: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (!/[A-Za-z0-9\u4e00-\u9fff]/.test(t)) return false;
  const hasCjk = /[\u4e00-\u9fff]/.test(t);
  const preferZh = (language ?? "").toLowerCase().startsWith("zh");

  if (preferZh && !hasCjk) {
    const letters = t.replace(/[^A-Za-z]/g, "");
    if (letters.length < 6) return false;
    const words = t
      .replace(/[^A-Za-z0-9\s']/g, " ")
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/^['']+|['']+$/g, ""))
      .filter(Boolean);
    if (words.length < 1) return false;
    if (words.length === 1) {
      if (words[0].length <= 4) return false;
      const asrJunk1w = new Set([
        "this",
        "that",
        "they",
        "them",
        "there",
        "then",
        "here",
        "when",
        "what",
        "with",
        "from",
        "your",
        "just",
        "like",
        "well",
        "very",
        "some",
        "more",
        "most",
        "only",
        "even",
        "also",
        "back",
        "over",
        "really",
        "going",
        "gonna",
        "wanna",
        "gotta",
        "thing",
        "things",
        "maybe",
        "never",
        "still",
        "again",
        "yeah",
        "okay",
      ]);
      if (asrJunk1w.has(words[0])) return false;
    }
  }

  if (hasCjk) return t.replace(/[^\u4e00-\u9fffA-Za-z0-9]/g, "").length >= 2;
  return t.replace(/[^A-Za-z0-9]/g, "").length >= 3;
}

export class MediaRecorderBridgeSession {
  private cfg: Required<
    Omit<
      BridgeConfig,
      "token" | "language" | "segmentIntervalMs" | "utteranceEndMode" | "silenceRmsThreshold" | "silenceHoldMs" | "minUtteranceMs" | "maxUtteranceMs"
    >
  > & { token?: string; language?: string };
  private readonly utteranceEndMode: UtteranceEndMode;
  private readonly segmentIntervalMs: number;
  private readonly silenceRmsThreshold: number;
  private readonly silenceHoldMs: number;
  private readonly minUtteranceMs: number;
  private readonly maxUtteranceMs: number;

  private cb: BridgeCallbacks;
  private chatTurn: ChatTurn;
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private segmentFileExt: string = "webm";
  private recordMime: string = "";
  private segmentTimer: ReturnType<typeof setInterval> | null = null;
  /** 浏览器中 setInterval 句柄为 number，与 @types/node 的 Timeout 区分 */
  private silenceTimer: number | null = null;
  private running = false;
  private busy = false;
  private queue: Blob[] = [];
  private speaking = false;
  private lastAcceptedSttKey = "";
  private static readonly maxQueuedSegments = 5;

  /** TTS 开始时丢弃正在录的半段，避免把播报当用户话 */
  private discardThisSegment = false;
  /** 为 true 时 onstop 不再立刻 create，等播报完再接麦（防扬声器进 STT） */
  private suppressRecorderRestart = false;

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private segmentStartedAt = 0;
  private sawSpeechThisSegment = false;
  private silenceBelowSince: number | null = null;

  constructor(config: BridgeConfig, callbacks: BridgeCallbacks, chatTurn: ChatTurn) {
    this.cfg = {
      sttUrl: config.sttUrl,
      timeoutMs: config.timeoutMs ?? 20000,
      tokenHeader: config.tokenHeader ?? "Authorization",
      token: config.token,
      language: config.language,
    };
    this.utteranceEndMode = config.utteranceEndMode === "interval" ? "interval" : "silence";

    const rawSeg = config.segmentIntervalMs;
    const n = typeof rawSeg === "number" && Number.isFinite(rawSeg) ? rawSeg : 6000;
    this.segmentIntervalMs = Math.min(15_000, Math.max(2_000, Math.round(n)));

    const th = config.silenceRmsThreshold;
    this.silenceRmsThreshold = typeof th === "number" && Number.isFinite(th)
      ? Math.min(0.2, Math.max(0.003, th))
      : 0.018;

    const hold = config.silenceHoldMs;
    this.silenceHoldMs = typeof hold === "number" && Number.isFinite(hold) ? Math.min(2_000, Math.max(250, Math.round(hold))) : 600;

    const minU = config.minUtteranceMs;
    this.minUtteranceMs = typeof minU === "number" && Number.isFinite(minU) ? Math.min(3_000, Math.max(200, Math.round(minU))) : 400;

    const maxU = config.maxUtteranceMs;
    this.maxUtteranceMs = typeof maxU === "number" && Number.isFinite(maxU) ? Math.min(120_000, Math.max(5_000, Math.round(maxU))) : 25_000;

    this.cb = callbacks;
    this.chatTurn = chatTurn;
  }

  private log(msg: string) {
    this.cb.onLog?.(msg);
  }

  private resetSilenceState() {
    this.segmentStartedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    this.sawSpeechThisSegment = false;
    this.silenceBelowSince = null;
  }

  private getMicRms(): number {
    if (!this.analyser) return 0;
    const n = this.analyser.fftSize;
    const data = new Float32Array(n);
    this.analyser.getFloatTimeDomainData(data);
    let s = 0;
    for (let i = 0; i < n; i++) {
      const x = data[i];
      s += x * x;
    }
    return Math.sqrt(s / n);
  }

  private ensureAudioAnalysis() {
    if (this.utteranceEndMode !== "silence" || !this.stream || this.audioContext) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.audioContext = new Ctx();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.4;
    source.connect(this.analyser);
  }

  private startSilenceWatcher() {
    this.stopSilenceWatcher();
    this.ensureAudioAnalysis();
    const tick = () => {
      if (!this.running || this.utteranceEndMode !== "silence" || this.speaking) return;
      if (this.discardThisSegment) return;
      if (this.audioContext?.state === "suspended") {
        void this.audioContext.resume().catch(() => {});
      }
      if (!this.recorder || this.recorder.state !== "recording" || !this.analyser) return;

      const now = performance.now();
      const elapsed = now - this.segmentStartedAt;
      const rms = this.getMicRms();
      const loud = rms > this.silenceRmsThreshold;

      if (loud) {
        this.sawSpeechThisSegment = true;
        this.silenceBelowSince = null;
      } else {
        if (this.sawSpeechThisSegment) {
          if (this.silenceBelowSince === null) {
            this.silenceBelowSince = now;
          } else if (
            now - this.silenceBelowSince >= this.silenceHoldMs &&
            elapsed >= this.minUtteranceMs
          ) {
            this.log("End-of-utterance (silence)");
            this.cutCurrentSegment();
            return;
          }
        }
      }

      if (elapsed >= this.maxUtteranceMs) {
        this.log("End-of-utterance (max length)");
        this.cutCurrentSegment();
      }
    };
    this.silenceTimer = window.setInterval(tick, 50) as unknown as number;
  }

  private stopSilenceWatcher() {
    if (this.silenceTimer !== null) {
      window.clearInterval(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private async teardownAudioAnalysis() {
    this.stopSilenceWatcher();
    this.analyser = null;
    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch {
        // ignore
      }
    }
    this.audioContext = null;
  }

  async start() {
    if (this.running) return;
    this.running = true;
    this.lastAcceptedSttKey = "";
    this.discardThisSegment = false;
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
      },
    });
    const mime =
      MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
          ? "audio/ogg;codecs=opus"
          : "";
    this.recordMime = mime;

    if (this.utteranceEndMode === "silence") {
      this.ensureAudioAnalysis();
      this.createAndStartSegmentRecorder();
      this.startSilenceWatcher();
      this.log(
        `MediaRecorder (silence EOU) — hold ${this.silenceHoldMs}ms, rms<${this.silenceRmsThreshold.toFixed(3)} (${this.recorder?.mimeType || "default"})`,
      );
    } else {
      this.createAndStartSegmentRecorder();
      this.segmentTimer = setInterval(() => this.cutCurrentSegment(), this.segmentIntervalMs);
      this.log(
        `MediaRecorder (interval) — ${this.segmentIntervalMs}ms (${this.recorder?.mimeType || "default"})`,
      );
    }
  }

  /**
   * 每段独立 stop 再开新 MediaRecorder，每段为完整 webm/ogg 文件。
   */
  private createAndStartSegmentRecorder() {
    if (!this.stream) return;
    if (!this.running) return;
    const preferredMime = this.recordMime;
    try {
      this.recorder = new MediaRecorder(
        this.stream,
        preferredMime ? { mimeType: preferredMime } : undefined,
      );
    } catch {
      this.recorder = new MediaRecorder(this.stream);
    }
    const mt = (this.recorder.mimeType || preferredMime).toLowerCase();
    this.segmentFileExt = mt.includes("ogg") ? "ogg" : "webm";
    this.resetSilenceState();

    this.recorder.ondataavailable = async (ev) => {
      if (!this.stream || !this.running) return;
      if (!ev.data || ev.data.size === 0) return;
      if (this.discardThisSegment) {
        this.log("Drop segment (TTS / discard)");
        this.discardThisSegment = false;
        return;
      }
      this.queue.push(ev.data);
      while (this.queue.length > MediaRecorderBridgeSession.maxQueuedSegments) {
        this.queue.shift();
        this.log("STT drop oldest segment (queue cap)");
      }
      await this.pumpQueue();
    };

    this.recorder.onstop = () => {
      if (!this.running) {
        this.teardownRecordingSurface();
        return;
      }
      if (this.suppressRecorderRestart) {
        this.recorder = null;
        this.suppressRecorderRestart = false;
        return;
      }
      this.createAndStartSegmentRecorder();
      if (this.utteranceEndMode === "silence" && !this.speaking) {
        this.startSilenceWatcher();
      }
    };

    this.recorder.onerror = (ev: Event & { error?: { message?: string } }) => {
      const msg = ev?.error?.message || "MediaRecorder error";
      this.cb.onError?.(msg);
      this.log(msg);
    };

    this.recorder.start();
  }

  private teardownRecordingSurface() {
    this.recorder = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.queue = [];
  }

  private cutCurrentSegment() {
    if (!this.running) return;
    if (!this.recorder || this.recorder.state !== "recording") return;
    try {
      this.recorder.stop();
    } catch {
      // ignore
    }
  }

  /**
   * 安语播报时停止采集本段，避免扬声器内容进下一句用户 STT；`onstop` 里不立刻接麦，播报结束后再建 recorder。
   */
  private stopRecordingToDiscard() {
    if (!this.recorder || this.recorder.state !== "recording") return;
    this.discardThisSegment = true;
    this.suppressRecorderRestart = true;
    try {
      this.recorder.stop();
    } catch {
      this.discardThisSegment = false;
      this.suppressRecorderRestart = false;
    }
  }

  async stop() {
    this.running = false;
    this.stopSilenceWatcher();
    if (this.segmentTimer) {
      clearInterval(this.segmentTimer);
      this.segmentTimer = null;
    }
    void this.teardownAudioAnalysis();
    const rec = this.recorder;
    const wasRecording = rec && rec.state === "recording";
    try {
      if (wasRecording && rec) {
        this.discardThisSegment = false;
        rec.stop();
      }
    } catch {
      // ignore
    }
    if (!wasRecording) {
      this.teardownRecordingSurface();
    }
    this.lastAcceptedSttKey = "";
    this.busy = false;
    this.speaking = false;
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // ignore
    }
  }

  private async pumpQueue() {
    if (this.busy) return;
    this.busy = true;
    try {
      while (this.queue.length && this.running) {
        const blob = this.queue.shift();
        if (!blob) continue;
        if (this.speaking) {
          this.queue.unshift(blob);
          await sleep(150);
          continue;
        }
        const text = await this.transcribe(blob);
        if (!isMeaningfulText(text, this.cfg.language)) {
          this.log("STT skip non-meaningful text");
          continue;
        }
        const dedupe = sttDedupeKey(text);
        if (dedupe && dedupe === this.lastAcceptedSttKey) {
          this.log("STT skip duplicate of last turn");
          continue;
        }
        this.lastAcceptedSttKey = dedupe;
        this.cb.onUserText?.(text);
        const reply = await this.chatTurn(text);
        if (!reply) continue;
        this.cb.onAssistantText?.(reply);
        this.stopSilenceWatcher();
        this.stopRecordingToDiscard();
        await this.speak(reply);
        if (this.running) {
          if (!this.recorder) {
            this.createAndStartSegmentRecorder();
          }
          if (this.utteranceEndMode === "silence") {
            this.startSilenceWatcher();
          }
        }
      }
    } finally {
      this.busy = false;
      if (this.queue.length > 0 && this.running) {
        void this.pumpQueue();
      }
    }
  }

  private async transcribe(blob: Blob): Promise<string> {
    const form = new FormData();
    const name = `segment.${this.segmentFileExt}`;
    form.append("audio", blob, name);
    form.append("file", blob, name);
    if (this.cfg.language) {
      form.append("lang", this.cfg.language);
      form.append("language", this.cfg.language);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.cfg.timeoutMs);
    try {
      const headers: Record<string, string> = {};
      if (this.cfg.token) {
        if (this.cfg.tokenHeader.toLowerCase() === "authorization") {
          headers[this.cfg.tokenHeader] = `Bearer ${this.cfg.token}`;
        } else {
          headers[this.cfg.tokenHeader] = this.cfg.token;
        }
      }
      const res = await fetch(this.cfg.sttUrl, {
        method: "POST",
        headers,
        body: form,
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await safeText(res);
        const recoverable =
          res.status === 400 ||
          res.status === 422 ||
          res.status === 500 ||
          (res.status === 502 &&
            (body.includes("STT_UPSTREAM_ERROR") || body.includes("STT_BAD_AUDIO")));
        if (recoverable) {
          this.log(`STT recoverable skip (${res.status})`);
          return "";
        }
        this.cb.onError?.(`STT bridge ${res.status}: ${body}`);
        return "";
      }
      const json = (await res.json()) as Record<string, unknown>;
      const text =
        json?.text ??
        json?.transcript ??
        json?.result ??
        (json?.data as { text?: string; transcript?: string } | undefined)?.text ??
        (json?.data as { text?: string; transcript?: string } | undefined)?.transcript ??
        "";
      if (!text) return "";
      return String(text).trim();
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      const msg = err?.name === "AbortError" ? "STT timeout" : err?.message || "STT request failed";
      this.cb.onError?.(msg);
      return "";
    } finally {
      clearTimeout(timer);
    }
  }

  private speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        this.cb.onError?.("SpeechSynthesis not supported");
        this.speaking = false;
        resolve();
        return;
      }
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      this.speaking = true;
      const u = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const hk =
        voices.find((v) => v.lang?.toLowerCase().startsWith("zh-hk")) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith("yue")) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith("zh"));
      if (hk) u.voice = hk;
      u.lang = hk?.lang || "zh-HK";
      u.rate = 1.0;
      u.pitch = 1.0;
      u.volume = 1.0;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        this.speaking = false;
        resolve();
      };
      const fallback = setTimeout(finish, 12_000);
      u.onend = () => {
        clearTimeout(fallback);
        finish();
      };
      u.onerror = () => {
        clearTimeout(fallback);
        finish();
      };
      window.speechSynthesis.speak(u);
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
