# AnYu V1.2 — Implementation handoff (for Wisewave)

**Purpose**: Single document you can forward to Wisewave engineering / product. It describes **what is implemented in repo + host**, how it behaves, how to verify it, and what is **explicitly out of scope** or still on the **Child Web integration** track.

**Baseline (Lumen host sign-off)**: `main` @ **`7dc16a5`** (Priority E QA + chain); documentation of Lumen’s host run @ **`27a85e7`**.  
**Primary host used for QA**: `https://anyu-cn-website.vercel.app`

**Related Nova specs (repo)**:

- `docs/anyu/Nova_V1.2_Notification_Consent_Wisewave.md` — notification, consent, audit, privacy, QA (Priorities A–E).
- `docs/anyu/Nova_V1.2_Child_Web_Integration_Closure_Wisewave.md` — elder id unification, access guard, CTA, memory, settings, timezone (separate delivery thread).
- `docs/anyu/Lumen_QA_V1.2_Sync_Notes.md` — Lumen verification log, QA API, Priority E checklist.

---

## 1. Executive summary

V1.2 on the **notification + consent + audit** line delivers:

1. **Consent before any in-app family notification** (`FamilyNotification` row): settings are the source of truth; blocks are auditable.
2. **Placeholder multi-channel dispatch** (email / SMS / push): no real sends without future transport wiring; every path writes an audit row.
3. **Unified delivery audit table** (`NotificationDeliveryAttempt`) for app success, stub external channels, and consent blocks.
4. **Privacy hardening (Priority D)** for family-facing payloads and curated child API surfaces tied to summaries / notifications.
5. **Automated QA (Priority E)** including light-reminder daily cap, L3 six-hour dedupe, consent matrix, tone heuristics, dashboard leak scan, and optional **full chain** (`qa:v12:close`) with V7 / V7.1 / V11 scripts.

**Non-substitution and curated child UX** remain as in V1.1 Spec: the system does not replace relatives; copy stays gentle and non–guilt-tripping.

---

## 2. End-to-end data flow (implemented)

```text
POST /api/elder-chat/message
  → risk evaluate (L0–L4)
  → extractConversationSignal (curated memory labels; no raw verbatim in memoryCandidate)
  → saveConversationSignal (ConversationSignal, DailySummary upsert, MemoryCard if applicable)
  → appendFamilyNotificationIfEligible
       → read ChildSettings (JSON in ChildSettings table)
       → evaluateFamilyNotificationConsent(kind)
       → if blocked: FamilyNotificationConsentBlock + NotificationDeliveryAttempt (blocked_by_consent)
       → if allowed: INSERT FamilyNotification + NotificationDeliveryAttempt (app, sent)
                      + dispatchExternalNotificationChannels → 3× NotificationDeliveryAttempt (email/sms/push stubs)
```

**Child reads**: `GET /api/child/notifications`, dashboard, daily, etc. read persisted rows; notification title/body are normalized on read/write per Priority D.

---

## 3. Priority A — Consent enforcement (implemented)

**Behavior**

| Check | Effect if failed |
|--------|------------------|
| `familyAlertsEnabled !== false` (omit = on) | Block |
| `allowedNotificationChannels.app !== false` | Block |
| At least one contact **active** when contacts exist (`active !== false`) | Block |
| `reminderTiers.L1` … `L4` vs notification **intent kind** | Block with machine `reason` |
| **L4 special case**: `emergencyContactMode === true` **or** non-empty `emergencyContact.phone` | **Overrides** `reminderTiers.L4 === false` (L4 cannot be fully silenced in that configuration). |

**Artifacts**

- **Allow path**: `FamilyNotification` row + successful audit rows (see §5).
- **Deny path**: `FamilyNotificationConsentBlock` + `NotificationDeliveryAttempt` with `status = blocked_by_consent` (and app channel in audit for reconciliation).

**Primary code**

- `lib/child-insights/consentGate.ts` — `evaluateFamilyNotificationConsent`, `buildConsentSnapshot`, intent kinds: `L4_emergency` | `L3_risk` | `watch` | `light`.
- `lib/child-insights/familyNotifications.ts` — `appendFamilyNotificationIfEligible`.
- `lib/child-insights/notificationConsentAudit.ts` — `logFamilyNotificationConsentBlock`.
- `lib/child-insights/childSettingsRepository.ts` — load/save JSON payload.
- `app/api/child/settings` — POST/GET settings.
- UI: `/cn/child/consent` (`ConsentForm`), contacts at `/cn/child/contacts`.

---

## 4. Priority B — Channel stubs (implemented)

**Design**

- **In-app** delivery = `FamilyNotification` (unchanged consumer model).
- **email / sms / push**: `lib/notify/channelAdapters.ts` returns structured results; **no SMTP / carrier / FCM** in v1.2.

**Environment gates (must be set to “intent to wire later”; still no real send)**

| Variable | Meaning |
|----------|---------|
| `ANYU_NOTIFY_EMAIL_ENABLED` | Any non-empty → adapter still returns stub “not implemented v1.2”. |
| `ANYU_NOTIFY_SMS_ENABLED` | Same. |
| `ANYU_NOTIFY_PUSH_ENABLED` | Same. |

If unset: `skipped_no_channel` with reason `ANYU_NOTIFY_*_ENABLED unset`. If channel toggled off in settings: `*_channel_disabled_in_settings`.

**Primary code**

- `lib/notify/types.ts` — result statuses: `sent` | `failed` | `skipped_no_channel` | `blocked_by_consent`.
- `lib/notify/externalChannelDispatch.ts` — post–`FamilyNotification` insert, one attempt row per external channel.

---

## 5. Priority C — Audit trail (implemented)

**Table**: `NotificationDeliveryAttempt` (created in `ensureChildTables` alongside existing child tables).

**Typical rows per successful in-app notification**

1. `channel = app`, `status = sent`, `familyNotificationId` set, `sentAt` set, `consentSnapshot` JSON.
2. `channel ∈ {email,sms,push}` — stub outcome as in §4.

**Consent block**

- Still writes `FamilyNotificationConsentBlock`.
- **Also** inserts `NotificationDeliveryAttempt` with `status = blocked_by_consent`, `familyNotificationId` null, so success and deny paths share one table for ops review.

**Primary code**

- `lib/child-insights/notificationDeliveryAudit.ts` — `insertNotificationDeliveryAttempt`, `queryNotificationDeliveryAttempts` (parameterized read).

**QA read API**

- `GET /api/child/qa/delivery-attempts?elderUserId=…&limit=…`  
- Header: `x-anyu-qa-secret` must equal server `ANYU_QA_SECRET` (trimmed). If secret unset or mismatch → **404** (empty body).  
- Intended for Lumen / internal QA only; do not expose secret to browsers.

---

## 6. Priority D — Privacy (implemented)

**Policy (Nova)**

- **Not allowed** in family notification payloads by default: full user verbatim, full assistant text, session id, raw chat dumps.
- **Allowed**: short status-style copy, risk context, gentle suggested actions, timestamps — aligned with curated child principles.

**Mechanisms**

- `lib/child-insights/notificationPayloadPrivacy.ts` — normalize/strip UUID-like tokens, forbidden key names, length caps; sanitize parent display name used in templates.
- Applied on **write** in `appendFamilyNotificationIfEligible` (including consent-block intended copy) and on **read** in `getNotifications`; QA delivery endpoint normalizes `intendedTitle` / `intendedMessage` in JSON.
- `lib/child-insights/signalExtractor.ts` — `memoryCandidate` is **fixed short curated phrases** only (no elder text slices).
- `lib/child-insights/repository.ts` — dashboard `summary` / daily `keyMessages` scrub; memory dashboard teaser uses `curatedMemoryDashboardExcerpt`.

---

## 7. Notification product logic (implemented)

Implemented in `appendFamilyNotificationIfEligible` (`lib/child-insights/familyNotifications.ts`):

| Risk / signal context | DB `level` | Title (typical) | Dedupe / cap |
|------------------------|------------|-----------------|--------------|
| `highestRisk === L4` | `risk` | 紧急提醒 | Immediate; consent rules apply. |
| `highestRisk === L3` | `risk` | 需要关注 | At most **one** `risk`-level notification per **6 hours** per elder (`countNotificationsSince` on `level = risk`). |
| Lonely + family signals both strong | `watch` | 关注提醒 | At most **one** `watch` per **UTC calendar day**. |
| Family mentions ≥2, lonely &lt;2 | `light` | 轻提醒（想你） | With global **light** cap below. |
| Lonely turns ≥2 (and not the combined branch above) | `light` | 轻提醒（孤单） | **Max 2** `light` notifications per **UTC calendar day** per elder (`lightToday >= 2` early exit). |

Copy strings are template-based (plus sanitized parent label); they do not embed chat transcripts.

---

## 8. Priority E — QA automation & Lumen host close (implemented)

**Scripts**

| Command | What it runs |
|---------|----------------|
| `npm run qa:v12` | `scripts/qa-v12-notification-consent.mjs` — HTTP black-box against `QA_BASE_URL`. |
| `npm run qa:v12:close` | Same script with `QA_RUN_CHAINED_REGRESSION=1`, then: `qa-v7-first-response.mjs` → `qa-v7.1-family-state-regression.mjs` → `qa-v11-tone-watchpoints.mjs` → `qa-v11-host-sanity.mjs`. |

**v12 sections (representative)**

- Dashboard JSON leak pattern scan (no `assistant_message` / `session_id` / etc.).
- Notification list guilt-trip heuristic.
- Priority D: parent display name embedding UUID must not appear in notification payload.
- Settings round-trip (`familyAlertsEnabled`).
- L4 blocked without emergency; L4 allowed with emergency override; L3 tier off; master switch off; app channel off; all contacts inactive.
- **light_cap**: five low-risk lonely turns → exactly **two** light「轻提醒」rows (third+ blocked for the day).
- **l3_dedupe**: two L3 phrases in sequence → **at most one**「需要关注」row within the dedupe window.

**Lumen judgment (2026-04-30, real host)**

- `npm run qa:v12` → `failed=0`.
- `npm run qa:v12:close` → chained scripts all pass.  
- Recorded in `docs/anyu/Lumen_QA_V1.2_Sync_Notes.md` under **「Priority E 收口」**.

---

## 9. Persistence layer (SQL, runtime)

Child-side tables are ensured at runtime via `ensureChildTables()` in `lib/child-insights/repository.ts` (raw SQL, Postgres-oriented), including:

- `ConversationSignal`, `DailySummary`, `MemoryCard`, `FamilyNotification` (+ `contactedAt` migration),
- `FamilyNotificationConsentBlock`,
- `ChildSettings` (in `childSettingsRepository`),
- `NotificationDeliveryAttempt`.

Prisma models may mirror some entities for typing; **authoritative creation** for these flows is the ensure-tables path used by chat + child APIs.

**Database URL**: as configured for the deployment (`DATABASE_URL` / `ANYU_CHAT_DATABASE_URL` per project convention).

---

## 10. Child API surface (reference)

| Route | Role |
|-------|------|
| `GET/POST /api/child/settings` | Consent + contacts payload. |
| `GET /api/child/dashboard` | Curated dashboard card. |
| `GET /api/child/daily` | Daily insight (scrubbed key messages). |
| `GET/POST /api/child/notifications` | List + mark read / contacted. |
| `GET /api/child/qa/delivery-attempts` | QA-only delivery audit read (secret-gated). |

---

## 11. Explicitly deferred / not in this V1.2 line

Aligned with Nova + Lumen notes:

- **Real** SMTP / SMS / push sends and carrier/FCM credentials.
- **`contactId`** selection on delivery attempts (currently null in stub path).
- **Deep audit assertions** (exact row counts per channel in CI) — optional follow-up; QA API supports manual inspection.
- **Child Web integration closure** items (separate Nova doc): unified `NEXT_PUBLIC_CHILD_DEMO_ELDER_ID` / demo elder id across lamp + child + API default, demo access key / binding layer, CTA `tel:`/`sms:` wiring, memory save buttons, settings aggregation, L1–L4 UI mapping refinement, Beijing calendar semantics — **not claimed as done in this handoff** unless separately implemented and signed off.

---

## 12. How Wisewave can re-verify quickly

```bash
git pull origin main
# ensure production-like env + DB for the host or local Next

export QA_BASE_URL=https://anyu-cn-website.vercel.app   # or local URL
npm run qa:v12
npm run qa:v12:close
```

Expect **`failed=0`** for both commands when the server and DB match the signed configuration.

---

## 13. Commit pointers (non-exhaustive)

Wisewave can trace implementation via git log around:

- Consent + v12 introduction: **`5c50b75`** (historical; see repo log).
- Priority B/C delivery audit: **`a3367d8`** (per Lumen sync notes).
- Priority D privacy: commits on `notificationPayloadPrivacy.ts` + `signalExtractor` curated labels.
- Priority E automation + `qa:v12:close`: **`7dc16a5`**.
- Lumen doc record: **`27a85e7`**.

---

*This handoff is a synthesis for external forwarding; if anything disagrees with code, **code wins**. Update this file when shipping materially changes behavior.*
