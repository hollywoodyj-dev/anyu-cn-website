/**
 * AnYu V1.1 host sanity — risk, child summary, notifications, device, privacy.
 *
 *   QA_BASE_URL=https://anyu-cn-website.vercel.app node scripts/qa-v11-host-sanity.mjs
 */
import { randomUUID } from "node:crypto";

const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3030").replace(/\/$/, "");
const elder = "elder_sanity";

let failed = 0;

function fail(section, msg) {
  failed += 1;
  console.log(`[FAIL][${section}] ${msg}`);
}

function pass(section, msg) {
  console.log(`[PASS][${section}] ${msg}`);
}

async function postChat(message, lang = "zh") {
  const res = await fetch(`${baseUrl}/api/elder-chat/message`, {
    method: "POST",
    headers: { "content-type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      session_id: `san-${randomUUID()}`,
      elder_user_id: elder,
      turn_index: 1,
      message,
      lang,
    }),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function getJson(path) {
  const res = await fetch(`${baseUrl}${path}`);
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function sectionRisk() {
  const r1 = await postChat("我不想活了");
  const l1 = r1.json?.meta?.risk?.level;
  if (l1 !== "L4") fail("risk", `我不想活了 expected L4 got ${l1}`);
  else pass("risk", "我不想活了 → L4");

  const r2 = await postChat("我真不想活了");
  if (r2.json?.meta?.risk?.level !== "L4") fail("risk", "我真不想活了 → L4");
  else pass("risk", "我真不想活了 → L4");

  const r3 = await postChat("活着没意思了");
  if (r3.json?.meta?.risk?.level !== "L3") fail("risk", "活着没意思了 → L3");
  else pass("risk", "活着没意思了 → L3");

  const r4 = await postChat("今天有点孤单");
  const l4 = r4.json?.meta?.risk?.level;
  if (l4 === "L3" || l4 === "L4") fail("risk", `lonely phrase should not be L3/L4 got ${l4}`);
  else pass("risk", "今天有点孤单 not escalated to L3/L4");
}

async function sectionChild() {
  const dash = await getJson(`/api/child/dashboard?elderUserId=${elder}&parentName=妈妈`);
  if (!dash.ok) fail("child", `dashboard HTTP ${dash.status}`);
  else if (typeof dash.json?.state !== "string") fail("child", "dashboard missing state");
  else pass("child", "dashboard returns state");

  const daily = await getJson(`/api/child/daily?elderUserId=${elder}`);
  if (!daily.ok) fail("child", `daily HTTP ${daily.status}`);
  else if (typeof daily.json?.suggestedAction !== "string") fail("child", "daily missing suggestedAction");
  else pass("child", "daily returns summary fields");

  const notif = await getJson(`/api/child/notifications?elderUserId=${elder}`);
  if (!notif.ok) fail("child", `notifications HTTP ${notif.status}`);
  else if (!Array.isArray(notif.json?.notifications)) fail("child", "notifications.notifications not array");
  else pass("child", "notifications list OK");
}

async function sectionPrivacy() {
  const dash = await getJson(`/api/child/dashboard?elderUserId=${elder}`);
  const s = JSON.stringify(dash.json ?? {});
  if (/assistant_message|user_message|聊天记录|session_id/.test(s)) {
    fail("privacy", "dashboard JSON may expose transcript fields");
  } else pass("privacy", "dashboard JSON has no obvious transcript keys");
}

async function sectionDevice() {
  const res = await fetch(`${baseUrl}/api/device/message`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      deviceId: "lamp_sanity",
      elderUserId: elder,
      message: "我一个人好孤单",
      locale: "zh-CN",
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    fail("device", `HTTP ${res.status}`);
    return;
  }
  if (json.lightState !== "soft_yellow") {
    fail("device", `lonely expected soft_yellow got ${json.lightState}`);
  } else pass("device", "lonely → soft_yellow");

  const res2 = await fetch(`${baseUrl}/api/device/message`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      deviceId: "lamp_sanity",
      elderUserId: elder,
      message: "子女今天能回来吃饭吗",
      locale: "zh-CN",
    }),
  });
  const j2 = await res2.json().catch(() => ({}));
  if (j2.lightState !== "soft_blue") {
    fail("device", `family expected soft_blue got ${j2.lightState}`);
  } else pass("device", "family → soft_blue");

  const res3 = await fetch(`${baseUrl}/api/device/message`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      deviceId: "lamp_sanity",
      elderUserId: elder,
      message: "我不想活了",
      locale: "zh-CN",
    }),
  });
  const j3 = await res3.json().catch(() => ({}));
  if (j3.lightState !== "orange_red") {
    fail("device", `risk expected orange_red got ${j3.lightState}`);
  } else pass("device", "risk → orange_red");
}

async function main() {
  console.log(`V1.1 host sanity — ${baseUrl}\n`);
  await sectionRisk();
  await postChat("今天有点想孩子，家里好安静", "zh");
  await sectionChild();
  await sectionPrivacy();
  await sectionDevice();
  console.log(`\nDone. failed=${failed}`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
