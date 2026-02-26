# GitHub Pages 部署实现说明

本文档记录将本项目源码推送到 GitHub 仓库后，自动构建并将 `dist` 静态文件部署到 `gh-pages` 分支、通过 GitHub 提供的域名访问的完整实现步骤。

---

## 一、实现思路概览

1. **源码分支**（如 `main`）：只提交源码，不提交 `dist/` 和 `node_modules/`。
2. **推送触发**：每次推送到 `main` 时，由 GitHub Actions 自动执行「安装依赖 → 构建 → 将 `dist` 推送到 `gh-pages` 分支」。
3. **访问地址**：在仓库设置中把 GitHub Pages 来源选为 `gh-pages` 分支后，可通过 `https://<用户名>.github.io/<仓库名>/` 访问。

---

## 二、已完成的代码改动

### 1. 新增 `.gitignore`

**路径**：项目根目录 `.gitignore`

**作用**：避免将构建产物和依赖提交到源码分支。

**主要忽略项**：

- `node_modules/` — 依赖目录
- `dist/` — 构建输出
- `.env`、`.env.local` 等 — 本地环境变量
- 常见日志、编辑器、系统文件

### 2. 新增 GitHub Actions 工作流

**路径**：`.github/workflows/deploy-pages.yml`

**触发条件**：

- 向 `main` 分支推送时自动运行
- 或在 GitHub Actions 页面手动触发（workflow_dispatch）

**流程步骤**：

| 步骤 | 说明 |
|------|------|
| Checkout | 检出当前仓库源码 |
| Setup Node | 使用 Node 20，并启用 pnpm 缓存 |
| Setup pnpm | 安装 pnpm 9 |
| Install dependencies | 执行 `pnpm install --frozen-lockfile` |
| Build | 执行 `pnpm run build`，并传入 `GITHUB_REPOSITORY` 供 Vite 计算 base |
| Deploy to gh-pages | 使用 `peaceiris/actions-gh-pages` 将 `dist/` 目录内容推送到 `gh-pages` 分支（`force_orphan: true` 保持该分支仅包含最新静态文件） |

### 3. 修改 `vite.config.js` 的 base 配置

**作用**：GitHub 项目站点的 URL 为 `https://xxx.github.io/<仓库名>/`，即子路径部署，资源（JS/CSS）必须带上前缀，否则会 404。

**实现**：

- 在 **GitHub Actions** 中会设置环境变量 `GITHUB_REPOSITORY`（格式：`owner/repo`），据此计算 `base: '/<仓库名>/'`。
- **本地开发**未设置该环境变量时使用 `base: '/'`，不影响 `pnpm dev`。

**代码片段**：

```js
// GitHub Pages 使用子路径: /仓库名/ ，本地开发使用根路径
const base = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/'

export default defineConfig({
  base,
  // ...
})
```

---

## 三、你需要执行的操作步骤

### 步骤 1：初始化 Git 并提交（若尚未初始化）

```bash
git init
git add .
git commit -m "feat: add GitHub Pages deploy workflow"
```

### 步骤 2：在 GitHub 上创建仓库

在 GitHub 网站新建仓库（如仓库名为 `deepseek_web_pages`），**不要**勾选「Add a README」等初始化选项，保持空仓库。

### 步骤 3：添加远程并推送到 main

```bash
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git branch -M main
git push -u origin main
```

将 `<你的用户名>` 和 `<仓库名>` 替换为实际值。

### 步骤 4：开启 GitHub Pages

1. 打开仓库 **Settings → Pages**。
2. 在 **Build and deployment** 中：
   - **Source** 选择 **Deploy from a branch**
   - **Branch** 选择 **gh-pages**，目录选择 **/ (root)**
3. 点击 **Save**。

### 步骤 5：等待首次部署

- 推送后 GitHub Actions 会自动运行，将 `dist` 推到 `gh-pages` 分支。
- 首次部署或刚开启 Pages 时可能需要数分钟才能访问。
- 可在 **Actions** 页查看工作流运行状态。

---

## 四、访问地址

部署成功后，访问：

**https://\<你的用户名>.github.io/\<仓库名>/**

例如仓库名为 `deepseek_web_pages`、用户名为 `devlink` 时：

**https://devlink.github.io/deepseek_web_pages/**

---

## 五、注意事项

1. **仓库名与 base**：若仓库名与本地文件夹名不同，无需改代码，`base` 会根据 `GITHUB_REPOSITORY` 自动使用正确的仓库名。
2. **锁文件**：请确保 **pnpm-lock.yaml** 已提交到仓库，CI 使用 `pnpm install --frozen-lockfile` 依赖该文件。
3. **默认分支**：若你的默认分支不是 `main`（例如为 `master`），需在 `.github/workflows/deploy-pages.yml` 的 `on.push.branches` 中改为对应分支名。

---

## 六、相关文件清单

| 文件 | 说明 |
|------|------|
| `.gitignore` | 忽略 dist、node_modules 等，不纳入版本控制 |
| `.github/workflows/deploy-pages.yml` | 推送后自动构建并部署到 gh-pages |
| `vite.config.js` | 根据 `GITHUB_REPOSITORY` 设置 `base`，支持子路径访问 |
