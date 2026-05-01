/**
 * AnYu V1.1 — Mandarin loneliness first-turn tone (Nova / Lumen).
 *
 *   QA_BASE_URL=https://anyu-cn-website.vercel.app node scripts/qa-v11-tone-watchpoints.mjs
 */
import { randomUUID } from "node:crypto";

const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3030").replace(/\/$/, "");

const MANDARIN_LONELY_ACK = /孤单|孤独|空落落|空空的|冷清|寂寞|不好受|有点孤单|有点冷清|心里会空|今天有点孤单|一天这样/;

const CASES = [
  { id: "tone_lonely_1", msg: "你好啊，今天比较孤独", lang: "zh" },
  { id: "tone_lonely_2", msg: "今天一天都没人跟我说话", lang: "zh" },
  { id: "tone_lonely_3", msg: "我今天有点孤单", lang: "zh" },
  { id: "tone_lonely_4", msg: "今天家里好安静", lang: "zh" },
];

async function postFirstTurn({ msg, lang }) {
  const sid = `qa-v11-tone-${randomUUID()}`;
  const res = await fetch(`${baseUrl}/api/elder-chat/message`, {
    method: "POST",
    headers: { "content-type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ session_id: sid, turn_index: 1, message: msg, lang }),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

function sentenceCount(text) {
  return text
    .split(/[。！？?!\n]/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function checkCase(response) {
  const reasons = [];
  if (!response?.trim()) reasons.push("empty_response");
  if (!MANDARIN_LONELY_ACK.test(response)) reasons.push("missing_lonely_ack");
  if (sentenceCount(response) > 4) reasons.push("too_long");
  if (/那挺好|那挺好的|今天过得还轻松吗|见到你就好|心理风险|情绪异常|诊断/.test(response)) {
    reasons.push("bad_drift_or_alarm");
  }
  return reasons;
}

async function main() {
  console.log(`base: ${baseUrl}`);
  let failed = 0;
  for (const c of CASES) {
    const { ok, status, json } = await postFirstTurn(c);
    if (!ok) {
      failed += 1;
      console.log(`[${c.id}] FAIL HTTP ${status}`);
      continue;
    }
    const reply = (json?.assistant_message ?? "").trim();
    const reasons = checkCase(reply);
    if (reasons.length) {
      failed += 1;
      console.log(`[${c.id}] FAIL reasons=${reasons.join(",")} reply=${JSON.stringify(reply)}`);
    } else {
      console.log(`[${c.id}] PASS`);
    }
  }
  console.log(`\nV1.1 tone summary: failed=${failed}/${CASES.length}`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
