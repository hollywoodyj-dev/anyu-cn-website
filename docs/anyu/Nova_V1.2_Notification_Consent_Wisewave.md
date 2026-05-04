# NOVA TASK — AnYu V1.2 Notification + Consent Enforcement（Wisewave）

**前提**：AnYu **V1.1** 子女端已在 host **SIGNED OFF / READY**（见 `Wisewave_V1.1_Child_Side_Signoff_Record.md`，含 Wisewave **1/2 + 2/2** 合并与 V1.2 方向摘要）。  
**约束**：不要破坏 **V7.1** 与 **V1.1** 已稳定行为（对话 routing、子女端 curated 呈现、设备灯色映射等）。

**姊妹文档（Wisewave V1.2 另一主线）**：子女端 Web **集成收口**（统一 `elderUserId`、访问守卫、CTA、memory、settings 聚合、L↔UI 映射、时区）见 **`Nova_V1.2_Child_Web_Integration_Closure_Wisewave.md`**。两条线宜同一里程碑协调交付。

---

## Goal

实现第一层**真实通知能力**，带 **consent 强制执行**、**告警审计轨迹**，以及 **Lumen / 自动化 QA** 覆盖。

把「子女端能看见提醒」升级为：在**获得授权**的前提下，系统能**安全、克制、可审计**地通知家人。

---

## Priority A — Consent enforcement

**仓库进展（初版已实现）**：`appendFamilyNotificationIfEligible` 在写入 `FamilyNotification` 前读取 **`ChildSettings`**，校验 **`familyAlertsEnabled`**、**`allowedNotificationChannels.app`**、**`reminderTiers`（L1–L4）**、**联系人 `active`**；不通过时写入 **`FamilyNotificationConsentBlock`**（含 `reason` + `consentSnapshot`），状态语义为 **`blocked_by_consent`**。**L4**：在 **`emergencyContactMode`** 或已填 **`emergencyContact.phone`** 时，**不因** `reminderTiers.L4 === false` 拦截（Wisewave「紧急模式下 L4 不可完全关闭」）。实现文件：`lib/child-insights/consentGate.ts`、`notificationConsentAudit.ts`、`familyNotifications.ts`、`repository.ensureChildTables`。

1. 以 **ChildSettings / ConsentSetting**（或当前等价存储）为**单一事实来源**。
2. 在发送任何家庭通知**之前**校验：
   - 告警是否开启  
   - 提醒等级是否允许  
   - 接收人是否有效 / 启用  
   - 通知渠道是否允许  
3. **L4**：若启用「紧急联系人 / 紧急模式」等产品规则，则 **L4 不可被用户完全关闭**（细则以 Risk / 产品 Spec 为准）。
4. 若因 consent 被拦截：记录为 **`blocked_by_consent`**（或等价状态），便于审计与调试。

**仓库切入点（现状，实施时以代码为准）**  
`lib/child-insights/familyNotifications.ts`（`appendFamilyNotificationIfEligible`）、`lib/child-insights/childSettingsRepository.ts`、`app/api/child/settings`、子女端 consent/contacts 页面。

---

## Priority B — Notification channels

1. **App 内通知**为基线（当前 `FamilyNotification` + 子女端拉取已具备雏形）。
2. 增加 **placeholder adapters**（接口 + 空实现或可配置 stub）：
   - email  
   - SMS  
   - push  
3. **无环境密钥则不真实外发** SMS/email。
4. 统一 adapter **结果状态**，例如：
   - `sent`  
   - `failed`  
   - `skipped_no_channel`  
   - `blocked_by_consent`  

---

## Priority C — Alert audit trail

创建或扩展 **`RiskAlert` / `FamilyNotification`**（或专用投递表），建议字段包含：

- `elderUserId`  
- `riskLevel`  
- `notificationType`  
- `contactId`（如适用）  
- `channel`  
- `status`  
- `createdAt`  
- `sentAt`  
- `failureReason`  
- **`consentSnapshot`**（发送时 consent 的只读快照，用于争议与合规核对）

---

## Priority D — Privacy protection

**通知 payload 默认禁止**：完整用户原话、assistant 全文、session id、原始聊天记录。

**允许**：状态摘要、风险等级、温和建议行动、时间戳（与现有子女端 curated 原则一致）。

---

## Priority E — Lumen QA（自动化建议）

脚本：**`scripts/qa-v12-notification-consent.mjs`**（`npm run qa:v12`）。可选 **`QA_RUN_CHAINED_REGRESSION=1`** 在同一进程内继续跑 v7 / v7.1 / v11 tone / v11 host（需本机 / CI 已起服务且配置 `QA_BASE_URL`）。

**当前脚本已覆盖（HTTP 黑盒）**：3 dashboard 隐私键扫描；8 通知列表内疚话术启发式；1 settings 往返；1、2、6 的 consent 变体（L4 无紧急时拦截、有紧急覆盖时放行、L3 tier 关闭拦截、总开关关、App 渠道关、联系人全 inactive 拦截）。  

**仍建议 Lumen 人工或后续补自动化**：4 轻提醒 cap、5 L3 dedupe 时间窗、6 在「允许」配置下 L4 必出（与现有 dedupe 组合场景）。

---

## Acceptance（Wisewave）

V1.2 需通过：

- `scripts/qa-v7-first-response.mjs`  
- `scripts/qa-v7.1-family-state-regression.mjs`  
- `scripts/qa-v11-tone-watchpoints.mjs`  
- `scripts/qa-v11-host-sanity.mjs`  
- **`scripts/qa-v12-notification-consent.mjs`**（`npm run qa:v12`；可选 `QA_RUN_CHAINED_REGRESSION=1` 串联上述四条）

---

## V1.2 产品边界（Wisewave）

**不做**：复杂家庭关系图谱、多代权限建模等大型社交图产品。

**只做三件事**：

1. **该通知时，通知得到人**  
2. **不该通知时，不越权**  
3. **每一次通知都有记录**  

与风险闭环对齐：高风险路径「识别 → 分级 → 安抚 → 通知亲人/护理 → **记录** → 跟进」中，V1.2 补齐**可落地的通知与审计**一环。

---

## 产品判断（Wisewave 原文摘要）

安语已具备三个稳定雏形：**长者端**（表达与被接住）、**子女端**（温和看见与回应）、**设备端**（灯光桥接）。接近「家庭情感基础设施」定位：**不是 AI 取代亲人**，而是让**本来可能沉下去的情绪，被家人早一点点看见**。

---

*本文件为 Wisewave V1.2 任务单的仓库副本；实现细节与字段名以 Prisma / 产品 Spec 为准。*
