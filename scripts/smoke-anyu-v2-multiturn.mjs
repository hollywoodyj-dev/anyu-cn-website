/**
 * 对 Wisewave V2 multiturn 顺序 POST 冒烟（不对比参考答案）。
 *
 * 当前 P0：`/api/elder-chat/message` 单轮拼装 prompt，`turn_index` 递增；尚无完整多轮记忆注入 LLM。
 *
 * SMOKE_BASE_URL=http://localhost:3030 node scripts/smoke-anyu-v2-multiturn.mjs [batch.jsonl]
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

async function main() {
  const rel = process.argv[2] ?? defaultRel;
  const smokeUrl = (process.env.SMOKE_BASE_URL ?? "http://localhost:3030").replace(/\/$/, "");
  const rows = await loadRows(rel);
  console.log(`base: ${smokeUrl}`);
  console.log(`rows: ${rows.length}`);
  console.log("(only FIRST dialogue × user turns, for quick smoke)");

  const first = rows[0];
  if (!first) return;
  const sid = randomUUID();
  const lang = langFromStyle(first.style);
  let turn = 1;
  for (const t of first.turns) {
    if (t.role !== "user") continue;
    process.stdout.write(`  POST turn ${turn} … `);
    const { ok, status, json } = await postMessage(smokeUrl, sid, lang, turn, t.text);
    const lvl = json?.meta?.risk?.level ?? "?";
    const chat = json?.meta?.chat_invoked;
    console.log(ok ? `OK risk=${lvl} chat=${chat}` : `FAIL HTTP ${status}`);
    if (!ok) console.error(json);
    turn += 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
