/**
 * V5 runtime QA checker
 *
 * Usage:
 *   node scripts/qa-v5-runtime-check.mjs docs/anyu/eval/anyu_v5_runtime_regression_010.jsonl
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

function checkTurn({ turnText, json, previousTopic }) {
  const topic = json?.meta?.active_thread?.topic ?? null;
  const guardPass = json?.meta?.runtime?.continuityGuard?.pass;
  const mode = json?.meta?.mode ?? null;
  const risk = json?.meta?.risk?.level ?? null;
  const reasons = [];

  if (typeof guardPass !== "boolean") reasons.push("missing_continuity_guard");
  if (!topic) reasons.push("missing_active_thread_topic");

  const isStoryInput = /以前|嗰阵|当年|细个|年轻时/.test(turnText);
  if (isStoryInput && topic !== "story") reasons.push("story_not_switched");

  const isConfusedLike = /还冰|没八死个|听不清|唔清楚/.test(turnText);
  if (isConfusedLike && mode === "emotional_listening") reasons.push("confused_not_clarified");

  const isNegative = /没人|冇人|无聊|孤单|唔开心|难受|不舒服/.test(turnText);
  const resp = json?.assistant_message ?? "";
  if (isNegative && /那挺好|听起来不错|几好啊/.test(resp)) reasons.push("negative_drift_to_positive");

  if (previousTopic && previousTopic !== "story" && topic === "daily" && /没人|冇人|仔女|家人/.test(turnText)) {
    reasons.push("topic_drift_to_daily");
  }

  if ((risk === "L3" || risk === "L4") && json?.meta?.chat_invoked !== false) {
    reasons.push("risk_gate_broken");
  }

  return { topic, guardPass, reasons };
}

async function main() {
  const rel = process.argv[2] ?? "docs/anyu/eval/anyu_v5_runtime_regression_010.jsonl";
  const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3030").replace(/\/$/, "");
  const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
  const rows = parseJsonl(await readFile(abs, "utf8"), rel);

  let totalTurns = 0;
  let failedTurns = 0;

  console.log(`base: ${baseUrl}`);
  console.log(`dialogues: ${rows.length}`);

  for (const row of rows) {
    const sid = `qa-v5-${randomUUID()}`;
    const lang = langFromStyle(row.style);
    let previousTopic = null;
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

      const chk = checkTurn({ turnText: turn.text, json, previousTopic });
      previousTopic = chk.topic ?? previousTopic;
      if (chk.reasons.length > 0) {
        failedTurns += 1;
        console.log(
          `  t${turnIndex} FAIL topic=${chk.topic} guard=${chk.guardPass} reasons=${chk.reasons.join(",")}`,
        );
      } else {
        console.log(`  t${turnIndex} PASS topic=${chk.topic} guard=${chk.guardPass}`);
      }
      turnIndex += 1;
    }
  }

  console.log("\n=== V5 runtime summary ===");
  console.log(`turns: ${totalTurns}`);
  console.log(`failed: ${failedTurns}`);
  console.log(`pass_rate: ${((totalTurns - failedTurns) / Math.max(1, totalTurns) * 100).toFixed(1)}%`);

  if (failedTurns > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

