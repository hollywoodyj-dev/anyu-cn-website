/**
 * AnYu V1.2 — Notification consent gate + child API privacy smoke (Nova / Lumen).
 *
 *   QA_BASE_URL=http://localhost:3030 node scripts/qa-v12-notification-consent.mjs
 *
 * Optional: chain V7/V1.1 regression (same shell env):
 *   QA_BASE_URL=... QA_RUN_CHAINED_REGRESSION=1 node scripts/qa-v12-notification-consent.mjs
 */
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3030").replace(/\/$/, "");
const elderSanity = "elder_sanity";

let failed = 0;

function fail(section, msg) {
  failed += 1;
  console.log(`[FAIL][${section}] ${msg}`);
}

function pass(section, msg) {
  console.log(`[PASS][${section}] ${msg}`);
}

async function getJson(path) {
  const res = await fetch(`${baseUrl}${path}`);
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function postSettings(elderUserId, payload) {
  const res = await fetch(`${baseUrl}/api/child/settings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ elderUserId, payload }),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function postChat(elderUserId, message, lang = "zh") {
  const res = await fetch(`${baseUrl}/api/elder-chat/message`, {
    method: "POST",
    headers: { "content-type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      session_id: `v12-${randomUUID()}`,
      elder_user_id: elderUserId,
      turn_index: 1,
      message,
      lang,
    }),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function dashboardTranscriptLeak(json) {
  const s = JSON.stringify(json ?? {});
  return /assistant_message|user_message|聊天记录|session_id|ConversationSignal|rawText/i.test(s);
}

function guiltLanguageInNotifications(list) {
  const guilt = /必须|赶紧|你不管她|就危险了|再不联系|都是你的错|内疚/;
  for (const n of list) {
    const t = `${n.title ?? ""}${n.message ?? ""}`;
    if (guilt.test(t)) return t.slice(0, 120);
  }
  return null;
}

function hasUrgentTitle(list) {
  return list.some((n) => /紧急/.test(n.title ?? ""));
}

function hasL3RiskTitle(list) {
  return list.some((n) => /需要关注/.test(n.title ?? ""));
}

async function sectionPrivacyDashboard() {
  const { ok, json } = await getJson(`/api/child/dashboard?elderUserId=${elderSanity}&parentName=妈妈`);
  if (!ok) return fail("privacy", `dashboard HTTP`);
  if (dashboardTranscriptLeak(json)) return fail("privacy", "dashboard JSON may expose transcript/session fields");
  pass("privacy", "dashboard JSON has no obvious transcript leak keys");
}

async function sectionNotificationTone() {
  const { ok, json } = await getJson(`/api/child/notifications?elderUserId=${elderSanity}`);
  if (!ok) return fail("tone", `notifications HTTP`);
  const list = json.notifications ?? [];
  const bad = guiltLanguageInNotifications(list);
  if (bad) return fail("tone", `guilt-like language: ${bad}`);
  pass("tone", "notifications titles/messages avoid guilt-trip phrasing (heuristic)");
}

async function sectionSettingsRoundtrip() {
  const eid = `v12-rt-${randomUUID()}`;
  const p1 = { familyAlertsEnabled: false, reminderTiers: { L1: true, L2: true, L3: true, L4: true } };
  const a = await postSettings(eid, p1);
  if (!a.ok) return fail("settings", `POST settings ${a.status}`);
  const g = await getJson(`/api/child/settings?elderUserId=${eid}`);
  if (g.json?.payload?.familyAlertsEnabled !== false) return fail("settings", "familyAlertsEnabled round-trip");
  await postSettings(eid, { familyAlertsEnabled: true });
  pass("settings", "familyAlertsEnabled POST/GET round-trip");
}

async function sectionL4BlockedWithoutEmergency() {
  const eid = `v12-l4b-${randomUUID()}`;
  await postSettings(eid, {
    familyAlertsEnabled: true,
    allowedNotificationChannels: { app: true },
    reminderTiers: { L1: true, L2: true, L3: true, L4: false },
    emergencyContactMode: false,
  });
  const chat = await postChat(eid, "我不想活了");
  if (!chat.ok) return fail("l4_block", `chat HTTP ${chat.status}`);
  if (chat.json?.meta?.risk?.level !== "L4") {
    return fail("l4_block", `expected chat risk L4 for 我不想活了 got ${chat.json?.meta?.risk?.level}`);
  }
  await sleep(400);
  const { json } = await getJson(`/api/child/notifications?elderUserId=${eid}`);
  const list = json.notifications ?? [];
  if (hasUrgentTitle(list)) return fail("l4_block", "L4 family notification should be blocked when L4 tier off and no emergency override");
  pass("l4_block", "L4 tier disabled + no emergency → no 紧急 reminder row");
}

async function sectionL4AllowedWithEmergencyOverride() {
  const eid = `v12-l4o-${randomUUID()}`;
  await postSettings(eid, {
    familyAlertsEnabled: true,
    allowedNotificationChannels: { app: true },
    reminderTiers: { L1: true, L2: true, L3: true, L4: false },
    emergencyContactMode: true,
    emergencyContact: { name: "儿子", phone: "13800000000" },
  });
  const chat = await postChat(eid, "我真不想活了");
  if (!chat.ok) return fail("l4_override", `chat HTTP ${chat.status}`);
  await sleep(400);
  const { json } = await getJson(`/api/child/notifications?elderUserId=${eid}`);
  const list = json.notifications ?? [];
  if (!hasUrgentTitle(list)) return fail("l4_override", "L4 should still notify when emergency override is on");
  pass("l4_override", "L4 tier off + emergency mode → 紧急 reminder present");
}

async function sectionL3RespectsTierOff() {
  const eid = `v12-l3-${randomUUID()}`;
  await postSettings(eid, {
    familyAlertsEnabled: true,
    reminderTiers: { L1: true, L2: true, L3: false, L4: true },
  });
  const chat = await postChat(eid, "活着没意思了");
  if (!chat.ok) return fail("l3_consent", `chat HTTP ${chat.status}`);
  if (chat.json?.meta?.risk?.level !== "L3") {
    return fail("l3_consent", `expected L3 for 活着没意思了 got ${chat.json?.meta?.risk?.level}`);
  }
  await sleep(400);
  const { json } = await getJson(`/api/child/notifications?elderUserId=${eid}`);
  const list = json.notifications ?? [];
  if (hasL3RiskTitle(list)) return fail("l3_consent", "L3 risk notification should be blocked when L3 tier off");
  pass("l3_consent", "L3 tier off → no 需要关注 family row");
}

async function sectionAllAlertsOffBlocks() {
  const eid = `v12-off-${randomUUID()}`;
  await postSettings(eid, {
    familyAlertsEnabled: false,
    reminderTiers: { L1: true, L2: true, L3: true, L4: true },
    emergencyContactMode: true,
    emergencyContact: { phone: "13900000000" },
  });
  await postChat(eid, "我不想活了");
  await sleep(400);
  const { json } = await getJson(`/api/child/notifications?elderUserId=${eid}`);
  if (hasUrgentTitle(json.notifications ?? [])) return fail("master_off", "familyAlertsEnabled false should block L4");
  pass("master_off", "familyAlertsEnabled false → no urgent row");
}

async function sectionAppChannelOffBlocks() {
  const eid = `v12-app-${randomUUID()}`;
  await postSettings(eid, {
    familyAlertsEnabled: true,
    allowedNotificationChannels: { app: false, push: false, sms: false, email: false },
    reminderTiers: { L1: true, L2: true, L3: true, L4: true },
    emergencyContactMode: true,
    emergencyContact: { phone: "13700000000" },
  });
  await postChat(eid, "我不想活了");
  await sleep(400);
  const { json } = await getJson(`/api/child/notifications?elderUserId=${eid}`);
  if (hasUrgentTitle(json.notifications ?? [])) return fail("app_off", "app channel disabled should block in-app family row");
  pass("app_off", "allowedNotificationChannels.app false → no urgent row");
}

async function sectionInactiveContactsBlock() {
  const eid = `v12-act-${randomUUID()}`;
  await postSettings(eid, {
    familyAlertsEnabled: true,
    allowedNotificationChannels: { app: true },
    reminderTiers: { L1: true, L2: true, L3: true, L4: true },
    emergencyContactMode: true,
    emergencyContact: { phone: "13600000000" },
    contacts: [
      {
        id: "c1",
        name: "Amy",
        relationship: "女儿",
        priority: 1,
        active: false,
      },
    ],
  });
  await postChat(eid, "我不想活了");
  await sleep(400);
  const { json } = await getJson(`/api/child/notifications?elderUserId=${eid}`);
  if (hasUrgentTitle(json.notifications ?? [])) return fail("contacts", "all contacts inactive should block notification");
  pass("contacts", "only inactive contacts → no urgent row");
}

function runChainedRegression() {
  if (process.env.QA_RUN_CHAINED_REGRESSION !== "1") {
    console.log("\n[info] Set QA_RUN_CHAINED_REGRESSION=1 to also run v7 / v7.1 / v11 tone / v11 host scripts.");
    return;
  }
  const scripts = [
    "qa-v7-first-response.mjs",
    "qa-v7.1-family-state-regression.mjs",
    "qa-v11-tone-watchpoints.mjs",
    "qa-v11-host-sanity.mjs",
  ];
  for (const name of scripts) {
    const r = spawnSync(process.execPath, [join(root, "scripts", name)], {
      cwd: root,
      env: { ...process.env },
      stdio: "inherit",
    });
    if (r.status !== 0) {
      console.error(`[FAIL] chained ${name} exit ${r.status}`);
      process.exit(1);
    }
  }
  console.log("\n[PASS] chained regression scripts completed.");
}

async function main() {
  console.log(`AnYu V1.2 notification + consent — ${baseUrl}\n`);
  await sectionPrivacyDashboard();
  await sectionNotificationTone();
  await sectionSettingsRoundtrip();
  await sectionL4BlockedWithoutEmergency();
  await sectionL4AllowedWithEmergencyOverride();
  await sectionL3RespectsTierOff();
  await sectionAllAlertsOffBlocks();
  await sectionAppChannelOffBlocks();
  await sectionInactiveContactsBlock();

  console.log(`\nV1.2 consent summary: failed=${failed}`);
  if (failed) process.exit(1);

  runChainedRegression();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
