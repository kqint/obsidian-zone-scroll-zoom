import { TranslationData, TranslationVars, LanguageSetting } from './types';
import ZoneScrollZoomPlugin from './main';

// Import locale files - these will be bundled by esbuild
import enTranslations from '../locales/en.json';
import zhTranslations from '../locales/zh-CN.json';

/**
 * Internationalization class for handling translations
 */
export class I18n {
    private plugin: ZoneScrollZoomPlugin;
    private lang: LanguageSetting = 'en';
    private translations: TranslationData;

    // Built-in locales map - loaded from JSON files via esbuild
    private static readonly BUILT_IN_LOCALES: Record<string, TranslationData> = {
        en: enTranslations,
        zh: zhTranslations
    };

    constructor(plugin: ZoneScrollZoomPlugin) {
        this.plugin = plugin;
        this.translations = I18n.BUILT_IN_LOCALES.en;
    }

    /**
     * Load translations based on user settings
     */
    load(): void {
        // Get user setting language
        let userLang: string = this.plugin.settings.language || 'auto';
        
        // If auto, use Obsidian interface language
        if (userLang === 'auto') {
            const obsidianLang = window.localStorage.getItem('language');
            userLang = obsidianLang || 'en';
        }
        
        // Only support zh and en, default to en for other languages
        if (userLang.startsWith('zh')) {
            this.lang = 'zh';
        } else {
            this.lang = 'en';
        }

        // Load translations from built-in locales
        this.translations = I18n.BUILT_IN_LOCALES[this.lang] || I18n.BUILT_IN_LOCALES.en;
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
                return key; // Return key if translation not found
            }
        }
        
        if (typeof value === 'string') {
            // Replace variables like {value}
            return value.replace(/\{([^}]+)\}/g, (match: string, varName: string) => {
                return vars[varName] !== undefined ? String(vars[varName]) : match;
            });
        }
        
        return key;
    }

    /**
     * Get current language
     */
    getCurrentLang(): LanguageSetting {
        return this.lang;
    }
}
