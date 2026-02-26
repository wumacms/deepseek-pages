# 企业落地页模板展厅

使用 Vue 3 + Vite + Tailwind CSS + pnpm 构建的首页，用于展示 `pages` 目录下的企业落地页 HTML 模板。

## 功能

- **响应式网格**：自适应多列展示，无分页
- **卡片内容**：封面图、模板标题、标签、预览按钮
- **搜索与筛选**：按标题或标签搜索，按标签筛选
- **预览**：弹窗内 iframe 预览或新窗口打开

## 开发

```bash
pnpm install
pnpm run dev
```

访问 http://localhost:5173/ 。模板 HTML 通过开发服务器挂载在 `/pages/*.html`。

## 构建

```bash
pnpm run build
```

会先执行 `extract-templates` 从 `pages/*.html` 提取标题与标签生成 `src/data/templates.json`，再将 `pages` 目录复制到 `dist/pages`。

## 更新模板列表

新增或修改 `pages` 内 HTML 后，重新生成元数据：

```bash
pnpm run extract-templates
```

## 技术栈

- Vue 3（Composition API + script setup）
- Vite 5
- Tailwind CSS 4（[官方 Vite 插件](https://tailwindcss.com/docs/installation/using-vite) `@tailwindcss/vite`，纯工具类）
- pnpm

Tailwind 与 Vite 的集成说明见 [docs/tailwind-vite-setup.md](docs/tailwind-vite-setup.md)。
