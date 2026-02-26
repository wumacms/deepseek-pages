# Tailwind CSS 与 Vite 集成说明

本文档说明本项目如何按 [Tailwind CSS 官方文档 - Using Vite](https://tailwindcss.com/docs/installation/using-vite) 完成集成与配置优化。

## 1. 使用官方 Vite 插件

- **安装**：增加 `@tailwindcss/vite`，并将 `tailwindcss` 升级到 v4。
- **移除**：不再使用 `postcss`、`autoprefixer`（由 `@tailwindcss/vite` 接管）。

## 2. 修改的配置

| 文件 | 变更 |
|------|------|
| **vite.config.js** | 增加 `import tailwindcss from '@tailwindcss/vite'`，在 `plugins` 中加入 `tailwindcss()`。 |
| **src/style.css** | 将原来的 `@tailwind base/components/utilities` 改为一行：`@import "tailwindcss";`。 |
| **package.json** | 使用 `tailwindcss@^4`、`@tailwindcss/vite@^4`，删除 `autoprefixer`、`postcss`。 |

## 3. 删除的文件

- **tailwind.config.js**：v4 在 Vite 插件下会自动扫描项目中的类名，无需单独 content 配置。
- **postcss.config.js**：样式由 Vite 插件处理，不再需要 PostCSS 配置。

## 4. 效果

- 配置更简单，只维护 Vite 和一处 CSS 入口。
- 与官方推荐的 Vite 集成方式一致，后续升级和排查问题更方便。
- 依赖更少，构建链路更清晰。

## 参考

- [Installing Tailwind CSS with Vite](https://tailwindcss.com/docs/installation/using-vite)
