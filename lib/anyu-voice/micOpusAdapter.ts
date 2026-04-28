type SendFrame = (frame: Uint8Array) => void;

function getOpusModule(): {
  _opus_encoder_get_size: (channels: number) => number;
  _opus_encoder_init: (ptr: number, sampleRate: number, channels: number, app: number) => number;
  _opus_encode: (encPtr: number, pcmPtr: number, frameSize: number, outPtr: number, maxPacket: number) => number;
  _opus_decoder_get_size: (channels: number) => number;
  _opus_decoder_init: (ptr: number, sampleRate: number, channels: number) => number;
  _opus_decode: (decPtr: number, inPtr: number, inLen: number, pcmPtr: number, frameSize: number, decodeFec: number) => number;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  HEAP16: Int16Array;
  HEAPU8: Uint8Array;
} {
  const holder = window as Window & { Module?: unknown; ModuleInstance?: unknown };
  const mod = holder.ModuleInstance ?? holder.Module;
  if (!mod) throw new Error("Opus wasm module not loaded (Module/ModuleInstance missing)");
  return mod as ReturnType<typeof getOpusModule>;
}

class OpusEncoder16k {
  private mod = getOpusModule();
  private encPtr: number | null = null;
  private channels = 1;
  private sampleRate = 16000;
  private frameSize = 960;

  init() {
    if (this.encPtr) return;
    const size = this.mod._opus_encoder_get_size(this.channels);
    this.encPtr = this.mod._malloc(size);
    if (!this.encPtr) throw new Error("alloc encoder failed");
    const APPLICATION_AUDIO = 2049;
    const ptr = this.mod._opus_encoder_init(
      this.encPtr,
      this.sampleRate,
      this.channels,
      APPLICATION_AUDIO,
    );
    if (!ptr) throw new Error("opus encoder init failed");
  }

  encode(pcm16: Int16Array): Uint8Array {
    if (!this.encPtr) this.init();
    const pcmBytes = pcm16.length * 2;
    const pcmPtr = this.mod._malloc(pcmBytes);
    this.mod.HEAP16.set(pcm16, pcmPtr >> 1);
    const maxPacket = 4000;
    const outPtr = this.mod._malloc(maxPacket);
    const len = this.mod._opus_encode(this.encPtr as number, pcmPtr, this.frameSize, outPtr, maxPacket);
    this.mod._free(pcmPtr);
    if (len <= 0) {
      this.mod._free(outPtr);
      throw new Error(`opus encode failed: ${len}`);
    }
    const out = new Uint8Array(len);
    out.set(this.mod.HEAPU8.subarray(outPtr, outPtr + len));
    this.mod._free(outPtr);
    return out;
  }

  destroy() {
    if (this.encPtr) {
      this.mod._free(this.encPtr);
      this.encPtr = null;
    }
  }
}

class OpusDecoder16k {
  private mod = getOpusModule();
  private decPtr: number | null = null;
  private channels = 1;
  private sampleRate = 16000;
  private frameSize = 960;

  init() {
    if (this.decPtr) return;
    const size = this.mod._opus_decoder_get_size(this.channels);
    this.decPtr = this.mod._malloc(size);
    if (!this.decPtr) throw new Error("alloc decoder failed");
    const err = this.mod._opus_decoder_init(this.decPtr, this.sampleRate, this.channels);
    if (err < 0) throw new Error(`opus decoder init failed: ${err}`);
  }

  decode(packet: Uint8Array): Int16Array {
    if (!this.decPtr) this.init();
    const inPtr = this.mod._malloc(packet.length);
    this.mod.HEAPU8.set(packet, inPtr);
    const pcmPtr = this.mod._malloc(this.frameSize * 2);
    const decoded = this.mod._opus_decode(this.decPtr as number, inPtr, packet.length, pcmPtr, this.frameSize, 0);
    this.mod._free(inPtr);
    if (decoded < 0) {
      this.mod._free(pcmPtr);
      throw new Error(`opus decode failed: ${decoded}`);
    }
    const pcm = new Int16Array(decoded);
    pcm.set(this.mod.HEAP16.subarray(pcmPtr >> 1, (pcmPtr >> 1) + decoded));
    this.mod._free(pcmPtr);
    return pcm;
  }

  destroy() {
    if (this.decPtr) {
      this.mod._free(this.decPtr);
      this.decPtr = null;
    }
  }
}

export class MicOpusSender {
  private audioCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private encoder: OpusEncoder16k | null = null;
  private running = false;
  private pcmBuffer = new Int16Array(0);
  private readonly frameSize = 960;

  async start(sendFrame: SendFrame) {
    if (this.running) return;
    this.running = true;
    this.encoder = new OpusEncoder16k();
    this.encoder.init();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate: 16000,
      },
    });
    this.audioCtx = new AudioContext({ sampleRate: 16000, latencyHint: "interactive" });
    if (this.audioCtx.state === "suspended") await this.audioCtx.resume();
    this.source = this.audioCtx.createMediaStreamSource(this.stream);
    this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e) => {
      if (!this.running || !this.encoder) return;
      const input = e.inputBuffer.getChannelData(0);
      const chunk = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        const v = Math.max(-1, Math.min(1, input[i]));
        chunk[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
      }
      const merged = new Int16Array(this.pcmBuffer.length + chunk.length);
      merged.set(this.pcmBuffer);
      merged.set(chunk, this.pcmBuffer.length);
      this.pcmBuffer = merged;
      while (this.pcmBuffer.length >= this.frameSize) {
        const frame = this.pcmBuffer.slice(0, this.frameSize);
        this.pcmBuffer = this.pcmBuffer.slice(this.frameSize);
        try {
          const opus = this.encoder.encode(frame);
          sendFrame(opus);
        } catch (err) {
          console.error("encode error", err);
        }
      }
    };
    const silent = this.audioCtx.createGain();
    silent.gain.value = 0;
    this.source.connect(this.processor);
    this.processor.connect(silent);
    silent.connect(this.audioCtx.destination);
  }

  stop(sendStopSentinel?: SendFrame) {
    if (!this.running) return;
    this.running = false;
    if (this.encoder && this.pcmBuffer.length > 0) {
      const frame = new Int16Array(this.frameSize);
      frame.set(this.pcmBuffer.subarray(0, Math.min(this.pcmBuffer.length, this.frameSize)));
      try {
        const opus = this.encoder.encode(frame);
        sendStopSentinel?.(opus);
      } catch {
        // ignore
      }
    }
    sendStopSentinel?.(new Uint8Array(0));
    this.pcmBuffer = new Int16Array(0);
    this.processor?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.audioCtx?.close();
    this.processor = null;
    this.source = null;
    this.stream = null;
    this.audioCtx = null;
    this.encoder?.destroy();
    this.encoder = null;
  }
}

export class OpusPlayer16k {
  private audioCtx: AudioContext | null = null;
  private decoder: OpusDecoder16k | null = null;
  private nextTime = 0;
  private readonly sampleRate = 16000;

  async init() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext({ sampleRate: this.sampleRate, latencyHint: "interactive" });
    }
    if (this.audioCtx.state === "suspended") await this.audioCtx.resume();
    if (!this.decoder) {
      this.decoder = new OpusDecoder16k();
      this.decoder.init();
    }
    if (!this.nextTime || this.nextTime < this.audioCtx.currentTime) {
      this.nextTime = this.audioCtx.currentTime;
    }
  }

  async playOpus(packet: Uint8Array) {
    if (!packet || packet.length === 0) return;
    await this.init();
    if (!this.audioCtx || !this.decoder) return;
    const pcm16 = this.decoder.decode(packet);
    if (pcm16.length === 0) return;
    const audioBuffer = this.audioCtx.createBuffer(1, pcm16.length, this.sampleRate);
    const ch = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcm16.length; i++) {
      ch[i] = pcm16[i] / 32768;
    }
    const src = this.audioCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(this.audioCtx.destination);
    const startAt = Math.max(this.nextTime, this.audioCtx.currentTime);
    src.start(startAt);
    this.nextTime = startAt + audioBuffer.duration;
  }

  clearQueue() {
    if (this.audioCtx) this.nextTime = this.audioCtx.currentTime;
  }

  async close() {
    this.decoder?.destroy();
    this.decoder = null;
    if (this.audioCtx) {
      await this.audioCtx.close();
      this.audioCtx = null;
    }
    this.nextTime = 0;
  }
}
