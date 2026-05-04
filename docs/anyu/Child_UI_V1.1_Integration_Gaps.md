# 安语子女端 Web UI V1.1 — 集成缺口与后续项

**Wisewave 状态**：V1.1 子女端已在 host **SIGNED OFF / READY**（闭环与 QA 边界见 `docs/anyu/Wisewave_V1.1_Child_Side_Signoff_Record.md`）。  
下文列的是**工程上仍可改进的项**，多已划入 **V1.2**：  
- **集成收口**：`docs/anyu/Nova_V1.2_Child_Web_Integration_Closure_Wisewave.md`（统一 elder id、访问守卫、CTA、memory、settings、时区等）  
- **通知与 consent**：`docs/anyu/Nova_V1.2_Notification_Consent_Wisewave.md`  
与 V1.1 sign-off **不矛盾**。

本文档记录当前 `/cn/child/*` 子女端界面与后端、产品闭环之间的**已实现**与**未接好**部分，便于排期与联调。

---

## 已实现（与数据库 / API 连通）

- **服务端渲染**：首页、今日简报、记忆、提醒等页面通过 `lib/child-insights/repository.ts` + `getPrismaClient()` 读 Postgres（`ANYU_CHAT_DATABASE_URL` / `DATABASE_URL`）。
- **表结构**：`ensureChildTables()` 会创建/补齐 `ConversationSignal`、`DailySummary`、`MemoryCard`、`FamilyNotification`（含 `contactedAt` 列的幂等迁移）。
- **「标记已联系」**（提醒单条）：客户端 `POST /api/child/notifications`，`action: "mark_contacted"` + `notificationId` → 更新 `FamilyNotification`。
- **「我已联系」**（首页批量）：`action: "mark_today_contacted"` → 当日未标记的提醒写入 `contactedAt` 并置已读。
- **JSON API**（供 App 或其它客户端）：`/api/child/dashboard`、`/api/child/daily`、`/api/child/notifications` 等仍可用；查询参数 `elderUserId` 默认 `elder_default`（与页面硬编码 id 可能不一致，见下）。
- **V1.2 consent（初版）**：生成 `FamilyNotification` 前读 **`ChildSettings`**；拦截时写 **`FamilyNotificationConsentBlock`**。回归：`npm run qa:v12`。`/cn/child/consent` 的 **`ConsentForm`** 可编辑总开关、App 渠道、紧急模式、紧急电话、各提醒等级（含 L4）。

---

## 未接好或仅为示意

### 1. 长者 ID 硬编码与聊天侧默认不一致

- 子女端页面当前写死 **`elder_demo`**。
- `/api/elder-chat/message` 使用请求体 **`elder_user_id`**，否则回退 **`sessionId`**，再否则 **`elder_default`**。
- **后果**：若灯/设备未传 `elder_user_id: "elder_demo"`，聊天产生的摘要与提醒不会出现在子女端当前页，除非两边统一同一 `elderUserId`。

**建议后续**：环境变量或配置项（如 `NEXT_PUBLIC_CHILD_DEMO_ELDER_ID`）、或登录后从绑定关系解析 `elderUserId`，与 elder-chat 入参对齐。

### 2. 无身份与绑定

- 无登录、无「当前子女用户」、无「子女 ↔ 父母」绑定；任意访问者打开 URL 即看到该硬编码 id 下的数据（在数据存在的前提下）。

**建议后续**：鉴权、多子女、绑定与权限模型。

### 3. 首页 CTA：打电话 / 发消息

- 仅为**视觉占位**，未接 `tel:`、短信、微信等；未从联系人/设置读取号码。

**建议后续**：从 `ChildSettings` / 联系人读取号码；无障碍与误触策略；可选「在手机里打开拨号盘」说明。

### 4. 记忆卡片：保存 / 回应她

- 新版记忆页上按钮为**静态示意**，未调用 `POST /api/child/memory/save`（或等价接口）。

**建议后续**：接保存、回应流程（与产品定义一致，避免暴露原文）。

### 5. 设置页 `/cn/child/settings`

- 以**说明 + 外链**为主；实际读写仍在 **`/cn/child/contacts`**、**`/cn/child/consent`**（`/api/child/settings`）。

**建议后续**：在设置内嵌管理表单，或明确「设置 = 聚合入口」并保持单一数据源。

### 6. 提醒与风险等级在 UI 上的细粒度

- 通知卡片样式已区分「紧急提醒」标题（偏红）等；**L1–L4** 与每条通知的完整映射若产品要更细，需在写入侧或查询侧带更多元数据（当前 `FamilyNotification.level` 为 `light` / `watch` / `risk` 等）。

### 7. 时区与日界

- 「今日」批量标记使用 **`date_trunc('day', CURRENT_TIMESTAMP)`**（数据库会话时区）。若产品与「北京时间日历日」强绑定，需再核对与日摘要 `date` 字段（多为 UTC 日键）是否一致。

---

## 联调检查清单（给 QA / 开发）

1. 数据库 URL 已配置，且能跑通 `npm run build` / 部署环境读库。
2. Elder 客户端请求聊天 API 时传入的 **`elder_user_id`** 与子女端使用的 **`elderUserId`** 一致。
3. 产生对话后，检查 `DailySummary` / `FamilyNotification` 是否有对应行，再打开 `/cn/child` 与 `/cn/child/notifications`。
4. 点击「标记已联系」「我已联系」后刷新页面，状态应保持。

---

*文档随实现更新；最后对齐：子女端 Nova V1.1 UI Task 与 Risk / 家庭通知产品说明。*
