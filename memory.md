# 安语 AnYu — Nova 记忆（事实 / 交接）

## 2026-04-27

- **Lumen QA（官网 + P0 `POST /api/elder-chat/message`）：PASS。** 记录：`docs/anyu/QA_Result_Lumen_Anyu_CN_Website_2026-04-27.md`。Watchpoint：移动端以实现检视为主，若产品要更严签核可补一轮真机窄屏渲染。
- 部署基线：`https://anyu-cn-website.vercel.app`（中文 `/cn`）。
- **API Step 3–4：** README / `.env.example` 补全 Vercel 与本地 env 说明；`POST /api/elder-chat/message` 支持 SSE（`Accept: text/event-stream` 或 `"stream": true`），事件 `meta` → `delta` → `done`（`lib/anyu/openai-chat.ts`）。
- **Lumen 复测（SSE 上线后）：** `A8`/`A9` **PASS**（Vercel 实测 `200`、`text/event-stream`、`meta`→`delta`）；QA 记录更新为 **A1–A9**，见 `docs/anyu/QA_Result_Lumen_Anyu_CN_Website_2026-04-27.md`。Watchpoint 仍为移动端真机渲染未做。

## 2026-04-26

- 在 `c:\github\anyu-cn-website` 初始化独立 Next 15 工作区；实现 Spec V1 路由与锁账文案、基础 `anyu` 组件与 `AGENTS.md`。
- 官网目标（注释与 AGENTS）：非「推广 AI」；让子女理解父母少言原因与如何帮助表达；让长者不惧怕使用。伦理：Non-Substitution，关系在人与人之间。
- 产品规格存档：`docs/anyu/子女端体验系统.md`（子女端 `/family/*`、Dashboard / 通知 / 趋势、API）；全产品能力，**不在**本营销站仓库实现路由。

## 待与产品确认

- 风险分级与 `/cn/safety` 正文须与线上一致 Risk Engine；上线前与 QA 对表。
- CTA「绑定父母设备」目前指向 `/cn/product`；若以后有独立绑定流程 URL，改 `app/cn/for-family/page.tsx` 中链接。

## 与 Wisewave

- 不同仓库、不同品牌；不要混入 HC-OS / Wisewave 里程碑与 prompt 条。
