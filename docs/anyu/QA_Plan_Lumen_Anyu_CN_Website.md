# QA handoff — 安语 AnYu 中文官网 + P0 对话 API（Lumen）

**Purpose:** Give Lumen a single checklist to run before sign-off or internal beta.  
**Repo:** `anyu-cn-website` (Next.js 15, App Router, Vercel-capable).  
**Product stance:** Non-Substitution; site copy is **locked** unless product explicitly changes it; safety/ethics/disclaimer must stay **aligned** with Risk Engine + Human Override language (see `AGENTS.md`, `rule spec.md`, `disclaimer.md`, `memory.md`).

### Project path & URLs (for this QA pass)

| What | Value |
|------|--------|
| **Local workspace (Holly / implementer)** | `c:\github\anyu-cn-website` |
| **GitHub** | [https://github.com/hollywoodyj-dev/anyu-cn-website](https://github.com/hollywoodyj-dev/anyu-cn-website) |
| **Deployed site (中文首页)** | [https://anyu-cn-website.vercel.app/cn](https://anyu-cn-website.vercel.app/cn) |
| **API base (same deploy)** | `https://anyu-cn-website.vercel.app` — e.g. `POST /api/elder-chat/message` |

Use the **Vercel URL** for sections **1–3** (browser). Use the **same origin** for section **4** API calls unless testing localhost intentionally.

---

## 0. Preconditions

| Item | Notes |
|------|--------|
| Build | `npm run build` passes locally / on preview deploy. |
| Env (API QA only) | `.env.local` or Vercel: `OPENAI_API_KEY` set; `ANYU_OPENAI_CHAT_MODEL` as agreed (e.g. `gpt-5.4`). |
| Base URL | **`https://anyu-cn-website.vercel.app`** — 中文首页入口：[https://anyu-cn-website.vercel.app/cn](https://anyu-cn-website.vercel.app/cn). |

---

## 1. Marketing site — routes & smoke

| ID | Area | Steps | Pass criteria |
|----|------|-------|---------------|
| W1 | Root | Open `/` | Redirects to `/cn` (or equivalent home) without error. |
| W2 | Nav | Click each header nav item | All resolve: 首页、给子女、给长者、安全与预警、产品形态、关于我们. |
| W3 | Footer | Scroll to footer | Links present: **我们的原则** (`/cn/ethics`)、**免责声明** (`/cn/disclaimer`)、**安全与预警** (`/cn/safety`). |
| W4 | Logo | Header | Logo loads; alt text appropriate; no broken image. |
| W5 | Mobile | Narrow viewport (e.g. 375px) | Nav wraps/readable; no horizontal scroll on key pages; logo not overlapping nav. |

---

## 2. Copy & tone (spot check, not full re-edit)

| ID | Area | Steps | Pass criteria |
|----|------|-------|---------------|
| C1 | Global | Skim `/cn`, `/cn/for-family`, `/cn/for-elder` | No “AI 产品腔”、少堆术语；温暖、字大、可读. |
| C2 | Non-Substitution | `/cn`, `/cn/ethics` | Clear that **系统不替代家人/真人关系**; no “只有我能懂你”类依赖话术. |
| C3 | 给长者 | `/cn/for-elder` | 字少、无责备；**安全与预警** / **我们的原则** 入口醒目. |

---

## 3. Ethics / disclaimer / safety — consistency

| ID | Area | Steps | Pass criteria |
|----|------|-------|---------------|
| E1 | Ethics | Open `/cn/ethics` | Five principles + data/privacy + elder protection + closing; cross-links to safety/disclaimer/home work. |
| E2 | Disclaimer | Open `/cn/disclaimer` | All blocks readable; **风险/非紧急/非医疗** 边界清楚; cross-links work. |
| E3 | Disclaimer UX | Uncheck → “进入首页” | Disabled/grey state; **勾选后** 才可进入首页链接（若实现为链接而非按钮，确认无未勾选误点）. |
| S1 | Safety | Open `/cn/safety` | Risk tiers language matches product expectation; link to ethics + disclaimer + home. |
| S2 | Cross-doc | Compare `/cn/safety` vs `/cn/disclaimer` vs `/cn/ethics` | **无互相矛盾**（例如：紧急处理、通知义务、人类优先）. |

---

## 4. API — `POST /api/elder-chat/message` (P0)

**Reference:** `docs/anyu/ANYU_Voice_OpenAI_STT_Implementation_Spec.md` §4.2.

| ID | Area | Steps | Pass criteria |
|----|------|-------|---------------|
| A1 | Happy path | `POST` JSON `{"message":"我今天有点想孩子","lang":"zh"}` | HTTP `200`; body has `assistant_message`, `conversation_id`, `meta.model`, `meta.prompt_version`, `meta.turn_id`, `meta.timestamp`. |
| A2 | Session echo | Same with `"session_id":"test-session-1"` | `conversation_id` equals `test-session-1`. |
| A3 | Validation | Empty `message` / missing `message` | HTTP `400`; JSON `error` explains field. |
| A4 | Invalid JSON | Malformed body | HTTP `400`. |
| A5 | No key | Remove `OPENAI_API_KEY`, restart, call API | HTTP `503` (or agreed code); **no** stack trace or key in response body. |
| A6 | Upstream failure | Simulate bad model name or revoked key | HTTP `502` (per current handler); `assistant_message` is **short fallback**，不假装成功诊断. |
| A7 | Secret leak | Browser devtools → Network → response headers/body | **Never** `OPENAI_API_KEY` or raw Authorization in client-visible assets for this route (server-only). |

Optional (PowerShell example for Lumen):

```powershell
Invoke-RestMethod -Method POST -Uri "https://anyu-cn-website.vercel.app/api/elder-chat/message" `
  -ContentType "application/json" `
  -Body '{"message":"我今天有点想孩子","lang":"zh"}'
```

---

## 5. Out of scope for this pass (record as N/A or future)

- Full **Risk Engine** integration inside `message` (P1 stub `/api/risk/evaluate` not required for this checklist unless shipped).
- **Consent** persistence APIs (`GET/PATCH/POST revoke`) — until Prisma/schema exists.
- **Streaming** LLM response on same route (optional future).
- **Audio / STT** on Vercel — bridge text-in path only for P0.
- **子女端 dashboard** / notifications / charts.

---

## 6. Sign-off

| Gate | Owner | Date | Pass / Fail | Notes |
|------|--------|------|---------------|-------|
| Web smoke W1–W5 | Lumen | | | |
| Consistency E1–S2 | Lumen | | | |
| API A1–A7 | Lumen | | | |
| Product | Chino / Holly | | | |

---

## 7. Spec index (repo)

| Doc | Use |
|-----|-----|
| `AGENTS.md` | Agent + site rules |
| `memory.md` | Milestone facts |
| `docs/anyu/rule spec.md` | Ethics page source |
| `docs/anyu/disclaimer.md` | Disclaimer page source |
| `docs/anyu/ANYU_Voice_OpenAI_STT_Implementation_Spec.md` | API + voice/STT roadmap |
| `docs/anyu/Implementation Spec.md` | Register/consent (not all in this repo yet) |

---

*Draft for forwarding; adjust IDs or owners to match Lumen’s QA template.*
