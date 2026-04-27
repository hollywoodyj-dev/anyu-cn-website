import type { Metadata } from "next";
import { LampVoiceChat } from "@/components/anyu/lamp-voice-chat";

export const metadata: Metadata = {
  title: "安语灯语音体验 | 安语",
  description: "点击安语灯，开始语音对话：自动转写、安语回复、语音朗读。",
};

export default function LampVoicePage() {
  return <LampVoiceChat />;
}

