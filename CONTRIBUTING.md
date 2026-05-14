# Contributing to Obsidian Zone Scroll Zoom

Thanks for your interest in contributing! Here's how to get started.

## Reporting Issues

- Search [existing issues](https://github.com/kqint/obsidian-zone-scroll-zoom/issues) before opening a new one.
- Include your Obsidian version, OS, and steps to reproduce the bug.
- For feature requests, describe the use case and expected behavior.

## Development Setup

```bash
git clone https://github.com/kqint/obsidian-zone-scroll-zoom.git
cd obsidian-zone-scroll-zoom
npm install
npm run dev    # watch mode for development
npm run build  # production build
```

Copy or symlink the repo into your vault's `.obsidian/plugins/` folder and reload Obsidian to test changes.

## Submitting Pull Requests

1. Fork the repository and create a feature branch from `main`.
2. Make your changes and verify they work in Obsidian.
3. Run `npm run build` to ensure the build succeeds.
4. Submit a PR with a clear description of the change and its motivation.

## Adding a New Language

Language files are in `src/locales/`. Each file contains the translated UI strings for one locale. To add a new language, follow these steps:

### Step 1: Create the locale file

Copy `src/locales/en.json` to `src/locales/xx.json` (use the language code, e.g., `ja.json` for Japanese). Translate all string **values** — do NOT translate the JSON keys. Keys like `"name"`, `"desc"`, `"placeholder"` must remain in English.

### Step 2: Register the locale in `src/i18n.ts`

Make four changes to [src/i18n.ts](src/i18n.ts):

- **Import** the JSON file at the top of the file
- **BUILT_IN_LOCALES** — add an entry mapping the locale code to the imported data
- **OBSIDIAN_LANG_MAP** — map Obsidian's `getLanguage()` return value(s) to your locale code
- **LOCALE_META** — add `{ code, name }` with the language's native name

### Step 3: Add the language option to ALL locale files

Each locale file has a `settings.language.options` section that provides display names for the language dropdown. The convention is to show each language in its **native name**.

For example, adding Japanese requires updating:

**`en.json`** — add under `settings.language.options`:
```json
"ja": "日本語"
```

**`zh-CN.json`** — add under `settings.language.options`:
```json
"ja": "日本語"
```

**`ja.json`** (the new file) — the options section should show all language names in Japanese:
```json
"options": {
    "auto": "自動",
    "en": "English",
    "zh": "中国語",
    "ja": "日本語"
}
```

### Step 4: Verify

```bash
npx tsc --noEmit   # check for type errors
npm run build       # bundle into main.js
```

Reload Obsidian and test: switch to the new language in plugin settings, verify all UI text displays correctly.

### Example: adding Japanese

Here's the complete diff for adding Japanese (`ja`):

**`src/i18n.ts`:**
```diff
+ import jaTranslations from './locales/ja.json';

  const LOCALE_META: LocaleMeta[] = [
      { code: 'en', name: 'English' },
      { code: 'zh', name: '中文' },
+     { code: 'ja', name: '日本語' },
  ];

  const BUILT_IN_LOCALES: Record<string, TranslationData> = {
      en: enTranslations,
      zh: zhTranslations,
+     ja: jaTranslations,
  };

  const OBSIDIAN_LANG_MAP: Record<string, string> = {
      'en': 'en',
      'zh': 'zh',
      'zh-cn': 'zh',
      'zh-tw': 'zh',
+     'ja': 'ja',
  };
```

**`src/locales/en.json`** (excerpt — add to `settings.language.options`):
```diff
  "options": {
      "auto": "Auto",
      "en": "English",
      "zh": "中文",
+     "ja": "日本語"
  }
```

**`src/locales/zh-CN.json`** (excerpt — add to `settings.language.options`):
```diff
  "options": {
      "auto": "自动",
      "en": "English",
      "zh": "中文",
+     "ja": "日本語"
  }
```

## Code Style

- Use 4-space indentation.
- Keep functions small and focused.
- No unnecessary comments — let the code speak for itself.
- Run `npx tsc --noEmit` to check for type errors before committing.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
