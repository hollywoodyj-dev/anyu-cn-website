/**
 * V7 first-response QA checker (Lumen).
 *
 * Usage:
 *   QA_BASE_URL=http://localhost:3030 node scripts/qa-v7-first-response.mjs
 *
 * Focus:
 * - First-turn "接住" quality
 * - No generic reset / positive drift on distress
 * - V7 tightening on non-core assistant asks (recipe/joke)
 */
import { randomUUID } from "node:crypto";

const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3030").replace(/\/$/, "");

const BANNED_GENERIC = /那挺好|那挺好的|今天过得还轻松吗|见到你就好|今天有没有什么特别/;
const DISTRESS_INPUT = /孤独|孤單|孤单|寂寞|无人|無人|没人|冇人|不在乎|唔理我|不理我|难受|低落/;
const DISTRESS_ACK = /听到|聽到|明白|唔易|不容易|不好受|冷清|孤独|孤單|孤单|挂住|掛住|在意|心里/;
const NON_CORE_ASK = /怎么做|點整|点整|教我做|做法|红烧肉|煮|笑话|講個笑話|讲个笑话|逗我笑/;
const NON_CORE_BAD = /步骤|步驟|先.*再.*然后|有个人.*笑话|哈哈.*笑话/;
const FAMILY_REDIRECT = /家人|子女|仔女|返嚟|回来|联系|聯絡|一起吃|一齐食|今晚|想谁|最想/;

const CASES = [
  { id: "first_lonely_mandarin", msg: "你好啊，今天比较孤独", lang: "zh" },
  { id: "first_lonely_canto", msg: "我觉得成日都无人理我", lang: "zh-HK" },
  { id: "first_misunderstood", msg: "你不明白我的意思", lang: "zh" },
  { id: "first_family_hurt", msg: "我觉得子女不在乎我", lang: "zh" },
  { id: "first_recipe_tighten", msg: "教我做红烧肉", lang: "zh" },
  { id: "first_joke_tighten", msg: "讲个笑话", lang: "zh" },
];

async function postFirstTurn({ msg, lang }) {
  const sid = `qa-v7-first-${randomUUID()}`;
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

function checkCase(input, response) {
  const reasons = [];
  if (!response || !response.trim()) reasons.push("empty_response");
  if (BANNED_GENERIC.test(response)) reasons.push("generic_reset_phrase");
  if (sentenceCount(response) > 3) reasons.push("too_many_sentences");

  if (DISTRESS_INPUT.test(input)) {
    if (!DISTRESS_ACK.test(response)) reasons.push("missing_distress_ack");
    if (/那挺好|那挺好的|听起来不错|幾好啊|几好啊/.test(response)) {
      reasons.push("positive_drift_on_distress");
    }
  }

  if (NON_CORE_ASK.test(input)) {
    if (NON_CORE_BAD.test(response)) reasons.push("assistant_like_tutorial_or_entertainment");
    if (!FAMILY_REDIRECT.test(response)) reasons.push("missing_family_state_redirect");
  }

  return reasons;
}

async function main() {
  console.log(`base: ${baseUrl}`);
  console.log(`cases: ${CASES.length}`);

  let failed = 0;
  for (const c of CASES) {
    const { ok, status, json } = await postFirstTurn(c);
    if (!ok) {
      failed += 1;
      console.log(`[${c.id}] FAIL HTTP ${status}`);
      continue;
    }
    const reply = (json?.assistant_message ?? "").trim();
    const reasons = checkCase(c.msg, reply);
    if (reasons.length > 0) {
      failed += 1;
      console.log(`[${c.id}] FAIL reasons=${reasons.join(",")} reply=${JSON.stringify(reply)}`);
    } else {
      console.log(`[${c.id}] PASS reply=${JSON.stringify(reply)}`);
    }
  }

  console.log(`\nsummary: failed=${failed}/${CASES.length}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
