# Obsidian Zone Scroll Zoom

简体中文 | [繁體中文](https://github.com/kqint/obsidian-zone-scroll-zoom/blob/main/docs/README.zh-TW.md) | [English](https://github.com/kqint/obsidian-zone-scroll-zoom/blob/main/README.md)

一个 Obsidian 插件，通过快捷键缩放整体界面或字体大小，缩放行为会跟随鼠标位置自适应。

![演示](../assets/demo.gif)

## 功能

- **快捷键缩放**：使用快捷键在不同的区域实现缩放（默认使用 Ctrl + 滚轮）。
- **缩放区域区分**：
  - **鼠标在编辑区**：缩放**编辑器字体大小**。
  - **鼠标在非编辑区**：缩放**整个 Obsidian 界面**（包括侧边栏、菜单）。
- **实时状态显示**：屏幕上方显示简洁的 **OSD 提示框**，实时反馈当前比例/大小。
- **自定义设置**：可在设置中调整缩放精度，修改快捷键（支持 Ctrl/Cmd, Shift, Alt），个人配置自动保存到`data.json`。
- **多语言支持**：支持英文、简体中文和繁体中文，可在设置中切换语言或跟随 Obsidian 系统语言。
- **缩放比例重置**：在设置页提供按钮，快速恢复默认字体 (16px) 或界面比例 (100%)。


>[!note]
>使用插件前，先在设置 → 外观中，关闭“快速调整字体大小”选项。

## 安装

#### 社区插件市场安装

在 Obsidian 设置 → 第三方插件 → 浏览，搜索 “Zone Scroll Zoom”，安装并启用。

或者在[社区插件页面](https://community.obsidian.md/plugins/zone-scroll-zoom)点击 “Add to Obsidian” 安装。

#### BRAT 安装

1. 安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件。
2. 打开 BRAT 设置 → `Add Beta Plugin`。
3. 输入仓库地址: `kqint/obsidian-zone-scroll-zoom`。

#### 手动安装

1. 下载 [releases/latest](https://github.com/kqint/obsidian-zone-scroll-zoom/releases/latest) 中的 `main.js` 和 `manifest.json`。
2. 在 `.obsidian/plugins/` 目录下新建 `obsidian-zone-scroll-zoom` 文件夹，将 `main.js` 和 `manifest.json` 放入该目录。
3. 在 Obsidian 设置中启用插件。

## 国际化

语言源文件位于 `src/locales/`：

- `src/locales/en.json`
- `src/locales/zh-CN.json`
- `src/locales/zh-TW.json`

### 新增语言

1. 复制 `src/locales/en.json` 为 `src/locales/xx.json`，翻译所有字符串**值**（保留键名不变）。
2. 在 `src/i18n.ts` 中注册你的语言，添加：
   - JSON 文件的 import 语句
   - `BUILT_IN_LOCALES` 中的条目
   - `OBSIDIAN_LANG_MAP` 中的语言代码映射
   - `LOCALE_META` 中的语言元数据
3. 在所有现有语言文件中的 `settings.language.options` 下添加新语言选项名。
4. 运行 `npm run build` 并测试。

详细步骤见 [CONTRIBUTING.md](https://github.com/kqint/obsidian-zone-scroll-zoom/blob/main/CONTRIBUTING.md)。

## 许可证

[MIT License](https://github.com/kqint/obsidian-zone-scroll-zoom/blob/main/LICENSE)
