# 安语 AnYu — 中文官网

Elder Emotional Communication Agent · 官网（V1 静态说明站）。

## 开发

```bash
cd c:\github\anyu-cn-website
npm install
npm run dev
```

浏览器打开 <http://localhost:3000>，根路径会重定向到 `/cn`。

## 在 Cursor 中打开

**File → Open Folder** → 选择 `c:\github\anyu-cn-website`（作为独立工作区根目录即可）。

## 规范与记忆

- 开发说明与伦理约束：`AGENTS.md`
- 事实与交接短记：`memory.md`
- 产品全量说明：见仓库外你提供的《安语中文官网 · AnYu Nova 实际开发 Spec V1》

## 技术

- Next.js 15、React 19、Tailwind CSS 4
- 页面均在 `app/cn/…`

## 长者对话 API（P0 + SSE）

规格：`docs/anyu/ANYU_Voice_OpenAI_STT_Implementation_Spec.md`。变量模板：`.env.example` → 复制为 **`.env.local`**（本地）或填到 **Vercel → Project → Settings → Environment Variables**。

### 环境变量（Step 3）

| 变量 | 必填 | 说明 |
|------|------|------|
| `OPENAI_API_KEY` | **是**（要跑 API 时） | 仅服务端；**不要** `NEXT_PUBLIC_` 前缀。 |
| `ANYU_OPENAI_CHAT_MODEL` | 否 | 默认 `gpt-5.4`；可改为组织批准的模型或快照 ID。 |
| `ANYU_SYSTEM_PROMPT` | 否 | 整段覆盖默认 system prompt。 |
| `ANYU_PROMPT_VERSION` | 否 | 默认 `v0`；与 prompt 变更一起 bump。 |
| `ANYU_RISK_RULES_VERSION` | 否 | 默认 `risk-v0`；与 `lib/anyu/risk/evaluate.ts` 规则变更同步。 |

在 Vercel 修改变量后需 **Redeploy**，预览环境若也要测 API，请在 **Preview** 环境同样配置密钥（或仅 Production 测）。

### JSON smoke（本地；PowerShell）

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/elder-chat/message" `
  -ContentType "application/json" `
  -Body '{"message":"我今天有点想孩子","lang":"zh"}'
```

成功：`assistant_message`、`conversation_id`、`meta`（`model`、`prompt_version`、`turn_id` 等）。上游失败：**502** + 简短兜底句。缺密钥：**503**。

若控制台中文乱码，以 **原始 UTF-8** 为准，或先执行  
`[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()`。

### SSE 流式（Step 4）

同一 URL：`Accept: text/event-stream` **或** JSON 里 `"stream": true`。响应为 **`text/event-stream`**，每行 `data: {JSON}`：`type:meta` → 若干 `type:delta`（`text` 片段）→ `type:done`。流未建立前的错误仍返回 **JSON**（502/503）。

Windows 推荐用 **`curl.exe`**（跟 `-N` 不缓冲）：

```powershell
curl.exe -sN -H "Accept: text/event-stream" -H "Content-Type: application/json" `
  -d "{\"message\":\"你好\",\"lang\":\"zh\"}" `
  "http://localhost:3000/api/elder-chat/message"
```

### Session + Risk（Step 5–6）

- **`POST /api/elder-chat/session`** — body 可为 `{}`；返回 `{ "session_id": "<uuid>", "meta": { "timestamp", "persistence": "none" } }`。将 `session_id` 传给 **`message`** 的 `session_id` 即可对齐 `conversation_id`（无 DB 时不校验「未知 session」）。
- **`POST /api/risk/evaluate`** — body：`{ "text": "…", "session_id?": "…", "context?": "…" }`；返回 `{ "level": "L0"|…|"L4", "signals": [], "version": "risk-v0" }`。规则与 `docs/anyu/Elder Emotional Communication Agent.md` §4.2 硬编码短语一致（纯函数：`lib/anyu/risk/evaluate.ts`）。

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/elder-chat/session" `
  -ContentType "application/json" -Body '{}'
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/risk/evaluate" `
  -ContentType "application/json" -Body '{"text":"我想死"}'
```

### Risk gate + Consent stubs（Step 7–8）

- **`POST /api/elder-chat/message`** 会先跑 **`evaluateRiskText`**。**L3 / L4** 时 **不调 OpenAI**，返回固定安全引导（`meta.model`=`risk_gate`，`meta.chat_invoked`=`false`，`meta.risk` 为分级结果）。L0–L2 再走 LLM；成功时 `meta.chat_invoked`=`true` 且带 `meta.risk`。SSE 在拦截时仍为 `text/event-stream`（`meta` + 单条 `delta` 全文 + `done`）。**L3/L4 测试可无 `OPENAI_API_KEY`**。
- **Consent：** `GET` / `PATCH` **`/api/consent`**、`POST` **`/api/consent/revoke`** — 无 Prisma 时统一 **HTTP `501`**，body 含 `code: NOT_IMPLEMENTED`（见 `docs/anyu/Implementation Spec.md` §8）。

## 部署到 Vercel（新建项目并连 GitHub）

仓库：<https://github.com/hollywoodyj-dev/anyu-cn-website>。在 Cursor 里无法替你完成网页登录，请在本机浏览器按下面做一遍即可。

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard) 并登录。
2. **Add New… → Project**（或 **Import**）。
3. **Import Git Repository**：选中 GitHub 上的 **`hollywoodyj-dev/anyu-cn-website`**（若列表里没有，点 **Adjust GitHub App Permissions** 或 **Configure** 给 Vercel 授权该仓库）。
4. **Configure Project**：
   - **Framework Preset**：Next.js（一般会自动识别）。
   - **Root Directory**：`.`（默认即可）。
   - **Build Command**：`npm run build`（默认即可）。
   - **Output Directory**：留空（Next 默认由 Vercel 处理）。
5. 点 **Deploy**。完成后会得到 `*.vercel.app` 预览域名；可在项目 **Settings → Domains** 里绑定自定义域名。

可选（本机 CLI）：安装并登录后可在仓库根目录执行 `npx vercel link` 与 `npx vercel` 做预览部署；链接信息在 `.vercel/`（已写入 `.gitignore`，勿提交）。

官方文档：[Import an existing project from Git](https://vercel.com/docs/getting-started-with-vercel/import)。
