import { getLanguage } from 'obsidian';
import { TranslationData, TranslationVars } from './types';
import ZoneScrollZoomPlugin from './main';

// Import locale files - these will be bundled by esbuild
import enTranslations from './locales/en.json';
import zhCNTranslations from './locales/zh-CN.json';

// === Locale Registry ===
// To add a new language:
//   1. Create src/locales/xx.json (copy from en.json and translate all values)
//   2. Import the JSON file above
//   3. Add an entry to BUILT_IN_LOCALES below
//   4. Add the Obsidian language code mapping in OBSIDIAN_LANG_MAP
//   5. Add an entry to LOCALE_META with native display name
//   6. Add option translations to all existing locale files under settings.language.options

interface LocaleMeta {
    code: string;
    name: string;
}

const LOCALE_META: LocaleMeta[] = [
    { code: 'en', name: 'English' },
    { code: 'zh-CN', name: '简体中文' },
];

const BUILT_IN_LOCALES: Record<string, TranslationData> = {
    en: enTranslations,
    'zh-CN': zhCNTranslations,
    // 'zh-TW': zhTWTranslations, // Add when Traditional Chinese is supported
};

// Maps Obsidian's getLanguage() return values to our locale codes
const OBSIDIAN_LANG_MAP: Record<string, string> = {
    en: 'en',
    zh: 'zh-CN',
    'zh-cn': 'zh-CN',
};

/**
 * Internationalization class for handling translations
 */
export class I18n {
    private plugin: ZoneScrollZoomPlugin;
    private lang: string = 'en';
    private translations: TranslationData;

    constructor(plugin: ZoneScrollZoomPlugin) {
        this.plugin = plugin;
        this.translations = BUILT_IN_LOCALES.en;
    }

    /**
     * Load translations based on user settings
     */
    load(): void {
        let userLang: string = this.plugin.settings.language || 'auto';

        if (userLang === 'auto') {
            const obsidianLang = getLanguage();
            userLang = OBSIDIAN_LANG_MAP[obsidianLang.toLowerCase()] || 'en';
        }

        this.lang = BUILT_IN_LOCALES[userLang] ? userLang : 'en';
        this.translations = BUILT_IN_LOCALES[this.lang] || BUILT_IN_LOCALES.en;
    }

    /**
     * Get translation by key with optional variable interpolation
     * @param key - Dot-separated translation key (e.g., 'settings.title')
     * @param vars - Variables to interpolate (e.g., { value: 100 })
     * @returns Translated string
     */
    t(key: string, vars: TranslationVars = {}): string {
        const keys = key.split('.');
        let value: unknown = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                return key;
            }
        }

        if (typeof value === 'string') {
            return value.replace(/\{([^}]+)\}/g, (_match: string, varName: string) => {
                return vars[varName] !== undefined ? String(vars[varName]) : _match;
            });
        }

        return key;
    }

    /**
     * Get current language code
     */
    getCurrentLang(): string {
        return this.lang;
    }

    /**
     * Get list of available locale codes with their native display names
     */
    static getAvailableLocales(): LocaleMeta[] {
        return [...LOCALE_META];
    }
}
