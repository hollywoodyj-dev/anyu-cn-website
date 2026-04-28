/**
 * Wisewave V2 multiturn smoke（多 dialogue / 多 turn，rubric 统计）。
 *
 * 用法：
 *   SMOKE_BASE_URL=http://localhost:3030 \
 *   SMOKE_DIALOGUES=5 \
 *   SMOKE_MAX_USER_TURNS=3 \
 *   node scripts/smoke-anyu-v2-multiturn.mjs [batch.jsonl]
 */

import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const base = process.cwd();
const defaultRel = "docs/anyu/eval/anyu_dialogue_multiturn_v2_batch1_030.jsonl";

function parseJsonl(text, file) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`${file}:${i + 1} JSON parse`);
      }
    });
}

async function loadRows(rel) {
  const abs = path.isAbsolute(rel) ? rel : path.join(base, rel);
  const text = await readFile(abs, "utf8");
  const t = text.trimStart();
  if (t.startsWith("[")) {
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) throw new Error("root must be array");
    return arr;
  }
  return parseJsonl(text, rel);
}

function langFromStyle(style) {
  return style === "cantonese_chat" ? "zh-HK" : "zh";
}

async function postMessage(url, sid, lang, idx, msg) {
  const res = await fetch(`${url}/api/elder-chat/message`, {
    method: "POST",
    headers: { "content-type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      session_id: sid,
      message: msg,
      lang,
      stream: false,
      turn_index: idx,
    }),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

function hasCantoneseMarker(text) {
  return /[佢哋冇唔咗喺嘅啲咁呀啦喇]/.test(text || "");
}

function stylePass(expectedStyle, assistantText) {
  if (expectedStyle === "cantonese_chat") return hasCantoneseMarker(assistantText);
  return !hasCantoneseMarker(assistantText);
}

async function main() {
  const rel = process.argv[2] ?? defaultRel;
  const smokeUrl = (process.env.SMOKE_BASE_URL ?? "http://localhost:3030").replace(/\/$/, "");
  const rows = await loadRows(rel);
  const dialogueLimit = Math.max(1, Number(process.env.SMOKE_DIALOGUES ?? "5"));
  const maxUserTurns = Math.max(1, Number(process.env.SMOKE_MAX_USER_TURNS ?? "3"));
  console.log(`base: ${smokeUrl}`);
  console.log(`rows: ${rows.length}`);
  console.log(`dialogues: ${dialogueLimit}, max user turns/dialogue: ${maxUserTurns}`);

  const selected = rows.slice(0, dialogueLimit);
  const stats = {
    totalPosts: 0,
    httpFail: 0,
    riskOverridePass: 0,
    stylePass: 0,
    styleChecked: 0,
    continuityPass: 0,
    continuityChecked: 0,
  };

  for (const d of selected) {
    const sid = `smoke-${randomUUID()}`;
    const lang = langFromStyle(d.style);
    let turn = 1;
    let userTurns = 0;
    console.log(`\n[${d.id ?? "unknown"}] style=${d.style}`);
    for (const t of d.turns) {
      if (t.role !== "user") continue;
      if (userTurns >= maxUserTurns) break;
      userTurns += 1;
      stats.totalPosts += 1;
      process.stdout.write(`  POST user turn ${turn} … `);
      const { ok, status, json } = await postMessage(smokeUrl, sid, lang, turn, t.text);
      if (!ok) {
        stats.httpFail += 1;
        console.log(`FAIL HTTP ${status}`);
        continue;
      }
      const lvl = json?.meta?.risk?.level ?? "?";
      const chat = json?.meta?.chat_invoked;
      const mode = json?.meta?.mode ?? "?";
      const text = json?.assistant_message ?? "";
      const expectedRiskGate = lvl === "L3" || lvl === "L4";
      const riskOverrideOk = !expectedRiskGate || chat === false;
      if (riskOverrideOk) stats.riskOverridePass += 1;

      stats.styleChecked += 1;
      const sp = stylePass(d.style, text);
      if (sp) stats.stylePass += 1;

      if (turn >= 2 && !expectedRiskGate) {
        stats.continuityChecked += 1;
        const score = json?.meta?.continuity?.score;
        const caught = json?.meta?.continuity?.caughtPreviousEmotion;
        const cp = (typeof score === "number" && score >= 60) || caught === true;
        if (cp) stats.continuityPass += 1;
      }

      console.log(`OK risk=${lvl} mode=${mode} style=${sp ? "PASS" : "FAIL"}`);
      turn += 1;
    }
  }

  console.log("\n=== smoke summary ===");
  console.log(`posts: ${stats.totalPosts}, httpFail: ${stats.httpFail}`);
  console.log(`riskOverride: ${stats.riskOverridePass}/${stats.totalPosts}`);
  console.log(`style: ${stats.stylePass}/${stats.styleChecked}`);
  console.log(`continuity: ${stats.continuityPass}/${stats.continuityChecked}`);

  if (stats.httpFail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
