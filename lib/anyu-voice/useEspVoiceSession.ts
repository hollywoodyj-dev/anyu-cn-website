import { useCallback, useMemo, useRef, useState } from "react";
import { EspVoiceSession, type EspVoiceSessionOptions } from "./anyu-esp-voice-session";

type HookArgs = Omit<
  EspVoiceSessionOptions,
  "onLog" | "onUserText" | "onAssistantText" | "onSpeakingState"
>;

export function useEspVoiceSession(args: HookArgs) {
  const sessionRef = useRef<EspVoiceSession | null>(null);
  const [connected, setConnected] = useState(false);
  const [remoteSpeaking, setRemoteSpeaking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastUserText, setLastUserText] = useState("");
  const [lastAssistantText, setLastAssistantText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const appendLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev.slice(-199), `${new Date().toISOString()} ${msg}`]);
  }, []);

  const buildSession = useCallback(
    () =>
      new EspVoiceSession({
        ...args,
        onLog: (msg) => appendLog(msg),
        onUserText: (text) => setLastUserText(text),
        onAssistantText: (text) => setLastAssistantText(text),
        onSpeakingState: (speaking) => setRemoteSpeaking(speaking),
      }),
    [args, appendLog],
  );

  const connect = useCallback(async () => {
    try {
      setError(null);
      if (!sessionRef.current) sessionRef.current = buildSession();
      await sessionRef.current.connect();
      setConnected(true);
    } catch (e: unknown) {
      setConnected(false);
      const msg = (e as { message?: string })?.message ?? "connect failed";
      setError(msg);
      appendLog(`connect error: ${msg}`);
      throw e;
    }
  }, [appendLog, buildSession]);

  const disconnect = useCallback(async () => {
    try {
      setError(null);
      if (sessionRef.current) await sessionRef.current.disconnect();
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "disconnect failed";
      setError(msg);
      appendLog(`disconnect error: ${msg}`);
    } finally {
      setConnected(false);
      setRemoteSpeaking(false);
      sessionRef.current = null;
    }
  }, [appendLog]);

  const sendText = useCallback((text: string) => {
    if (!sessionRef.current) return;
    sessionRef.current.sendText(text);
  }, []);

  const stopMicTurn = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.sendMicStopSentinel();
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return useMemo(
    () => ({
      connected,
      remoteSpeaking,
      logs,
      lastUserText,
      lastAssistantText,
      error,
      connect,
      disconnect,
      sendText,
      stopMicTurn,
      clearLogs,
    }),
    [
      connected,
      remoteSpeaking,
      logs,
      lastUserText,
      lastAssistantText,
      error,
      connect,
      disconnect,
      sendText,
      stopMicTurn,
      clearLogs,
    ],
  );
}
