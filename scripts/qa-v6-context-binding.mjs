/**
 * V6 Context Binding smoke (manual / CI optional).
 *
 *   QA_BASE_URL=http://localhost:3030 node scripts/qa-v6-context-binding.mjs
 *
 * Uses one session_id for multi-turn recipe continuation.
 */
import { randomUUID } from "node:crypto";

const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3030").replace(/\/$/, "");
const sessionId = `v6-smoke-${randomUUID()}`;

async function post(message) {
  const res = await fetch(`${baseUrl}/api/elder-chat/message`, {
    method: "POST",
    headers: { "content-type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ session_id: sessionId, message, lang: "zh" }),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, json };
}

function main() {
  return (async () => {
    const reasons = [];
    const u1 = "我想做红烧肉，你能告诉我怎么做吗";
    const r1 = await post(u1);
    const a1 = r1.json?.assistant_message ?? "";
    const p1 = r1.json?.meta?.runtime?.v6?.pending_task;
    if (!r1.ok) reasons.push(`turn1_http_${r1.json?.error ?? "?"}`);
    if (!/(做法|切|煮|炖|焖|肉|酱油|姜)/.test(a1)) reasons.push("turn1_no_recipe_signals");
    if (!p1 || p1.status !== "pending" || p1.type !== "recipe") reasons.push("turn1_pending_not_recipe");

    const r2 = await post("好的，你说");
    const a2 = r2.json?.assistant_message ?? "";
    if (!/(切|煮|炖|焖|焯|酱油|姜|肉|步骤)/.test(a2)) reasons.push("turn2_no_recipe_continuation");
    if (/今天过得还轻松吗|今天有没有什么特别|见到你就好/.test(a2)) reasons.push("turn2_greeting_reset");

    const r3 = await post("一个人太闷了，讲个笑话吧");
    const a3 = r3.json?.assistant_message ?? "";
    if (!/(笑话|笑話|有个人|哈哈|从前|有一日)/.test(a3)) reasons.push("turn3_no_joke");

    if (reasons.length) {
      console.error("V6 smoke FAIL:", reasons.join("; "));
      process.exit(1);
    }
    console.log("V6 smoke OK");
  })();
}

main();
