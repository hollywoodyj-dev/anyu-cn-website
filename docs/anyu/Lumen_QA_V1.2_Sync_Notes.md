# Lumen QA — V1.2 repo / host sync（给 Lumen 的说明）

## 关于 Nova 引用的 commit（e536e65、465439c 等）

那些 **SHAs 不在本仓库 `hollywoodyj-dev/anyu-cn-website` 的 `origin/main` 历史上**。此前 `main` 停在 **2eb1e37**（子女端 UI）/ 更早 **411ba76**（Wisewave sign-off 所指 baseline），V1.2 实现是在本机开发后 **新推** 的。

**请以 `origin/main` 上实际存在的提交为准**做 QA 与对照，不要依赖未出现在该 remote 上的 SHA。

---

## 当前 `main` 上的 V1.2 相关提交（推送后）

在 push 之后，包含 **Priority A consent gate**、`FamilyNotificationConsentBlock` 审计表、`qa-v12-notification-consent.mjs`、`ConsentForm` 扩展、以及 Wisewave / Nova 文档的提交为：

- **`5c50b75`** — `feat(v1.2): consent gate before family notifications, audit log, qa-v12, consent UI`

克隆或 `git pull` 后：`git log -1 --oneline` 应能看到该 commit。

---

## Host（部署后跑 Lumen）

- **生产预览 URL（Wisewave 常用）**：https://anyu-cn-website.vercel.app  
- Vercel 在 **`main` 收到 push 后会自动 build**；请等该次 deployment **green** 后再对 host 跑脚本，避免仍指向旧 artifact。

---

## 本地 / CI 跑 V1.2 自动化（需已起 Next + DB）

```bash
git pull origin main
npm install
# 配置 .env.local 中 DATABASE_URL / ANYU_CHAT_DATABASE_URL 等与线上一致或指向可写测试库

npm run dev   # 另开终端，默认 http://localhost:3000
set QA_BASE_URL=http://localhost:3000
npm run qa:v12

# Priority E 收口：v12 全部用例 + 串联 v7 / v7.1 / v11 tone / v11 host（同一 QA_BASE_URL）
npm run qa:v12:close

# 等价于手动：
# set QA_RUN_CHAINED_REGRESSION=1
# npm run qa:v12
```

对 **已部署 host**：

```bash
set QA_BASE_URL=https://anyu-cn-website.vercel.app
npm run qa:v12
npm run qa:v12:close
```

---

## 给 Lumen 的一句话（可原样转发）

> `origin/main` 已包含 V1.2 consent 初版（commit **`5c50b75`**）。Nova 文档里若出现未在本 remote 出现的 SHA，请忽略；请以 **`5c50b75`** 及之后 `main` 为准。Host QA 请用 **https://anyu-cn-website.vercel.app**（待 Vercel 该 commit 部署成功）或你们同步后的 clone + `QA_BASE_URL` 跑 **`npm run qa:v12`**。

---

## Lumen host 验证记录（已通过）

**记录日期**：2026-04-30（Lumen 回报）。  
**Repo**：`main` @ **`5048917`**（历史中包含 V1.2 **`5c50b75`**）。  
**Host**：https://anyu-cn-website.vercel.app  
**命令**：`QA_BASE_URL=https://anyu-cn-website.vercel.app npm run qa:v12`（等价 `node scripts/qa-v12-notification-consent.mjs`）

**结果**：`failed=0`

**已确认用例**：

| 项 | 结果 |
|----|------|
| privacy（dashboard 无 transcript 泄漏键） | ✅ |
| tone（通知列表内疚话术启发式） | ✅ |
| settings round-trip（`familyAlertsEnabled`） | ✅ |
| L4 blocked without emergency | ✅ |
| L4 allowed with emergency override | ✅ |
| L3 respects consent off | ✅ |
| master alerts off blocks | ✅ |
| app channel off blocks | ✅ |
| inactive contacts block | ✅ |

**结论（Lumen）**：对 **Priority A consent enforcement + `qa:v12` host 验证** 而言，V1.2 相关实现已在 host 上 **真实可用且通过**。

---

## Lumen host 验证 — Priority B/C 合并后（已通过）

**记录日期**：2026-04-30（Lumen 回报）。  
**Repo**：`main` @ **`a3367d8`** — `feat(v1.2): Priority B placeholder channels + C delivery audit table`（历史中含 **`5c50b75`** consent 初版）。  
**Host**：https://anyu-cn-website.vercel.app  
**命令**：`QA_BASE_URL=https://anyu-cn-website.vercel.app npm run qa:v12`

**结果**：**全部 PASS**，`failed=0`。

**Lumen 确认**：

- **Repo 同步**：`lib/notify/channelAdapters.ts`、`lib/notify/externalChannelDispatch.ts`、`lib/child-insights/notificationDeliveryAudit.ts`、`lib/child-insights/familyNotifications.ts` 等预期文件在 `main` 上存在。  
- **Host 回归 smoke**：Priority A 的 consent 行为在 B/C 合并后 **仍在 host 上通过**；**未**破坏既有 `qa:v12` smoke。

**此轮仍未证明（与 Nova 备注一致，Lumen 认可为 pending）**：

- `NotificationDeliveryAttempt` **精确行数**或 SQL 断言  
- **各 channel 审计行**内容与状态细节  
- **`contactId`** 选择逻辑  
- **真实外发**（SMTP / 短信 / Push）行为  

**Lumen 判断（摘要）**：合并从 **host 行为侧**看 **稳定**；若产品要验收审计表本身，需另加 **deeper audit-table verification**（只读 API、集成测试或受控 DB 断言）。

---

## Priority E — 轻提醒 cap + L3 dedupe + 串联回归（模板）

以下 **`npm run qa:v12`** 已包含 **light_cap**、**l3_dedupe**、**pri_d** 等节；**`npm run qa:v12:close`** 在 v12 全部 PASS 后继续跑四条链式脚本。

**记录日期**：____（Lumen 填写）  
**Repo**：`main` @ **`________`**  
**Host 或本地**：`QA_BASE_URL=________________`  
**命令**：

```bash
QA_BASE_URL=... npm run qa:v12
QA_BASE_URL=... npm run qa:v12:close
```

**结果**：`failed=____`（两条命令分别记录或均为 0）

| 节 | 说明 |
|----|------|
| light_cap | 同日 lonely 路径下 **至多 2** 条 `light`「轻提醒」 |
| l3_dedupe | 6h 内两次 L3 → **至多 1** 条「需要关注」 |
| （chained） | v7 → v7.1 → v11 tone → v11 host 全 PASS |

**结论**：Priority E 自动化与串联回归 **完成 / 未完成**（Lumen 勾选）。

### 只读 QA API（`ANYU_QA_SECRET`）

部署时在 **服务端**设置 **`ANYU_QA_SECRET`**（勿提交到 git）。请求头携带 **`x-anyu-qa-secret: <同值>`**；若未配置 secret 或 header 不匹配，返回 **404**（不区分原因）。

```http
GET /api/child/qa/delivery-attempts?elderUserId=elder_demo&limit=50
x-anyu-qa-secret: <ANYU_QA_SECRET>
```

响应：`{ elderUserId, count, attempts }`，每条含 `channel`、`status`、`familyNotificationId`、`riskLevel`、`notificationType`、`consentSnapshot`（JSON）等。`limit` 默认 50，最大 100。
