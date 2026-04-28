type JsonMsg = Record<string, unknown>;

export type EspVoiceSessionOptions = {
  otaUrl: string;
  deviceId: string;
  clientId: string;
  deviceName?: string;
  deviceMac?: string;
  wsToken?: string;
  onLog?: (msg: string) => void;
  onUserText?: (text: string) => void;
  onAssistantText?: (text: string) => void;
  onSpeakingState?: (speaking: boolean) => void;
  startMic: (sendOpusFrame: (frame: Uint8Array) => void) => Promise<void>;
  stopMic: () => Promise<void> | void;
  playOpusFrame: (frame: Uint8Array) => void;
  clearPlayback?: () => void;
};

export class EspVoiceSession {
  private ws: WebSocket | null = null;
  private currentSessionId: string | null = null;
  private isRemoteSpeaking = false;
  private opts: EspVoiceSessionOptions;

  constructor(opts: EspVoiceSessionOptions) {
    this.opts = opts;
  }

  private log(msg: string) {
    this.opts.onLog?.(msg);
  }

  async connect(): Promise<void> {
    const ota = await this.fetchOta();
    const otaWs = ota?.websocket as { url?: string; token?: string } | undefined;
    const wsUrl = otaWs?.url;
    const token = this.opts.wsToken ?? otaWs?.token ?? "";
    if (!wsUrl) throw new Error("OTA response missing websocket.url");

    const finalUrl = this.withQuery(wsUrl, {
      "device-id": this.opts.deviceId,
      "client-id": this.opts.clientId,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    });

    this.ws = new WebSocket(finalUrl);
    this.ws.binaryType = "arraybuffer";

    await new Promise<void>((resolve, reject) => {
      const ws = this.ws;
      if (!ws) return reject(new Error("ws not created"));
      ws.onopen = async () => {
        this.log("WS connected");
        this.bindWsHandlers();
        this.sendHello(token);
        await this.opts.startMic((frame) => this.sendBinary(frame));
        resolve();
      };
      ws.onerror = () => reject(new Error("WebSocket error"));
    });
  }

  async disconnect(): Promise<void> {
    await this.opts.stopMic();
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
    }
    this.ws = null;
    this.currentSessionId = null;
    this.isRemoteSpeaking = false;
  }

  sendText(text: string) {
    if (!text?.trim()) return;
    if (this.isRemoteSpeaking && this.currentSessionId) {
      this.sendJson({
        session_id: this.currentSessionId,
        type: "abort",
        reason: "wake_word_detected",
      });
    }
    this.sendJson({
      type: "listen",
      state: "detect",
      text,
    });
  }

  sendMicStopSentinel() {
    this.sendBinary(new Uint8Array(0));
  }

  private bindWsHandlers() {
    if (!this.ws) return;
    this.ws.onmessage = (evt) => {
      if (typeof evt.data === "string") {
        let msg: JsonMsg;
        try {
          msg = JSON.parse(evt.data) as JsonMsg;
        } catch {
          return;
        }
        this.handleJson(msg);
      } else {
        const frame = new Uint8Array(evt.data as ArrayBuffer);
        this.opts.playOpusFrame(frame);
      }
    };
    this.ws.onclose = () => {
      this.log("WS closed");
      this.opts.onSpeakingState?.(false);
      this.isRemoteSpeaking = false;
    };
  }

  private handleJson(msg: JsonMsg) {
    switch (msg.type) {
      case "hello": {
        const session = typeof msg.session_id === "string" ? msg.session_id : null;
        if (session) this.currentSessionId = session;
        this.log(`hello ok session=${this.currentSessionId ?? "-"}`);
        break;
      }
      case "stt": {
        if (typeof msg.text === "string") this.opts.onUserText?.(msg.text);
        break;
      }
      case "llm": {
        if (typeof msg.text === "string") this.opts.onAssistantText?.(msg.text);
        break;
      }
      case "tts": {
        this.handleTtsState(msg);
        break;
      }
      default:
        break;
    }
  }

  private handleTtsState(msg: JsonMsg) {
    const state = msg.state;
    if (state === "start") {
      this.isRemoteSpeaking = true;
      const session = typeof msg.session_id === "string" ? msg.session_id : null;
      this.currentSessionId = session ?? this.currentSessionId;
      this.opts.onSpeakingState?.(true);
      return;
    }
    if (state === "sentence_start") {
      if (typeof msg.text === "string") this.opts.onAssistantText?.(msg.text);
      return;
    }
    if (state === "stop") {
      this.isRemoteSpeaking = false;
      this.opts.onSpeakingState?.(false);
      this.opts.clearPlayback?.();
    }
  }

  private sendHello(token: string) {
    this.sendJson({
      type: "hello",
      device_id: this.opts.deviceId,
      device_name: this.opts.deviceName ?? "anyu-web",
      device_mac: this.opts.deviceMac ?? this.opts.deviceId,
      token,
      features: { mcp: true },
    });
  }

  private sendJson(obj: JsonMsg) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(obj));
  }

  private sendBinary(data: Uint8Array) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(data);
  }

  private async fetchOta(): Promise<Record<string, unknown>> {
    const body = {
      application: { version: "1.0.0" },
      board: { type: "anyu_web" },
    };
    const res = await fetch(this.opts.otaUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "device-id": this.opts.deviceId,
        "client-id": this.opts.clientId,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`OTA failed: ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  }

  private withQuery(url: string, query: Record<string, string>) {
    const u = new URL(url);
    for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v);
    return u.toString();
  }
}
