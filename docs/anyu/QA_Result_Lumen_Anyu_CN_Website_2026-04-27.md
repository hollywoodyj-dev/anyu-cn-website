# QA result — 安语 AnYu 中文官网 + P0 对话 API（Lumen）

**Date:** 2026-04-27 00:42 Australia/Sydney  
**Scope:** W1–W5, C1–C3, E1–S2, A1–A7  
**Base URL:** `https://anyu-cn-website.vercel.app`

## Overall

**Result: PASS**  
Small watchpoint only: **W5 mobile layout was verified by implementation inspection rather than a full live viewport render pass** on this host.

---

## 0. Preconditions

| Item | Result | Notes |
|---|---|---|
| Local build | PASS | `npm run build` passed locally on `C:\github\anyu-cn-website`. |
| Env shape | PASS | API route expects server-side `OPENAI_API_KEY`; local altered-env tests confirmed missing-key and upstream-failure branches behave as intended. |
| Base URL | PASS | Deployed site and API both reachable on Vercel. |

---

## 1. Marketing site — routes & smoke

| ID | Result | Notes |
|---|---|---|
| W1 | PASS | `/` resolves to `/cn` via app redirect. |
| W2 | PASS | Header nav routes present in `app/cn/layout.tsx` and deployed pages resolved: `/cn`, `/cn/for-family`, `/cn/for-elder`, `/cn/safety`, `/cn/product`, `/cn/about`. |
| W3 | PASS | Footer links present and working: `/cn/ethics`, `/cn/disclaimer`, `/cn/safety`. |
| W4 | PASS | Logo wired via Next `Image`; source path `/anyu/F53449AC-4EA7-4F9C-94E4-B3A2D6B4EA30.jpeg`, alt text `安语`. |
| W5 | PASS (inspection) | Header/nav implementation uses `flex-wrap`, constrained logo width, and responsive text sizing in `app/cn/layout.tsx`; no obvious mobile-overlap risk found. |

---

## 2. Copy & tone

| ID | Result | Notes |
|---|---|---|
| C1 | PASS | `/cn`, `/cn/for-family`, `/cn/for-elder` stay warm, readable, low-jargon, and avoid obvious AI-product voice. |
| C2 | PASS | Non-Substitution stance is clear on `/cn` and `/cn/ethics`; no dependency language like “只有我懂你”. |
| C3 | PASS | `/cn/for-elder` is short, non-blaming, and surfaces `安全与预警` + `我们的原则` clearly in the safety notice block. |

---

## 3. Ethics / disclaimer / safety — consistency

| ID | Result | Notes |
|---|---|---|
| E1 | PASS | `/cn/ethics` includes five principles, data/privacy, elder protection, and cross-links. |
| E2 | PASS | `/cn/disclaimer` clearly states non-medical, non-emergency, non-substitution boundaries. |
| E3 | PASS | Disclaimer acknowledge UI works by implementation: unchecked state shows disabled text-only `进入首页`; checked state reveals actual link to `/cn`. |
| S1 | PASS | `/cn/safety` risk-tier language is aligned with expected escalation framing. |
| S2 | PASS | No contradiction found across `/cn/safety`, `/cn/disclaimer`, and `/cn/ethics` around emergency handling, human priority, or notification boundaries. |

---

## 4. API — `POST /api/elder-chat/message`

| ID | Result | Notes |
|---|---|---|
| A1 | PASS | Deploy returned HTTP `200` with `assistant_message`, `conversation_id`, `meta.model`, `meta.prompt_version`, `meta.turn_id`, `meta.timestamp`, `meta.lang`. |
| A2 | PASS | With `session_id: test-session-1`, response `conversation_id` echoed `test-session-1`. |
| A3 | PASS | Empty `message` returned HTTP `400` with `` `message` must be a non-empty string ``. |
| A4 | PASS | Malformed JSON returned HTTP `400` with `Invalid JSON body`. |
| A5 | PASS | Local production start on port `3015` with missing `OPENAI_API_KEY` returned HTTP `503` and safe config error message, no stack trace. |
| A6 | PASS | Local production start on port `3016` with invalid key/model returned HTTP `502`, short fallback `assistant_message`, and no fake success behavior. |
| A7 | PASS | No `OPENAI_API_KEY` or `sk-` token found in built client assets under `.next/static`; API response headers/body did not expose auth material. |

### A1 sample behavior
The deployed API returned natural Chinese output when tested via Node fetch (PowerShell console display showed mojibake, but raw API content is correct UTF-8 text).

---

## Sign-off recommendation

**Lumen recommendation: PASS for current QA scope.**

Safe to forward as:
- web smoke passed
- copy / tone passed
- ethics / disclaimer / safety consistency passed
- P0 API contract and failure handling passed

## Watchpoint

- **Mobile visual QA**: implementation looks sound, but if product wants stricter sign-off, do one manual phone-sized render check on deployed `/cn` and `/cn/disclaimer` before broader release.
