/**
 * V5.1 Progression QA checker
 *
 * Usage:
 *   node scripts/qa-v5-progression-check.mjs docs/anyu/eval/anyu_v5_progression_regression_006.jsonl
 *
 * Env:
 *   QA_BASE_URL=http://localhost:3030
 */

import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

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

function langFromStyle(style) {
  return style === "cantonese_chat" ? "zh-HK" : "zh";
}

async function postTurn(baseUrl, body) {
  const res = await fetch(`${baseUrl}/api/elder-chat/message`, {
    method: "POST",
    headers: { "content-type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

function checkTurn(turnText, json, turnIndex, seen) {
  const reasons = [];
  const reply = json?.assistant_message ?? "";
  const runtime = json?.meta?.runtime ?? {};
  const mode = json?.meta?.mode ?? "";

  // 1) greeting reset after turn 3
  if (turnIndex > 2 && /(今天过得还轻松吗|今天有没有什么特别|见到你就好)/.test(reply)) {
    reasons.push("greeting_reset");
  }

  // 2) repeated family preference question
  const isPrefQuestion = /(更想见一面|先通个电话|听到谁的声音|你想先听听谁的声音)/.test(reply);
  if (isPrefQuestion) {
    seen.preferenceQ += 1;
    if (seen.preferenceQ > 1) reasons.push("repeated_preference_question");
  }

  // 3) repeated advice/script
  const isScriptAdvice = /(可以这样说|可以咁讲)/.test(reply);
  if (isScriptAdvice) {
    seen.advice += 1;
    if (seen.advice > 1) reasons.push("repeated_advice");
  }

  // 4) resistance handling
  if (/说不出口|不好意思说|不知道怎么开口/.test(turnText) && /(可以这样说|可以咁讲)/.test(reply)) {
    reasons.push("resistance_not_softened");
  }
  if (/他们也忙|不想打扰/.test(turnText) && /(可以这样说|可以咁讲)/.test(reply)) {
    reasons.push("busy_resistance_not_softened");
  }

  // 5) family progression should switch to message_builder when slots ready
  const filled = runtime?.familyIntentReady === true;
  const progressed = runtime?.progressionToMessageBuilder === true;
  if (filled && !progressed) reasons.push("family_intent_not_progressed");
  if (filled && mode !== "family_message") reasons.push("family_mode_not_applied");

  return reasons;
}

async function main() {
  const rel = process.argv[2] ?? "docs/anyu/eval/anyu_v5_progression_regression_006.jsonl";
  const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3030").replace(/\/$/, "");
  const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
  const rows = parseJsonl(await readFile(abs, "utf8"), rel);

  let totalTurns = 0;
  let failedTurns = 0;

  console.log(`base: ${baseUrl}`);
  console.log(`dialogues: ${rows.length}`);

  for (const row of rows) {
    const sid = `qa-v5-prog-${randomUUID()}`;
    const lang = langFromStyle(row.style);
    const seen = { preferenceQ: 0, advice: 0 };
    console.log(`\n[${row.id}] style=${row.style}`);

    let turnIndex = 1;
    for (const turn of row.turns) {
      if (turn.role !== "user") continue;
      totalTurns += 1;
      const { ok, status, json } = await postTurn(baseUrl, {
        session_id: sid,
        turn_index: turnIndex,
        message: turn.text,
        lang,
      });
      if (!ok) {
        failedTurns += 1;
        console.log(`  t${turnIndex} HTTP ${status} FAIL`);
        turnIndex += 1;
        continue;
      }

      const reasons = checkTurn(turn.text, json, turnIndex, seen);
      if (reasons.length > 0) {
        failedTurns += 1;
        console.log(`  t${turnIndex} FAIL reasons=${reasons.join(",")}`);
      } else {
        console.log(`  t${turnIndex} PASS`);
      }
      turnIndex += 1;
    }
  }

  console.log("\n=== V5 progression summary ===");
  console.log(`turns: ${totalTurns}`);
  console.log(`failed: ${failedTurns}`);
  console.log(`pass_rate: ${((totalTurns - failedTurns) / Math.max(1, totalTurns) * 100).toFixed(1)}%`);

  if (failedTurns > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

