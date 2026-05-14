# Obsidian Zone Scroll Zoom

[简体中文](README.zh-CN.md) | English

An Obsidian plugin that scales the interface and font with keyboard shortcuts, where the zoom behavior adapts to your mouse position.

![Demo](assets/demo.gif)

## Features

- **Shortcut Zoom**: Use keyboard shortcuts to zoom in different areas (default: Ctrl + Scroll Wheel).
- **Zone-Based Zooming**:
  - **Mouse in Editor Area**: Zooms the **editor font size**.
  - **Mouse in Non-Editor Area**: Zooms the **entire Obsidian interface** (including sidebar, menus).
- **Real-time Status Display**: A clean **OSD indicator** appears at the top of the screen, showing the current scale/font size in real time.
- **Customizable Settings**: Adjust zoom precision in settings, modify shortcuts (supports Ctrl/Cmd, Shift, Alt). Personal settings are automatically saved to `data.json`.
- **Multi-language Support**: Supports Simplified Chinese and English. Switch languages in settings or follow Obsidian's system language.
- **Reset Zoom Ratio**: A button in the settings page to quickly restore default font size (16px) or interface scale (100%).

> [!note]
> Before using this plugin, go to Settings → Appearance and disable "Quick font size adjustment".

## Installation

#### Community Plugin Marketplace

Open Obsidian Settings → Community Plugins → Browse, search "Zone Scroll Zoom", install and enable.

Or visit the [plugin page](https://community.obsidian.md/plugins/zone-scroll-zoom) and click "Add to Obsidian".

#### BRAT Installation

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat).
2. Open BRAT settings → `Add Beta Plugin`.
3. Enter repository: `kqint/obsidian-zone-scroll-zoom`.

#### Manual Installation

1. Download `main.js` and `manifest.json` from [releases/latest](https://github.com/kqint/obsidian-zone-scroll-zoom/releases/latest).
2. Create an `obsidian-zone-scroll-zoom` folder inside `.obsidian/plugins/`, and place `main.js` and `manifest.json` into this folder.
3. Enable the plugin in Obsidian settings.

## Internationalization

Language source files are located in `src/locales/`:

- `src/locales/en.json`
- `src/locales/zh-CN.json`

### Adding a New Language

1. Copy `src/locales/en.json` to `src/locales/xx.json` and translate all string **values** (keep the keys as-is).
2. In `src/i18n.ts`, register your locale by adding:
   - An import for your JSON file
   - An entry in `BUILT_IN_LOCALES`
   - Obsidian language code mappings in `OBSIDIAN_LANG_MAP`
   - Locale metadata in `LOCALE_META`
3. Add the locale option name to all existing locale files under `settings.language.options`.
4. Run `npm run build` and test.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the detailed step-by-step guide.

## License

[MIT License](LICENSE)