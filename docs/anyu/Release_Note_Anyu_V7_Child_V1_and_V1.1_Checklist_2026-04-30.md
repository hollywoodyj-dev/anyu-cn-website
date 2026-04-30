# Release Note — AnYu V7 + Child App V1 · V1.1 Backlog

Date: 2026-04-30  
Project: `anyu-cn-website`  
Reference host: `https://anyu-cn-website.vercel.app` (verify current deploy before external signoff)

---

## One-line positioning (V7)

AnYu on the elder side is **not** an open chat assistant. It is an **expression entry + light companion reply**, with structured state surfaced for family on the **child dashboard** — without shipping full transcripts.

---

## What shipped (V7 + Child V1)

### Elder conversation (`/api/elder-chat/message`)

- **Architecture**: Model-led replies for ordinary L0–L2 turns; deterministic layers for risk (L3/L4), ethics, repetition, privacy, and family-alert–style signaling.
- **V7 tightening**: No long tutorials, joke bots, or “smart speaker” flows; practical asks get a **light hold** and redirect toward **family connection / today’s state** where appropriate.
- **First-response quality**: Distress receives acknowledgment without positive drift; **alignment repair** (e.g. misunderstood intent) gets clarification wording, not generic soothing; **family-hurt** inputs bind to **family** state and preserve family framing in replies.
- **Context binding**: Pending task handling remains focused on **family message** flows; guards reduce greeting resets mid-thread and irrelevant topic jumps.
- **Child-side signals**: Conversation signals persist with `elder_user_id`, including paths where the reply is risk-blocked, so dashboards and notifications stay consistent with Risk Engine outcomes.

### Child App V1 (API + minimal UI)

- **APIs**: `GET/POST`-style retrieval and updates under `app/api/child/` — dashboard, daily insight, memory (list + save), notifications (list + mark read).
- **Pages**: Starter routes under `app/cn/child/` for dashboard, daily, trend, memory, notifications (V1 scaffolding; polish deferred to V1.1).
- **Persistence**: `lib/child-insights/` types, extraction, and repository; tables created defensively alongside Prisma schema (repository uses raw SQL for resilience).

### Device bridge (`/api/device/message`)

- Short text reply plus **`lightState`** mapping from risk + family/loneliness-style signals (`warm_white`, `soft_yellow`, `soft_blue`, `orange_red` per Nova V1 spec).
- Logic avoids letting **stale session context** override **current-turn loneliness** unless risk is elevated.

### Risk phrases

- Broader coverage for critical phrases feeding L3/L4 and downstream child/device surfaces (keep in sync with product safety docs).

### QA automation

- **`scripts/qa-v7-first-response.mjs`** — targeted first-response pass/fail checks.
- **`scripts/qa-v7.1-family-state-regression.mjs`** — family-hurt taxonomy, alignment repair, and household-style brevity regression (run before claiming family-state readiness).

---

## Host signoff snapshot (historical)

Lumen previously reported **READY** after:

- `qa-v7-first-response.mjs`: **6/6**
- Manual blockers: risk + child APIs + device light mapping aligned

Treat this as **time-stamped evidence**, not a permanent guarantee — re-run the two scripts on the **current** production revision after each deploy.

---

## V1.1 checklist (next sprint)

### 1) Tone-strength watchpoint (elder replies)

**Goal**: Keep **“接住”** from thinning into overly light acknowledgments on lonely first turns, without reintroducing template soup or diagnostic tone.

**Tasks**

- [ ] Define 3–5 **golden Mandarin + Cantonese** lonely-openers and lock expected minimum empathy markers (still one follow-up max).
- [ ] Add or extend an automated check (reuse `qa-v7-first-response.mjs` or a thin `qa-v7.2-tone.mjs`) that fails if lonely first replies drop below agreed strength.
- [ ] Log `meta`/guard outcomes for regressions (“too light” vs “blocked by repetition”) to avoid blind prompt churn.

### 2) Child dashboard UI polish

**Goal**: Reads in **under 10 seconds**; feels like **gentle situational awareness**, not surveillance.

**Tasks**

- [ ] Visual hierarchy: state lamp + one-line summary + single primary CTA; trends secondary.
- [ ] Typography and spacing aligned with site tokens (`app/globals.css` / `--anyu-*`).
- [ ] Loading and empty states that avoid alarmist copy.
- [ ] Smoke pass on `/cn/child/*` against live `GET /api/child/*` (no transcript leakage).

### 3) Consent, contacts, and risk-notification settings

**Goal**: Align runtime behavior with Nova’s consent matrix; make L3/L4 paths **explicit and unavoidable** where policy requires.

**Tasks**

- [ ] Persist consent flags (record state, child summary, risk notify, memory cards, emergency contact) and enforce in write paths.
- [ ] Wire **emergency contact** (or placeholder + validation) for L3/L4 surfaces; document what is simulated vs integrated in V1.1.
- [ ] Notifications: distinguish L1 vs L2 copy and channels per spec; ensure “strong” pushes do not contradict Non-Substitution copy on `/cn/safety`.
- [ ] Audit: blocked elder turn still emits curated child notification — ensure copy matches **curated excerpt** rules, not raw user text dumps.

---

## Release hygiene

- [ ] Tag release in git after V1.1 scope is agreed (`v7-child-v1` or similar).
- [ ] Attach script outputs + deploy SHA to internal signoff thread.
- [ ] Update `memory.md` when product or policy decisions change — not per every code push.
