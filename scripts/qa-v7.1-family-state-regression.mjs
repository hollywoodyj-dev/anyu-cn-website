/**
 * V7.1 Family-State Regression Suite
 *
 * Usage:
 *   QA_BASE_URL=http://localhost:3030 node scripts/qa-v7.1-family-state-regression.mjs
 *
 * Focus:
 * 1) family hurt detection
 * 2) alignment repair responses
 * 3) family-message brevity
 */
import { randomUUID } from "node:crypto";

const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3030").replace(/\/$/, "");

async function postTurn(sessionId, message, lang = "zh") {
  const res = await fetch(`${baseUrl}/api/elder-chat/message`, {
    method: "POST",
    headers: { "content-type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      elder_user_id: "elder_v71",
      message,
      lang,
    }),
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

function checkFamilyHurt(turnText, json) {
  const reasons = [];
  const runtime = json?.meta?.runtime ?? {};
  const topic = json?.meta?.active_thread?.topic;
  const dialogueState = json?.meta?.dialogue_state;
  const emotion = runtime?.detectedEmotion;
  const response = json?.assistant_message ?? "";
  const slots = runtime?.familySlots ?? {};

  if (topic !== "family") reasons.push("topic_not_family");
  if (dialogueState !== "family") reasons.push("dialogue_state_not_family");
  if (!emotion || emotion === "unclear") reasons.push("emotion_unclear");
  if (/你心里不好受/.test(response) && !/家人|子女|儿子|女儿|你们|他们/.test(response)) {
    reasons.push("response_too_generic_no_family_context");
  }
  if (/子女|儿子|女儿/.test(turnText) && !slots.targetPerson) {
    reasons.push("family_slot_target_missing");
  }

  return reasons;
}

function checkAlignmentRepair(json) {
  const reasons = [];
  const response = json?.assistant_message ?? "";
  if (!/听明|听懂|重新听|慢慢说|慢慢讲/.test(response)) {
    reasons.push("no_alignment_repair_language");
  }
  if (/你心里不好受|最想谁陪你说两句/.test(response)) {
    reasons.push("fell_back_to_generic_distress");
  }
  return reasons;
}

function checkFamilyMessageBrevity(json) {
  const reasons = [];
  const response = json?.assistant_message ?? "";
  if (sentenceCount(response) > 3) reasons.push("too_many_lines");
  if (response.length > 90) reasons.push("too_long_chars");
  if (/内在|情绪机制|关系议题|价值感|意义感/.test(response)) {
    reasons.push("abstract_language");
  }
  return reasons;
}

async function runFamilyHurtSuite() {
  const cases = [
    "我觉得子女不在乎我",
    "他们都不来看我",
    "我女儿现在很少理我",
    "我儿子好像不需要我了",
    "他们来看我也只是看手机",
  ];
  let fail = 0;
  for (const text of cases) {
    const sid = `v71-fam-${randomUUID()}`;
    const { ok, status, json } = await postTurn(sid, text);
    if (!ok) {
      fail += 1;
      console.log(`[family] FAIL http_${status} input=${text}`);
      continue;
    }
    const reasons = checkFamilyHurt(text, json);
    if (reasons.length > 0) {
      fail += 1;
      console.log(`[family] FAIL input=${text} reasons=${reasons.join(",")}`);
    } else {
      console.log(`[family] PASS input=${text}`);
    }
  }
  return fail;
}

async function runAlignmentSuite() {
  const cases = [
    "你没听懂",
    "不是这个意思",
    "我不是说这个",
    "你怎么老是这样回",
    "我不是抱怨，我是说事实",
  ];
  let fail = 0;
  for (const text of cases) {
    const sid = `v71-align-${randomUUID()}`;
    const { ok, status, json } = await postTurn(sid, text);
    if (!ok) {
      fail += 1;
      console.log(`[align] FAIL http_${status} input=${text}`);
      continue;
    }
    const reasons = checkAlignmentRepair(json);
    if (reasons.length > 0) {
      fail += 1;
      console.log(`[align] FAIL input=${text} reasons=${reasons.join(",")}`);
    } else {
      console.log(`[align] PASS input=${text}`);
    }
  }
  return fail;
}

async function runFamilyBrevitySuite() {
  const sid = `v71-brief-${randomUUID()}`;
  const { ok, status, json } = await postTurn(
    sid,
    "今天买了很多菜，希望家人今晚回来吃饭",
  );
  if (!ok) {
    console.log(`[brief] FAIL http_${status}`);
    return 1;
  }
  const reasons = checkFamilyMessageBrevity(json);
  if (reasons.length > 0) {
    console.log(`[brief] FAIL reasons=${reasons.join(",")} reply=${JSON.stringify(json?.assistant_message ?? "")}`);
    return 1;
  }
  console.log("[brief] PASS");
  return 0;
}

async function main() {
  console.log(`base: ${baseUrl}`);
  let fail = 0;
  fail += await runFamilyHurtSuite();
  fail += await runAlignmentSuite();
  fail += await runFamilyBrevitySuite();
  console.log(`\nV7.1 summary: failed=${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

