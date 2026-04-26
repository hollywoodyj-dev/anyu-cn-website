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

## 部署到 Vercel（新建项目并连 GitHub）

仓库：<https://github.com/hollywoodyj-dev/anyu-cn-website>。在 Cursor 里无法替你完成网页登录，请在本机浏览器按下面做一遍即可。

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard) 并登录。
2. **Add New… → Project**（或 **Import**）。
3. **Import Git Repository**：选中 GitHub 上的 **`hollywoodyj-dev/anyu-cn-website`**（若列表里没有，点 **Adjust GitHub App Permissions** 或 **Configure** 给 Vercel 授权该仓库）。
4. **Configure Project**：
   - **Framework Preset**：Next.js（一般会自动识别）。
   - **Root Directory**：`.`（默认即可）。
   - **Build Command**：`npm run build`（默认即可）。
   - **Output Directory**：留空（Next 默认由 Vercel 处理）。
5. 点 **Deploy**。完成后会得到 `*.vercel.app` 预览域名；可在项目 **Settings → Domains** 里绑定自定义域名。

可选（本机 CLI）：安装并登录后可在仓库根目录执行 `npx vercel link` 与 `npx vercel` 做预览部署；链接信息在 `.vercel/`（已写入 `.gitignore`，勿提交）。

官方文档：[Import an existing project from Git](https://vercel.com/docs/getting-started-with-vercel/import)。
