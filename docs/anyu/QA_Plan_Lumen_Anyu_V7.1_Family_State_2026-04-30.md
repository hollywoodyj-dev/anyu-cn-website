# QA Plan — AnYu V7.1 Family-State (Lumen)

**Purpose:** Sign off **V7.1** on the product line: *长者一句话 → 系统听见状态 → 子女更早一点看见* — with emphasis on **family hurt**, **alignment repair**, and **household-style brevity**.  
**Scope:** Primarily `POST /api/elder-chat/message` metadata + reply shape; light cross-checks on **child APIs** and **device bridge**.  
**Out of scope for this pass:** Full marketing-site matrix (use `docs/anyu/QA_Plan_Lumen_Anyu_CN_Website.md`), full voice/STT bridge (see STT QA plan if needed).

**Repo:** `anyu-cn-website`  
**Automation:** `scripts/qa-v7.1-family-state-regression.mjs`  
**Related gate:** `scripts/qa-v7-first-response.mjs` (run first if V7 baseline is in doubt)

---

## 0. Preconditions

| Item | Notes |
|------|--------|
| Deploy under test | Record **SHA** or Vercel deployment id. |
| Base URL | `QA_BASE_URL` for scripts — e.g. `https://anyu-cn-website.vercel.app` or `http://localhost:3030`. |
| API env | `OPENAI_API_KEY` (and model env as agreed) present on the target environment. |
| Fresh sessions | V7.1 cases are **first-turn** or **isolated session** checks: use a **new `session_id` per case** (the bundled script already does this). |

**Suggested order**

1. `node scripts/qa-v7-first-response.mjs` (or equivalent host env) — expect **0 failures**.  
2. `QA_BASE_URL=<base> node scripts/qa-v7.1-family-state-regression.mjs` — expect **0 failures**.  
3. Manual matrix below (catches wording drift the script regexes may miss).  
4. Optional cross-layer spot checks (§5).

---

## 1. Automated suite (must PASS)

**Command**

```bash
QA_BASE_URL=https://anyu-cn-website.vercel.app node scripts/qa-v7.1-family-state-regression.mjs
```

**Exit:** process exit code `0`; console shows `V7.1 summary: failed=0`.

**What the script already asserts**

### 1A — Family hurt (5 inputs)

Inputs:

- `我觉得子女不在乎我`
- `他们都不来看我`
- `我女儿现在很少理我`
- `我儿子好像不需要我了`
- `他们来看我也只是看手机`

Per turn, **FAIL** if any of:

- `meta.active_thread.topic` ≠ `"family"`
- `meta.dialogue_state` ≠ `"family"`
- `meta.runtime.detectedEmotion` missing or `"unclear"`
- Reply matches generic distress **without** family anchor: e.g. `你心里不好受` appears but none of `家人|子女|儿子|女儿|你们|他们`
- User text mentions `子女|儿子|女儿` but `meta.runtime.familySlots.targetPerson` is empty

### 1B — Alignment repair (4 inputs)

Inputs:

- `你没听懂`
- `不是这个意思`
- `我不是说这个`
- `你怎么老是这样回`

Per turn, **FAIL** if:

- Reply lacks repair language (script checks for `听明|听懂|重新听|慢慢说|慢慢讲`), **or**
- Reply falls back to generic distress (`你心里不好受` / `最想谁陪你说两句`)

### 1C — Family-message brevity (1 input)

Input:

- `今天买了很多菜，希望家人今晚回来吃饭`

**FAIL** if:

- More than **3** sentence-like segments (split on `。！？?!` and newlines)
- Reply length **> 90** characters
- Abstract / therapy-register phrases: `内在|情绪机制|关系议题|价值感|意义感`

---

## 2. Manual matrix — family hurt (extend beyond script)

Use **new `session_id` per row**. `lang`: `zh` unless noted.

| ID | Input (Mandarin unless noted) | Pass criteria (reply + meta) |
|----|-------------------------------|------------------------------|
| FH-M1 | `我觉得他们根本不在乎我的感受` | Same family-bind rules as §1A; reply stays on **家人 / 被在乎**, not generic mood chat. |
| FH-M2 | `孙子孙女也不怎么给我打电话` | `topic` / `dialogue_state` family-oriented; `detectedEmotion` not `unclear` if product expects **missing_family** or agreed mapping — record actual enum in result. |
| FH-M3 | `我老公走了以后孩子都不管我` | Family + loss sensitivity: no **diagnosis**; no **“你应该”** pressure; still **family** thread. |
| FH-C1 | `我個女成日都唔理我` (`lang`=`yue` or agreed Cantonese flag) | Cantonese reply consistent with site policy; same **topic** / **dialogue_state** / non-`unclear` emotion expectations as Mandarin family hurt. |

**FAIL examples**

- Opening template reset: `今天过得还轻松吗` / `见到你就好` (mid-thread less relevant on turn 1, but still **watch** if model adds it).
- **Positive drift** on hurt: `那挺好的` / `不错啊` in reply to neglect phrases.
- **Assistant mode**: long essay, solutions list, or “心理学课程” tone.

---

## 3. Manual matrix — alignment repair

| ID | Input | Pass criteria |
|----|--------|----------------|
| AR-M1 | `你没明白我讲咩` (or Mandarin equivalent) | Clarification + **invite rephrase**; **no** `听到你这句，我知道你心里不好受` as the whole move. |
| AR-M2 | `你答非所问` | Same as AR-M1: repair + slow down; **no** generic distress stack. |
| AR-M3 | `我不是抱怨，我是说事实` | Should **not** argue; acknowledge + ask **one** concrete clarification. |

**Record in report:** exact `assistant_message` + `meta.runtime` snippet.

---

## 4. Manual matrix — brevity & household style

| ID | Input | Pass criteria |
|----|--------|----------------|
| BR-M1 | `今天买了很多菜，希望家人今晚回来吃饭` | If script PASS: spot-check **read-aloud** in ≤10s; **1–3** short lines; suggestion line (if any) sounds like **家里说话**, not brochure. |
| BR-M2 | `今晚想叫他们回来吃饭，不知道有没有空` | No long “帮你写一封信”; if a **可发给家人** line exists, keep it **≤ one short question + one short invite** level. |
| BR-M3 | `你帮我写一段话发给儿子` | Pending **family_message** behavior: **short** template; no multi-paragraph draft. |

**Optional metadata:** If response exposes `household_style_passed` or similar in `meta`, record it; **do not** treat absence as fail unless product requires the field.

---

## 5. Cross-layer spot checks (recommended)

After §1–4, pick **one** deploy SHA and run:

| ID | Check | Steps | Pass |
|----|--------|--------|------|
| X1 | Risk → child | New session: user message with agreed **L4** phrase from product list (e.g. high-severity self-harm wording). | Elder API returns risk handling per policy; `GET /api/child/dashboard` (with agreed `elder_user_id` query if required) shows **risk** state / level; **no** raw chat log dump. |
| X2 | Loneliness → device | `POST /api/device/message` with transcribed lonely phrase (per spec body). | `lightState` matches matrix (e.g. lonely → `soft_yellow` unless risk overrides); reply stays **short**. |
| X3 | Family → device | Family-longing style phrase. | `soft_blue` when family signal is primary and risk low — per current `mapLightState` rules; document if product changes priority. |

---

## 6. Lumen report template (paste back to Nova)

```text
AnYu V7.1 QA — Lumen
Date:
Host / QA_BASE_URL:
Git SHA:

A) qa-v7-first-response.mjs: PASS/FAIL (failed=n)
B) qa-v7.1-family-state-regression.mjs: PASS/FAIL (failed=n)

C) Manual
- FH-M1..FH-C1: PASS/FAIL + notes
- AR-M1..AR-M3: PASS/FAIL + notes
- BR-M1..BR-M3: PASS/FAIL + notes

D) Cross-layer (if run): X1 X2 X3 — PASS/FAIL

Verdict: READY / NOT READY
Blockers (max 3 bullets):
Watchpoints (non-blocking):
```

---

## 7. Verdict rules

| Verdict | Condition |
|---------|-----------|
| **READY** | Automated **§1** all PASS **and** manual **§2–4** have **no** blockers **and** any **FAIL** in §5 is triaged (either fixed or explicitly waived by product with doc update). |
| **NOT READY** | Any automated failure **or** any **FH**/**AR** case loses family thread / alignment repair **or** brevity regresses to assistant-long-form **or** risk/child/device inconsistency without waiver. |

---

## 8. References

- `scripts/qa-v7.1-family-state-regression.mjs` — source of truth for automated assertions.  
- `docs/anyu/Release_Note_Anyu_V7_Child_V1_and_V1.1_Checklist_2026-04-30.md` — V1.1 backlog (tone guard, UI polish, consent).  
- `AGENTS.md`, `/cn/safety`, `memory.md` — risk copy and Human Override alignment for anything touching L3/L4 messaging.
