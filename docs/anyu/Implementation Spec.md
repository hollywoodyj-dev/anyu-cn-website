《安语系统 · 注册流程 + Consent机制 + 法律确认流程》
Nova Implementation Spec · V1
0. 核心原则（写进代码注释）
Consent is not a checkbox.

It is a boundary agreement between system, elder, and family.
1. 用户角色（必须区分）
1. 长者（ElderUser）
2. 子女 / 家人（FamilyUser）
3. 护理人员（Caregiver，可选）
2. 注册入口设计
2.1 推荐路径（必须）
👉 子女先注册 → 再绑定长者
原因：
长者不适合复杂注册
Consent 需要家人参与
风险通知需要接收方
3. 注册流程（完整）
Step 1：子女注册
页面：/register/family
输入：
姓名
手机号 / Email
密码
Step 2：创建长者档案
页面：/register/elder-profile
长者姓名
年龄（可选）
关系（女儿 / 儿子 / 配偶）
语言（默认中文）
Step 3：设置紧急联系人（必须）
联系人1（必填）
联系人2（推荐）
字段：
姓名
关系
电话
通知方式（SMS / 电话 / App）
Step 4：Consent（⚠️ 最重要）
页面：/register/consent
4. Consent 结构（必须分层）
4.1 情绪数据使用授权
我同意系统记录情绪趋势，
用于帮助识别状态变化。
4.2 风险预警授权（核心）
当系统检测到可能风险时：

☑ 通知家人
☑ 通知护理人员（可选）
4.3 触发等级设置
从哪个等级开始通知？

○ Level 2（较敏感）
● Level 3（推荐）
○ Level 4（仅紧急）
👉 默认：Level 3
4.4 原话共享授权
是否允许发送原话给家人？

○ 不允许（默认）
● 仅发送整理后的信息
○ 允许完整原话
4.5 长者知情确认（重要）
我已向长者说明：

系统会在特定情况下提醒家人
不会替代真实关系
👉 必须勾选
5. 法律确认（Disclaimer Acceptance）
页面：/register/legal
必须勾选：
☑ 我已阅读免责声明
☑ 我理解本系统不是医疗或紧急服务
☑ 我理解风险识别无法100%保证
未勾选 → 禁止进入系统
if (!consentAccepted) {
  blockAccess();
}
6. 长者端激活流程（安语灯）
Step 1：设备绑定
扫描二维码 / 输入设备码
Step 2：语音说明（必须）
设备自动播报：
这个设备可以帮你把话整理出来，
也可以在需要时提醒你的家人。

它不会替代他们，
只是帮助你更容易说出来。
Step 3：长者确认（简单版）
按一下按钮表示“知道了”
7. Consent 数据结构（Prisma）
model ConsentSetting {
  id String @id @default(cuid())

  elderUserId String @unique
  elderUser ElderUser @relation(fields: [elderUserId], references: [id])

  emotionTrackingEnabled Boolean @default(true)

  riskAlertEnabled Boolean @default(true)
  autoNotifyFromLevel String @default("L3")

  allowRawMessageShare Boolean @default(false)

  allowFamilyNotify Boolean @default(true)
  allowCaregiverNotify Boolean @default(false)

  elderInformed Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
8. Consent API
获取
GET /api/consent
更新
PATCH /api/consent
{
  "riskAlertEnabled": true,
  "autoNotifyFromLevel": "L3",
  "allowRawMessageShare": false
}
撤销授权
POST /api/consent/revoke
9. 风险触发时的 Consent 检查
逻辑
if (riskLevel >= consent.autoNotifyFromLevel) {
  if (consent.riskAlertEnabled) {
    triggerNotification();
  }
}
特殊规则（必须）
L4（紧急）：

不能完全关闭通知
只能更换联系人
👉 这是安全底线
10. 子女端确认流程
当收到第一次风险提醒时：
必须弹出：
你正在接收关于家人的情绪与安全提醒。

这不代表紧急情况，
但建议你主动联系。
11. UI关键点
Consent 页面
必须：

清楚
可读
不恐吓
不复杂
不允许：
长段法律文字
复杂条款
难理解表达
12. Lumen QA 必测点
必测 10 项
1. 未授权是否不会通知
2. L3 是否触发通知
3. L4 是否强制通知
4. 是否尊重原话共享设置
5. 是否记录 consent 修改
6. 是否允许撤销
7. 是否正确提示长者
8. 是否避免误触发
9. 是否避免隐私泄露
10. 是否避免恐慌语言
13. 安全原则（写进系统）
Consent 优先于功能
安全优先于体验
人类优先于AI
14. 给 Nova 的一句话
Do not treat consent as a form.

Treat it as a protection layer for real human relationships.
15. 最终效果
这套流程完成后：
✔ 用户知道系统在做什么
✔ 子女知道自己责任
✔ 长者不会被“偷偷监控”
✔ 系统不会越界
✔ 产品可以进入真实家庭
