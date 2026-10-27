本文件为项目开发规范，适用于 AI 助手及贡献者。**专用部分仅当当前开发项目类型匹配时生效，否则请忽略。**修改完代码更新项目理解。

---

## 通用规范（所有项目必须遵守）

### 1. README 规范

- **禁止使用 emoji**：所有 README 文件（包括中英文版本）不得包含任何 emoji 字符。
- **多语言支持**：必须提供英文版并命名为`README.md` ，中文版并命名为 `README.zh-CN.md`。
- **模板要求**：`.ai/README_TEMPLATE.md`（如未提供，则保持清晰、简洁的结构，包含项目简介、功能、安装、使用、配置、贡献等章节）。
- **内容一致性**：中英文版本内容应保持同步更新，仅语言不同。

### 2. 代码国际化（i18n）

- **用户可见文本**：代码中所有面向用户的字符串（如 UI 标签、提示信息、错误消息等）必须通过 i18n 机制加载，**禁止硬编码**。
- **语言文件目录**：`src/locales/`
  - 支持语言要求：必须使用`en.json`（英语）、`zh-CN.json`（简体中文）的命名。
  - 文件格式：JSON 键值对，键名采用 `kebab-case` 或 `camelCase`，建议按功能模块嵌套。
- **调用方式**：在代码中使用统一的 i18n 函数，例如 `t("key.path")`。具体实现根据项目技术栈确定（如 `i18next`、`chrome.i18n` 或自定义 loader）。

### 3. 版本管理
禁止未经允许的情况下提交或推送，必须询问

---

## 专用规范

### 条件：Obsidian 插件开发

当项目为 Obsidian 插件时，除通用规范外，还需遵守以下规则：

- **构建要求**：开发完成后，**必须**使用构建工具（如 `esbuild`、`rollup`、`webpack`）将 `src/locales/` 目录下的所有语言文件打包进最终的 `main.js` 中。不允许在运行时从外部加载语言文件。
- **禁止直接内联**：**严禁**在 `main.js` 中以硬编码对象（如 `BUILT_IN_LOCALES = { en: {...}, zh: {...} }`）的方式直接嵌入语言数据。必须通过构建工具从独立的 `src/locales/*.json` 文件读取并打包，保持语言文件的独立性和可维护性。
- **版本管理**：
  - 每次发布前，**必须**更新 `manifest.json` 中的 `version` 字段（遵循语义化版本 `major.minor.patch`），禁止带v。
  - 构建产物 `main.js` **必须**添加到 `.gitignore`，不提交至 GitHub 仓库。
  - 发布时，通过 GitHub Releases 或 CI/CD 附上构建好的 `main.js`。

- **插件清单**：`manifest.json` 必须包含 `id`、`name`、`version`、`minAppVersion` 等标准字段。

- **代码规范**：
  - Only these console methods are allowed: warn, error, debug.
  - For a consistent UI use `new Setting(containerEl).setName(...).setHeading()` instead of creating HTML heading elements directly.
  - 禁止没有 'await' 表达式的异步箭头函数。
  - 禁止使用 `any` 类型，变量或函数参数必须定义明确的 TypeScript 类型或接口。

## 项目理解

### 构建流程
1. **开发模式**：`npm run dev` → `esbuild` 监听文件变化，生成带 sourcemap 的 `main.js`
2. **生产构建**：`npm run build` → `esbuild` 打包 TypeScript 和 JSON 文件，生成优化后的 `main.js`
3. **语言文件打包**：`esbuild` 通过 `loader: { '.json': 'json' }` 将 `src/locales/*.json` 内联到 bundle 中

### 配置说明
- **用户配置**：保存在 `data.json` 中（自动生成）
- **插件清单**：`manifest.json` 定义插件元数据
- **构建配置**：`esbuild.config.mjs` 定义打包规则
- **TypeScript 配置**：`tsconfig.json` 启用严格类型检查

### 依赖关系
- **生产依赖**：无（纯 Obsidian API 调用）
- **开发依赖**：`obsidian`（类型定义）、`esbuild`、`typescript`、`tslib`、`@types/node`

### 注意事项
- 插件仅支持桌面版 Obsidian（依赖 `electron` 的 `webFrame` API）
- **区域缩放行为**：
  - 鼠标在编辑区 → 调整编辑器字体大小（统一走 `plugin.getEditorFontSize()` / `plugin.setEditorFontSize()`）
  - 鼠标在其他区域 → 调整全局界面缩放（通过 `webFrame.getZoomFactor()` / `webFrame.setZoomFactor()`）
- **基础字号 API 双路径（重要）**：
  - Obsidian 1.14.2 起，基础字号从 `appearance.json`（`vault.getConfig('baseFontSize')`）迁移到**设备本地存储**（`app.saveLocalStorage('base-font-size', n)`），
    并新增内部 API `app.getBaseFontSize()` / `app.setBaseFontSize(n)`；旧写法 `setConfig` 仍会写 `appearance.json`，但不再影响渲染，导致字体缩放“看起来失效”。
  - 因此 `main.ts` 中 `getEditorFontSize()` / `setEditorFontSize()` 优先探测新 API，不存在时才回退到旧的 `vault.getConfig` + `app.updateFontSize()`，兼容 1.14.2 之前版本。
  - 字号范围固定为 10–30（与 Obsidian 设置页滑块及内部 clamp 一致，默认 16）；`setBaseFontSize()` 内部会自动刷新 UI，无需再调 `updateFontSize()`。
  - `app.updateFontSize()` 的实际作用：设置 `body { --font-text-size }` 与 `html { font-size: calc(Npx * var(--preferred-text-scale,1)) }`。
- **设置页 API（重要）**：
  - Obsidian 1.13.0 起设置项改为声明式：必须实现 `PluginSettingTab.getSettingDefinitions()`，否则设置项不会出现在设置搜索里；
    控件值通过覆写 `getControlValue(key)` / `setControlValue(key, value)` 读写，`display()` 已 deprecated。
  - 本插件**只走声明式路径**，不再实现 `display()`；因此 `minAppVersion` 已提升到 **1.13.0**，
    审核规则 `obsidianmd/no-unsupported-api` 要求 `minAppVersion` 不低于所用 API 的 `@since`，新增 API 调用时务必同步。
  - 声明式 API 需要 `obsidian` 类型包 ≥ 1.13.0（当前 1.14.4），改这一层时注意同步 `package-lock.json`。
  - 修改语言时 `setControlValue` 会 `i18n.load()` 后延迟调用 `this.update()` 重建定义（标签需重新翻译）。
- **DOM 规范**：创建元素统一用 Obsidian 的 `createDiv` / `createEl` / `createSpan`（审核规则 `obsidianmd/prefer-create-el` 禁止 `document.createElement`），
  样式用 `setCssStyles()`，文本用 `setText()`。
- **常量集中管理**：字号与缩放步长的上下限、默认值统一放在 `src/constants.ts`，避免 `main.ts` 与 `settings.ts` 循环引用。
- 国际化系统使用 `I18n.getAvailableLocales()` 动态生成语言下拉菜单，新增语言无需修改 settings.ts
