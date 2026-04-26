<安语 · 心桥系统》
Elder Emotional Communication Agent
✅ Nova Full Implementation Spec · V1（可直接开发）
0. 系统一句话定义
这是一个：
帮助长者表达情绪、降低孤独、连接家人的情感沟通系统
不是聊天机器人
不是心理咨询
不是陪伴替代品
1. 系统架构（必须按此实现）
User Input
   ↓
Risk Engine（先执行）
   ↓
Mode Router
   ↓
Response Strategy Layer（生成逻辑）
   ↓
Lumen QA Engine（安全拦截）
   ↓
Response Output
   ↓
Emotion Trend + Risk Log
2. 核心模块划分
2.1 Chat Agent（情绪陪伴）
模式：
emotional_listening
supportive_response
2.2 Reframe Agent（沟通重构）
communication_reframe
2.3 Family Message Agent
family_message
2.4 Risk Engine（最高优先级）
L0-L4 风险识别 + 预警系统
Risk Engine 必须独立运行，且永远先于生成逻辑。
3. API 设计（必须实现）
3.1 主入口
POST /api/elder-chat/message
Request
{
  "elderUserId": "elder_123",
  "sessionId": "session_abc",
  "message": "我今天很孤单",
  "locale": "zh-CN"
}
3.2 内部执行流程
1. 调用 risk/evaluate
2. 判断 riskLevel

IF L3 / L4:
   → block normal chat
   → 进入安全模式
   → 触发 alert
   → 返回安全回应

ELSE:
   → emotion 分类
   → modeRouter
   → responseStrategy
   → Lumen QA
   → 返回结果
3.3 返回结构
type Response = {
  mode: string;
  risk: {
    level: "L0" | "L1" | "L2" | "L3" | "L4";
  };
  emotion: string[];
  response: string;
  suggestedAction?: string;
}
4. Risk Engine（必须先做）
4.1 API
POST /api/risk/evaluate
4.2 风险规则（硬编码）
“我不想活了” → L4
“我想死” → L4
“活着没意思” → ≥ L3
“我撑不下去了” → ≥ L3
“我找不到路” → L3
“我头晕站不稳” → L3
4.3 行为规则
IF risk >= L3:
  禁止继续普通聊天
  必须建议联系真人
5. Mode Router
function routeMode(message: string, riskLevel: string) {
  if (riskLevel === "L4") return "urgent_alert";
  if (riskLevel === "L3") return "safety_risk";

  if (message.includes("怎么说")) return "communication_reframe";
  if (message.includes("帮我发")) return "family_message";

  return "emotional_listening";
}
6. 🔥 Response Strategy Layer（核心锁死）
⚠️ Nova 必须按模板生成
⚠️ 禁止自由发挥
6.1 情绪陪伴（emotional_listening）
结构：

1. 共情
2. 简单描述
3. 结束

模板：

听起来你有点【情绪】。
这种感觉其实很【贴近描述】。
6.2 supportive_response
结构：

1. 认可状态
2. 提供轻支持

例：

你现在可能有点难受。
可以先慢一点，让自己稳一稳。
6.3 沟通重构（communication_reframe）
规则：

- 去指责
- 保留情绪
- 用“我”

输出：

可以这样说：
“我最近有点……其实我希望……”
6.4 家庭消息（family_message）
结构：

我最近有点【感受】。
如果你有空，【请求】。
不用有压力。
6.5 ⚠️ 安全模式（safety_risk / urgent_alert）
结构：

1. 表达担心
2. 不否定情绪
3. 强制引导真人
4. 不继续聊天

模板：

我有点担心你现在的状态。
你不需要一个人撑着。

请联系家人或一个你信任的人。
如果可以，现在就打个电话。
7. Lumen QA Engine（必须接入）
调用位置：
response → QA → 才能发送
必拦截内容
你应该
你必须
别想太多
要积极一点
只有我懂你
我会一直陪着你
他们就是不关心你
核心规则
任何一项 FAIL → 阻断输出
fallback
低风险：
“我想换一种更简单的方式说…”

高风险：
“请马上联系家人或紧急联系人…”
8. 前端设计（长者端）
8.1 主界面
今天想说点什么？

[输入框]

按钮：
[我有点孤单]
[我想联系家人]
[我不知道怎么说]
8.2 UI规则
字体大
按钮少
无复杂菜单
无专业词
9. 数据结构（Prisma）
（直接可用）
model ElderUser { id String @id @default(cuid()) }
model RiskEvent { id String @id @default(cuid()) }
model EmotionTrend { id String @id @default(cuid()) }
model ConsentSetting { id String @id @default(cuid()) }
model EmergencyContact { id String @id @default(cuid()) }
10. Build 顺序（必须按此）
1. riskClassifier.ts
2. /api/risk/evaluate
3. modeRouter.ts
4. responseStrategy（模板系统）
5. /api/elder-chat/message
6. Lumen QA Engine
7. 数据库
8. alert系统
9. 前端页面
11. 系统核心原则（必须写入代码注释）
AI 不替代人
AI 不制造依赖
AI 不做决定
AI 不站队
AI 在危险时让位给人
来源于安全伦理框架（Non-Substitution / Anti-Dependency / Human Override）
12. 最重要的一句话（写给 Nova）
This system is not about making AI smarter.

It is about making sure AI never causes harm.
✅ 最终状态说明
这份 Spec：
✔ 可以直接开发
✔ 已包含安全底层
✔ 已锁定输出逻辑
✔ 已可进入真实测试
