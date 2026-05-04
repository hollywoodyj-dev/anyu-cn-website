# NOVA TASK — AnYu Child Web V1.2 Integration Closure（Wisewave **1/2**；sign-off **2/2** 见 signoff 合并档）

**定位**：V1.1 子女端已不是纯 UI 阶段，而是 **闭环联调 / 权限 / 数据一致性** 阶段。  
**核心**：不是继续加页面，而是把链路接通：

```text
长者说话 → Risk / Summary 写入 → FamilyNotification 生成
  → 子女端看到 → 子女标记已联系 → 系统记录跟进
```

**产品原则（重申）**：子女端不是监控后台，而是 **gentle awareness layer**；通知只显示必要信息，**不暴露完整对话**。  
**Risk**：Risk Engine 必须在普通聊天前运行；**L3/L4** 进入人类介入路径，**不能**在风险未处理时继续普通闲聊（以当前 Risk Spec 为准）。

**与另一份 V1.2 任务的关系**：本文件侧重 **子女端 Web 集成收口**。通知真实化、consent 强制执行、审计轨迹见 **`Nova_V1.2_Notification_Consent_Wisewave.md`**。两条线应 **同一版本协调发布**，避免只接 UI 不接通知、或只接通知不接 elder id。

**Wisewave V1.1 sign-off 2/2**：已与 1/2 合并进 **`Wisewave_V1.1_Child_Side_Signoff_Record.md`**（含 V1.2 方向与指向，不重复粘贴 NOVA Notification 全文）。

---

## 目标

把 `/cn/child/*` 从「可看 UI + 部分 API 已通」推进到：

**真实长者对话数据稳定进入子女端**，并完成 **提醒 → 联系 → 记录 → 回访** 闭环。

---

## P0 — 必须先修：统一 `elderUserId`

**断点**：子女端写死 `elder_demo`，`/api/elder-chat/message` 默认可能落到 `elder_default` → 聊天侧数据不一定出现在子女端。

### Nova 执行

新增统一配置（示例路径，实现时可微调）：

```ts
// lib/anyu/config.ts（新建）

export const ANYU_DEMO_ELDER_ID =
  process.env.NEXT_PUBLIC_CHILD_DEMO_ELDER_ID ||
  process.env.ANYU_DEMO_ELDER_ID ||
  "elder_demo";
```

**统一引用**（清单，实施时 grep 补全）：

- `/cn/child/*` 页面与 server components  
- `/api/child/dashboard`、`/api/child/daily`、`/api/child/notifications`、memory/settings 等 child API  
- `/api/elder-chat/message` 的 **fallback** elder id（与上式一致）  
- seed / demo 数据  
- QA scripts（`qa-v7*`、`qa-v11*` 等）

### Acceptance Criteria

1. elder-chat **不传** `elder_user_id` 时，默认落到**同一个** demo elder id。  
2. 子女端页面与 JSON API 查询 **同一** `elderUserId`。  
3. 新产生的 `DailySummary` / `FamilyNotification` 能在 `/cn/child` 显示。  
4. 不再出现 `elder_demo` / `elder_default` **双轨**各写一半数据。

---

## P0 — 第二优先：最小绑定层 / demo-safe guard

**风险**：任意人打开 URL 可能看到硬编码长者数据 — **V1.2 伦理底线**，不建议拖到「正式版」才做。

### Nova 执行（最小版）

二选一或组合：

- **表**：`ChildUser` + `ChildElderBinding`（若已规划迁移则上表）；或  
- **无迁表**：环境变量 **`CHILD_DEMO_ACCESS_KEY`**（或同名）  
  - 访问 `/cn/child/*` 需要 `?accessKey=xxx` **或** cookie/session 中已写入合法 key。

### Acceptance Criteria

1. 无 access key / 无有效 binding 时，**不展示**真实 dashboard 数据。  
2. 页面为「请完成家庭绑定」或 **demo safe empty state**。  
3. **所有** child 相关 API 校验：当前上下文是否**允许**访问该 `elderUserId`。

---

## P1 — CTA 接通真实联系动作

首页「打电话 / 发消息」当前为占位。V1.2 最小可用：

### Nova 执行

从联系人 / child settings 读取（字段名以 `childSettingsRepository` 与 API 为准），例如：

- `primaryContactPhone`  
- `primaryContactSms`（可与 phone 相同）  
- `preferredContactMethod`  

前端：

- `<a href={tel:...}>打电话</a>`  
- `<a href={sms:...}>发消息</a>`  

无手机号：提示「请先添加联系人」并链到 **`/cn/child/contacts`**。

### 误触策略

电话前轻确认：「要现在打电话给妈妈吗？」— **不要**强烈警报感（**除非 L4**，按产品）。

---

## P1 — 记忆卡片：保存 / 回应（不接原文）

### Nova 执行

- `POST /api/child/memory/save` — body 示例：`{ "memoryCardId", "action": "save" }`  
- `POST /api/child/memory/respond` — 返回 **建议话术**，**不**自动代发；示例：`{ "suggestedMessage": "…" }`

### Acceptance Criteria

1. 保存后刷新仍为 saved。  
2. 「回应她」只生成温和话术，不自动发送。  
3. 不展示完整原始对话。  
4. 无责备、施压、恐吓式语言。

---

## P1 — 设置页收口（聚合入口，不重做复杂设置）

**决策**：`/cn/child/settings` = **聚合入口**，真实读写仍在 contacts / consent（单一数据源）。

三张卡片示例：

- 联系人设置 → `/cn/child/contacts`  
- 通知与授权 → `/cn/child/consent`  
- 数据与隐私 → `/cn/child/privacy`（或后续路由）

### Acceptance Criteria

1. settings 不像半成品。  
2. 读写仍单一数据源。  
3. 用户清楚「去哪里管理」。

---

## P1 — Risk level ↔ 通知 UI 映射

当前 `FamilyNotification.level` 多为 `light` / `watch` / `risk`，产品侧有 **L1–L4**。V1.2 需 **显式 mapping**（示例，可随产品微调）：

```ts
const notificationLevelMap = {
  L1: "light",
  L2: "watch",
  L3: "risk",
  L4: "urgent",
};
```

**UI**：light 轻提醒不红；watch 柔和强调；risk 明显不恐吓；**urgent** 红/强提醒。  
**Risk 原则**：L3 预警并通知亲人；L4 立即通知紧急联系人并呈现危机资源（以 Risk Spec 为准）。

---

## P1 — 时区统一

**问题**：「今日」若混用 DB `date_trunc('day', CURRENT_TIMESTAMP)` 与 `DailySummary.date`（如 UTC 日键），可能错位。

### Nova 执行

- 环境变量：`ANYU_PRODUCT_TIMEZONE=Asia/Shanghai`（或先服务地区如 `Australia/Sydney`）  
- **今日**统计、`DailySummary.date`、`mark_today_contacted` 边界均用该时区。

### Acceptance Criteria

1. `DailySummary.date` 与「今日提醒」同一 timezone 语义。  
2. `mark_today_contacted` 不跨 UTC 日误标。  
3. QA 覆盖 **23:30 / 00:30** 边界。

---

## 推荐 Build Order（Wisewave）

1. 统一 `elderUserId` 配置  
2. 修 elder-chat → DailySummary / FamilyNotification → child dashboard **数据闭环**  
3. 最小 child access guard / binding  
4. `mark_contacted` / `mark_today_contacted` 回归测试  
5. 电话 / 短信 CTA  
6. memory save / respond  
7. settings 聚合入口收口  
8. risk level → notification UI mapping  
9. 统一 timezone  
10. Lumen / QA 跑完整子女端闭环  

---

## Lumen QA 回归清单（Wisewave）

1. `elder_user_id = elder_demo`（或统一后的 demo id）时子女端能看到数据。  
2. 不传 `elder_user_id` 时 fallback 到**同一** demo id。  
3. L1/L2 仅轻提醒、不制造焦虑。  
4. L3 风险提醒、**不**泄露完整原话。  
5. L4 紧急提醒 + 人类介入路径。  
6. 「标记已联系」后刷新状态保持。  
7. 「我已联系」后当日未联系提醒被更新。  
8. 无 binding / access key 时不展示 dashboard 数据。  
9. 电话按钮无号码时引导 contacts。  
10. 指定 timezone 下「今日」统计正确。

---

## 给 Nova 的一句话（Wisewave）

**V1.2 is not a UI expansion. It is an integration closure release:** unify elder identity, protect access, complete the family notification loop, and verify that child-side actions persist.

**判断**：这一步做完，安语才从「展示型子女端」变成 **「家庭连接闭环」**。

---

*本文件为 Wisewave 子女端 V1.2 集成收口任务单（原 1/2）的仓库副本；V1.1 sign-off 2/2 已并入 `Wisewave_V1.1_Child_Side_Signoff_Record.md`。实现以代码与产品 Spec 为准。*
