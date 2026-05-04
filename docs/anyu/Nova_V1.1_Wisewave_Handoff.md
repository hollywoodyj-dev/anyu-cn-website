# Wisewave → Nova：V7.1 Sign-off 与 V1.1 阶段任务（仓库对照）

> **Update — V1.1 Child Side SIGNED OFF（Wisewave）**  
> Host 验证 READY；正式记录与给 Tree/Nova/Lumen 的英文贴语见 **`docs/anyu/Wisewave_V1.1_Child_Side_Signoff_Record.md`**。下一阶段任务见 **`docs/anyu/Nova_V1.2_Notification_Consent_Wisewave.md`**。

---

**来源**：Wisewave 对 AnYu **V7.1** 的正式 sign-off 与下一阶段 **V1.1** 说明（READY / 可进入下一阶段）。

**V7.1 已通过（Wisewave）**  
family-hurt routing、Cantonese family targeting、alignment repair、household-style family message、automated regression、manual host verification。

**V7.1 核心能力（产品描述）**  
长者表达「子女不理我 / 我不是抱怨 / 想叫孩子回来吃饭」等时，系统能稳定识别、温和回应，并正确进入家庭沟通场景。

**V1.1 方向（Wisewave）**  
不大改架构；**tone refinement** + **子女端基础层**。目标：从「能正确回应」到「更像长者愿意继续说下去的家常陪伴」——更短、更暖、更日常；重点不是更聪明。

---

## Nova Task 分解与本仓库状态

### Priority A — Tone refinement

| 项 | 说明 | 仓库状态 |
|----|------|----------|
| Lonely-first-turn softening | 首句孤单语境更软、更家常 | 需在 **prompt / 后处理 / `lib/elder-agent`*** 持续迭代；已有 `scripts/qa-v11-tone-watchpoints.mjs` 做首句抽检 |
| 减少抽象情绪词、心理腔 | 文案与模型约束 | 需与 prompt、household fallbacks 对齐评审 |
| Household-style 语言 | 短、暖、日常、无心理学术语 | 部分在 `lib/anyu-response/householdFallbacks.ts`、eval 语料 |
| V1.1 QA 用例（Wisewave 点名） | 「今天一个人，有点闷」「没人跟我说话」「我也不想麻烦孩子」「他们忙，我也不好意思叫他们」 | **「没人跟我说话」类**已在 `qa-v11-tone-watchpoints.mjs` 有相近句；**其余三条建议加入**同一脚本或 `qa-v7-first-response.mjs` 扩展集 |
| Acceptance | 像家里人接住、不过度解释、无治疗腔、无机械安慰 | `qa-v11-tone-watchpoints.mjs` 中部分 heuristics（长度、错误漂移词）；**Lumen 人工项见下 D** |

\*具体实现路径以当前 elder-chat 管线为准（`app/api/elder-chat/message` 等）。

### Priority B — Preserve V7.1

| 项 | 仓库提示 |
|----|----------|
| 不改 family-hurt routing / alignment repair / Risk 优先级 | 任何 prompt 或分支改动后必须跑回归 |
| 保持脚本通过 | `scripts/qa-v7-first-response.mjs`、`scripts/qa-v7.1-family-state-regression.mjs` |

### Priority C — Child-side foundation

Wisewave 文案示例路径：`/family/dashboard`。

| 项 | 本仓库 |
|----|--------|
| Daily status、gentle reminder、emotion trend、suggested action | 已实现为 **`/cn/child`**（及 `/cn/child/dashboard`）、`ChildDashboardContent`、curated 摘要；**非** `/family/dashboard` |
| 不默认展示完整聊天记录 | 子女端 UI 与 Integration 文档已强调 curated-only |
| 后续可选 | 增加 **`/family/dashboard` → `/cn/child` 重定向**或别名路由，便于与 Wisewave 文档路径一致 |

详见：`docs/anyu/Child_UI_V1.1_Integration_Gaps.md`（登录、配对、`elderUserId` 对齐等缺口）。

### Priority D — QA / Lumen

建议在 Lumen 或发布前检查单中覆盖：

1. tone 过抽象  
2. 回复过长  
3. 子女通知「内疚诱导」  
4. over-alerting  
5. 隐私泄露  
6. L3/L4 升级缺失  

自动化侧：在 A 的 QA 脚本通过后，再跑 **Priority B** 两条 V7.1 回归。

**Final acceptance（Wisewave）**  
V1.1 = **全部 V7.1 回归通过** + **新增 lonely-first-turn tone 测试通过**（脚本 + 约定的人工 Lumen 项）。

---

## 建议的下一步（工程顺序）

1. **冻结一次 V7.1**：记录当前 host commit / 回归结果。  
2. **扩展 tone QA**：把 Wisewave 四条中文用例写入 `qa-v11-tone-watchpoints.mjs`（或独立 `qa-v1.1-tone-mandarin.mjs`），与现有 `MANDARIN_LONELY_ACK`、长度、漂移词规则对齐。  
3. **Tone 改动小步提交**：每改 prompt/逻辑 → 跑 `qa-v7-first-response.mjs` + `qa-v7.1-family-state-regression.mjs` + V1.1 tone 脚本。  
4. **子女端**：继续按 `Child_UI_V1.1_Integration_Gaps.md` 做 pairing / `elderUserId` 与 CTA 接线；若需与对外文档一致，加 `/family/dashboard` scaffold。  
5. **Lumen**：用 Priority D 清单做一轮发布前签字。

---

*本文档仅同步 Wisewave 与仓库对照，不替代产品 Spec；数值与优先级以 Wisewave / 产品为准。*
