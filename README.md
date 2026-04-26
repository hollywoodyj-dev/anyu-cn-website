# 安语 AnYu — 中文官网

Elder Emotional Communication Agent · 官网（V1 静态说明站）。

## 开发

```bash
cd c:\github\anyu-cn-website
npm install
npm run dev
```

浏览器打开 <http://localhost:3000>，根路径会重定向到 `/cn`。

## 在 Cursor 中打开

**File → Open Folder** → 选择 `c:\github\anyu-cn-website`（作为独立工作区根目录即可）。

## 规范与记忆

- 开发说明与伦理约束：`AGENTS.md`
- 事实与交接短记：`memory.md`
- 产品全量说明：见仓库外你提供的《安语中文官网 · AnYu Nova 实际开发 Spec V1》

## 技术

- Next.js 15、React 19、Tailwind CSS 4
- 页面均在 `app/cn/…`
