# Obsidian Zone Scroll Zoom

[简体中文](https://github.com/kqint/obsidian-zone-scroll-zoom/blob/main/docs/README.zh-CN.md) | 繁體中文 | [English](https://github.com/kqint/obsidian-zone-scroll-zoom/blob/main/README.md)

一個 Obsidian 插件，透過快捷鍵縮放整體介面或字型大小，縮放行為會跟隨滑鼠位置自適應。

![演示](../assets/demo.gif)

## 功能

- **快捷鍵縮放**：使用快捷鍵在不同區域實現縮放（預設使用 Ctrl + 滾輪）。
- **縮放區域區分**：
  - **滑鼠在編輯區**：縮放**編輯器字型大小**。
  - **滑鼠在非編輯區**：縮放**整個 Obsidian 介面**（包括側邊欄、選單）。
- **即時狀態顯示**：螢幕上方顯示簡潔的 **OSD 提示框**，即時回饋目前比例/大小。
- **自訂設定**：可在設定中調整縮放精度，修改快捷鍵（支援 Ctrl/Cmd, Shift, Alt），個人配置自動儲存至 `data.json`。
- **多語言支援**：支援英文、簡體中文和繁體中文，可在設定中切換語言或跟隨 Obsidian 系統語言。
- **縮放比例重設**：在設定頁提供按鈕，快速恢復預設字型 (16px) 或介面比例 (100%)。


>[!note]
>使用插件前，先在設定 → 外觀中，關閉「快速調整字型大小」選項。

## 安裝

#### 社群插件市場安裝

在 Obsidian 設定 → 第三方插件 → 瀏覽，搜尋 「Zone Scroll Zoom」，安裝並啟用。

或者在[社群插件頁面](https://community.obsidian.md/plugins/zone-scroll-zoom)點擊 「Add to Obsidian」 安裝。

#### BRAT 安裝

1. 安裝 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件。
2. 開啟 BRAT 設定 → `Add Beta Plugin`。
3. 輸入倉庫地址：`kqint/obsidian-zone-scroll-zoom`。

#### 手動安裝

1. 下載 [releases/latest](https://github.com/kqint/obsidian-zone-scroll-zoom/releases/latest) 中的 `main.js` 和 `manifest.json`。
2. 在 `.obsidian/plugins/` 目錄下新建 `obsidian-zone-scroll-zoom` 資料夾，將 `main.js` 和 `manifest.json` 放入該目錄。
3. 在 Obsidian 設定中啟用插件。

## 國際化

語言原始檔位於 `src/locales/`：

- `src/locales/en.json`
- `src/locales/zh-CN.json`
- `src/locales/zh-TW.json`

### 新增語言

1. 複製 `src/locales/en.json` 為 `src/locales/xx.json`，翻譯所有字串**值**（保留鍵名不變）。
2. 在 `src/i18n.ts` 中註冊你的語言，新增：
   - JSON 檔案的 import 語句
   - `BUILT_IN_LOCALES` 中的條目
   - `OBSIDIAN_LANG_MAP` 中的語言代碼映射
   - `LOCALE_META` 中的語言元資料
3. 在所有現有語言檔案中的 `settings.language.options` 下新增新語言選項名稱。
4. 執行 `npm run build` 並測試。

詳細步驟見 [CONTRIBUTING.md](https://github.com/kqint/obsidian-zone-scroll-zoom/blob/main/CONTRIBUTING.md)。

## 授權條款

[MIT License](https://github.com/kqint/obsidian-zone-scroll-zoom/blob/main/LICENSE)
