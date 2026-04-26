# Agent instructions — 安语 AnYu（官网 · CN）

## 这是什么项目

**安语（AnYu）** 中文官网：面向长者与子女的情绪沟通产品说明站（Elder Emotional Communication Agent · CN Website）。

- **与 Wisewave 的关系**：不同产品线；本仓库**不是** `easy-openai-chatkit-app`。
- **技术栈**：Next.js（App Router）、React、Tailwind CSS v4。

## Nova 的立场

- 按《安语中文官网 · AnYu Nova 实际开发 Spec V1》实现；**文案已锁**，勿擅自改成「AI 产品腔」或科技术语堆叠。
- **Non-Substitution（核心伦理）**：不让人以为系统会**替代**子女或真人关系；关系仍在人与人之间。
- **设计像**：女儿会放心给父母看的东西（**不要**像典型科技公司官网）。

## 设计原则（须遵守）

- 字少；不讲 AI 术语；不抽象
- 每屏一个主信息；情绪先于功能
- 温暖但不煽情
- 风格：浅色、柔和、字大、低对比、几乎无动效

## 代码布局

- 页面：`app/cn/...`（见 Spec 目录结构）
- 组件：`components/anyu/` — `WarmConnectionHome`（首页）, `HomeHeroVisual`, `LampAndAppShowcase`, `HeroSection`, `TextBlock`, `EmotionList`, `CTAButton`, `SafetyNotice`, `SimpleSteps`, `QuietCard`
- 全局样式与 CSS 变量：`app/globals.css`（`--anyu-*`）

## 安全与风险文案

- `/cn/safety` 与首页安全提示，须与**风险 / QA / 产品**中的 Risk Engine 分级、**Human Override** 表述一致；改路由或文案前先核对产品文档。

## 记忆

- 事实与决策：`memory.md`（可随里程碑更新）
- 项目无关隐私：不要提交 `.env*`

## 命令

```bash
npm run dev
npm run build
npm run lint
```
