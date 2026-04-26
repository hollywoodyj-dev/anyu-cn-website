# 安语 AnYu — Nova 记忆（事实 / 交接）

## 2026-04-27

- **Lumen QA：PASS（A1–A17 + Step 9–10 合约）。** 记录：`docs/anyu/QA_Result_Lumen_Anyu_CN_Website_2026-04-27.md`。含前述 API；追加实机：**`/cn`→307 免责门**、**`POST /api/cn/disclaimer-ack`**（`Secure`+`HttpOnly`+`Lax`）、**`/cn/ethics` 无 ack 可进**、**`transcribe` bridge 501** / 非 multipart **400**、**`next` 防开放重定向**。**Watchpoint：** 移动端真机渲染；Vercel 未开 **`openai_whisper`** 故未签「真转写」路径。
- **部署：** `https://anyu-cn-website.vercel.app`（中文 `/cn`）。
- **API 里程碑：** Step 3–4 SSE；Step 5–6 `session` + `risk/evaluate`；Step 7–8 **`message` 内先 risk**（L3/L4 → `risk_gate`，不调 LLM）+ **consent** `501` 占位；**Step 9–10** `stt` + **`/api/elder-chat/transcribe`**；**middleware** + **`/api/cn/disclaimer-ack`**（`/cn` 门；`/api` 未门控）。**STT 与 ESP/xiaozhi 对齐说明：** `docs/anyu/ANYU_STT_ESP_xiaozhi_alignment.md`（默认生产：**设备整句转写 → 文本 → `message`**，`bridge`）。

## 2026-04-26

- 在 `c:\github\anyu-cn-website` 初始化独立 Next 15 工作区；实现 Spec V1 路由与锁账文案、基础 `anyu` 组件与 `AGENTS.md`。
- 官网目标（注释与 AGENTS）：非「推广 AI」；让子女理解父母少言原因与如何帮助表达；让长者不惧怕使用。伦理：Non-Substitution，关系在人与人之间。
- 产品规格存档：`docs/anyu/子女端体验系统.md`（子女端 `/family/*`、Dashboard / 通知 / 趋势、API）；全产品能力，**不在**本营销站仓库实现路由。

## 待与产品确认

- 风险分级与 `/cn/safety` 正文须与线上一致 Risk Engine；上线前与 QA 对表。
- CTA「绑定父母设备」目前指向 `/cn/product`；若以后有独立绑定流程 URL，改 `app/cn/for-family/page.tsx` 中链接。

## 与 Wisewave

- 不同仓库、不同品牌；不要混入 HC-OS / Wisewave 里程碑与 prompt 条。
