# QA handoff — 安语 AnYu STT Bridge（Lumen）

**Purpose:** Validate the new AnYu ↔ ESP STT bridge integration and confirm no regression on downstream chat/risk behavior.  
**Repo:** `anyu-cn-website` (Next.js 15, App Router).  
**Scope:** `POST /api/elder-chat/transcribe` in `bridge` mode, plus end-to-end text handoff to `POST /api/elder-chat/message`.

### Context

- AnYu now supports `ANYU_STT_PROVIDER=bridge` with upstream config:
  - `ANYU_BRIDGE_STT_URL`
  - optional `ANYU_BRIDGE_STT_TOKEN`
  - optional `ANYU_BRIDGE_STT_TOKEN_HEADER` (default `Authorization`)
  - optional `ANYU_BRIDGE_STT_TIMEOUT_MS` (default `20000`)
  - optional `ANYU_BRIDGE_STT_MAX_BYTES` (default `10485760` = `10MB`)
- ESP canonical success shape:
  - `{ "text": "...", "language": "zh", "model": "fun_local", "duration": 2.34 }`
- ESP canonical error shape:
  - `{ "success": false, "code": "STT_*", "message": "..." }`

---

## 0. Preconditions

| Item | Notes |
|------|-------|
| AnYu env | `ANYU_STT_PROVIDER=bridge`, bridge URL configured, timeout `20000`, max-bytes `10485760` |
| Optional auth | If ESP auth enabled, set token + header env |
| Runtime | AnYu local server running (`npm run dev`) |
| ESP reachability | AnYu host can reach `http://<ESP_HOST>:8003/mcp/stt/transcribe` |
| Audio fixtures | `sample.wav` (<10MB), empty/invalid file, oversized file (>10MB) |

---

## 1. Bridge transcribe contract

| ID | Area | Steps | Pass criteria |
|----|------|-------|---------------|
| B1 | Success (`audio`) | `curl -X POST http://localhost:3000/api/elder-chat/transcribe -F "audio=@sample.wav"` | HTTP `200`; response has non-empty `text`; `meta.provider = "bridge"` |
| B2 | Success (`file`) | Same as B1 but field `file` | HTTP `200`; same contract as B1 |
| B3 | Language hint | Add `-F "lang=zh"` (or `language`) | HTTP `200`; no regression; language may be echoed in `meta.language` |
| B4 | Auth path | With ESP token enabled, keep AnYu env token forwarding | HTTP `200`; no `401/403` |
| B5 | Wrong content-type | JSON body instead of multipart | HTTP `400`; explicit multipart requirement message |
| B6 | Missing file | Multipart without `audio`/`file` | HTTP `400`; explicit field requirement |
| B7 | Oversized file | Upload >10MB | HTTP `413`; error mentions max size |
| B8 | Bridge URL missing | Remove `ANYU_BRIDGE_STT_URL` and retry | HTTP `503`; `code = "STT_BRIDGE_NOT_CONFIGURED"` |
| B9 | Bridge timeout/unreachable | Point to bad URL or stop ESP STT | HTTP `502`; `code = "STT_UPSTREAM_ERROR"` |
| B10 | Canonical ESP error mapping | Force ESP to return `{success:false, code, message}` | AnYu returns non-200 and surfaces upstream code/message context (not generic empty-text) |

---

## 2. End-to-end downstream checks

| ID | Area | Steps | Pass criteria |
|----|------|-------|---------------|
| E2E1 | STT -> message | Use B1 transcript text and call `POST /api/elder-chat/message` | HTTP `200`; normal assistant contract |
| E2E2 | Risk gate unaffected | Directly send `我想死` to `POST /api/elder-chat/message` | Still `risk_gate`; `meta.chat_invoked=false`; no behavior regression |
| E2E3 | SSE unaffected (optional) | Existing SSE smoke for `message` route | `meta -> delta -> done` shape unchanged |

---

## 3. Commands (copy-ready)

### 3.1 Transcribe success

```bash
curl -X POST "http://localhost:3000/api/elder-chat/transcribe" \
  -F "audio=@sample.wav"
```

### 3.2 Transcribe with lang

```bash
curl -X POST "http://localhost:3000/api/elder-chat/transcribe" \
  -F "audio=@sample.wav" \
  -F "lang=zh"
```

### 3.3 Message follow-up

```bash
curl -X POST "http://localhost:3000/api/elder-chat/message" \
  -H "Content-Type: application/json" \
  -d '{"message":"我今天有点想孩子","lang":"zh"}'
```

---

## 4. Report format

For each case (B1..B10, E2E1..E2E3), please return:

- ID
- PASS / FAIL
- status code
- request command used
- key response snippet
- note (if mismatch)

---

## Sign-off line (if all green)

**PASS — STT bridge integration validated (contract, auth, limits, timeout/error mapping), and downstream chat/risk behavior unchanged.**

