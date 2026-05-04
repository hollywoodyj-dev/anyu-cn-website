/**
 * AnYu V1.2 — Notification consent + Priority D/E QA (Nova / Lumen).
 *
 *   QA_BASE_URL=http://localhost:3000 npm run qa:v12
 *
 * Priority E — full close (v12 + chained v7 / v7.1 / v11 tone / v11 host):
 *   QA_BASE_URL=http://localhost:3000 npm run qa:v12:close
 *
 * Or set env manually:
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

const uuidInPayloadRe =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;

function priorityDLeakInNotifications(list) {
  const leakKeys = /assistant_message|user_message|session_id|sessionId|ConversationSignal|rawText|聊天记录/i;
  for (const n of list) {
    const t = `${n.title ?? ""}${n.message ?? ""}`;
    if (leakKeys.test(t)) return `forbidden:${t.slice(0, 120)}`;
    if (uuidInPayloadRe.test(t)) return `uuid:${t.slice(0, 120)}`;
  }
  return null;
}

async function sectionPriorityDNotificationPayload() {
  const eid = `v12-d-${randomUUID()}`;
  const ghostId = randomUUID();
  await postSettings(eid, {
    parentDisplayName: `奶奶${ghostId}`,
    familyAlertsEnabled: true,
    allowedNotificationChannels: { app: true },
    reminderTiers: { L1: true, L2: true, L3: true, L4: true },
    emergencyContactMode: true,
    emergencyContact: { phone: "13500000000" },
  });
  const chat = await postChat(eid, "我不想活了");
  if (!chat.ok) return fail("pri_d", `chat HTTP ${chat.status}`);
  await sleep(400);
  const { json } = await getJson(`/api/child/notifications?elderUserId=${eid}`);
  const list = json.notifications ?? [];
  const bad = priorityDLeakInNotifications(list);
  if (bad) return fail("pri_d", bad);
  if (!list.some((n) => /紧急/.test(n.title ?? ""))) return fail("pri_d", "expected L4 row for Priority D scenario");
  pass("pri_d", "notification payload has no UUID / transcript markers (Priority D)");
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

function countLightReminders(list) {
  return list.filter((n) => n.level === "light" && /轻提醒/.test(n.title ?? "")).length;
}

function countL3RiskNotifications(list) {
  return list.filter((n) => n.level === "risk" && /需要关注/.test(n.title ?? "")).length;
}

/**
 * `appendFamilyNotificationIfEligible`: max 2 `level=light` rows per UTC calendar day
 * once `lonelyTurnsToday >= 2` / family path is active (`lightToday >= 2` early return).
 */
async function sectionLightReminderDailyCap() {
  const eid = `v12-cap-${randomUUID()}`;
  await postSettings(eid, {
    familyAlertsEnabled: true,
    allowedNotificationChannels: { app: true },
    reminderTiers: { L1: true, L2: true, L3: true, L4: true },
    contacts: [{ id: "c1", name: "Ada", relationship: "女儿", priority: 1, active: true }],
  });
  const lonelySafe = [
    "我好孤单",
    "一个人好寂寞",
    "夜里好冷清",
    "没人陪我说说话",
    "心里特别寂寞",
  ];
  for (const msg of lonelySafe) {
    const c = await postChat(eid, msg);
    if (!c.ok) return fail("light_cap", `chat HTTP ${c.status} for ${msg}`);
    const lvl = c.json?.meta?.risk?.level;
    if (lvl === "L3" || lvl === "L4") {
      return fail("light_cap", `unexpected ${lvl} for light-cap phrase (stay L0–L2): ${msg}`);
    }
    await sleep(550);
  }
  const { json } = await getJson(`/api/child/notifications?elderUserId=${eid}`);
  const list = json.notifications ?? [];
  const lights = countLightReminders(list);
  if (lights > 2) {
    return fail("light_cap", `expected at most 2 light 轻提醒 rows per UTC day, got ${lights}`);
  }
  if (lights !== 2) {
    return fail("light_cap", `expected exactly 2 light rows after 5 lonely turns (2 insert + cap), got ${lights}`);
  }
  pass("light_cap", "lonely-only path: at most 2 light reminders per day (cap enforced)");
}

/** Two L3 chats within 6h → single `需要关注` risk row (`recentRisk` dedupe in familyNotifications). */
async function sectionL3DedupeSixHourWindow() {
  const eid = `v12-l3d-${randomUUID()}`;
  await postSettings(eid, {
    familyAlertsEnabled: true,
    allowedNotificationChannels: { app: true },
    reminderTiers: { L1: true, L2: true, L3: true, L4: true },
    emergencyContactMode: true,
    emergencyContact: { phone: "13300000007" },
    contacts: [{ id: "c1", name: "Ben", relationship: "儿子", priority: 1, active: true }],
  });
  const c1 = await postChat(eid, "活着没意思了");
  if (!c1.ok) return fail("l3_dedupe", `chat1 HTTP ${c1.status}`);
  if (c1.json?.meta?.risk?.level !== "L3") {
    return fail("l3_dedupe", `chat1 expected L3, got ${c1.json?.meta?.risk?.level}`);
  }
  await sleep(550);
  const c2 = await postChat(eid, "我撑不下去了");
  if (!c2.ok) return fail("l3_dedupe", `chat2 HTTP ${c2.status}`);
  if (c2.json?.meta?.risk?.level !== "L3") {
    return fail("l3_dedupe", `chat2 expected L3, got ${c2.json?.meta?.risk?.level}`);
  }
  await sleep(550);
  const { json } = await getJson(`/api/child/notifications?elderUserId=${eid}`);
  const list = json.notifications ?? [];
  const n = countL3RiskNotifications(list);
  if (n > 1) return fail("l3_dedupe", `expected at most one 需要关注 row within 6h window, got ${n}`);
  if (n < 1) return fail("l3_dedupe", "expected one L3 risk row after first L3 trigger");
  pass("l3_dedupe", "two L3 chats within 6h → single 需要关注 family notification");
}

function runChainedRegression() {
  if (process.env.QA_RUN_CHAINED_REGRESSION !== "1") {
    console.log("\n[info] Priority E: run `npm run qa:v12:close` (or QA_RUN_CHAINED_REGRESSION=1) to chain v7 / v7.1 / v11 tone / v11 host.");
    return;
  }
  const scripts = [
    "qa-v7-first-response.mjs",
    "qa-v7.1-family-state-regression.mjs",
    "qa-v11-tone-watchpoints.mjs",
    "qa-v11-host-sanity.mjs",
  ];
  console.log("\n[Priority E] Chained regression — v7 → v7.1 → v11 tone → v11 host (same QA_BASE_URL)\n");
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
    console.log(`[PASS] chained ${name}`);
  }
  console.log("\n[PASS] Priority E chained regression completed (all four scripts).");
}

async function main() {
  console.log(`AnYu V1.2 notification + consent — ${baseUrl}\n`);
  await sectionPrivacyDashboard();
  await sectionNotificationTone();
  await sectionPriorityDNotificationPayload();
  await sectionSettingsRoundtrip();
  await sectionL4BlockedWithoutEmergency();
  await sectionL4AllowedWithEmergencyOverride();
  await sectionL3RespectsTierOff();
  await sectionAllAlertsOffBlocks();
  await sectionAppChannelOffBlocks();
  await sectionInactiveContactsBlock();
  await sectionLightReminderDailyCap();
  await sectionL3DedupeSixHourWindow();

  console.log(`\nV1.2 consent + Priority E (light cap, L3 dedupe) summary: failed=${failed}`);
  if (failed) process.exit(1);

  runChainedRegression();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
