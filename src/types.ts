/**
 * Plugin settings interface
 */
export interface ZoneScrollZoomSettings {
    zoomStep: number;
    modifierKey: ModifierKey;
    language: LanguageSetting;
}

/**
 * Modifier key options
 */
export type ModifierKey = 
    | 'ctrl' 
    | 'shift' 
    | 'alt' 
    | 'ctrl+shift' 
    | 'ctrl+alt' 
    | 'shift+alt';

/**
 * Language setting options
 */
export type LanguageSetting = 'auto' | 'zh' | 'en';

/**
 * Translation data structure
 */
export interface TranslationData {
    settings: {
        title: string;
        language: {
            name: string;
            desc: string;
            options: {
                auto: string;
                en: string;
                zh: string;
            };
        };
        modifierKey: {
            name: string;
            desc: string;
            options: {
                ctrl: string;
                shift: string;
                alt: string;
                'ctrl+shift': string;
                'ctrl+alt': string;
                'shift+alt': string;
            };
        };
        zoomStep: {
            name: string;
            desc: string;
            placeholder: string;
        };
        currentZoom: {
            name: string;
            desc: string;
            reset: string;
            resetTip: string;
        };
        currentFontSize: {
            name: string;
            desc: string;
            reset: string;
            resetTip: string;
        };
    };
    tips: {
        fontSize: string;
        zoomLevel: string;
    };
    console: {
        loading: string;
        settingsLoaded: string;
        settingsSaved: string;
        loadFailed: string;
        saveFailed: string;
    };
}

/**
 * Variables for translation interpolation
 */
export interface TranslationVars {
    [key: string]: string | number;
}
