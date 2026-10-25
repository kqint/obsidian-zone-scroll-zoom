import { App, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
import { webFrame } from 'electron';
import ZoneScrollZoomPlugin from './main';
import { I18n } from './i18n';
import { ModifierKey } from './types';
import {
    DEFAULT_FONT_SIZE,
    DEFAULT_ZOOM_STEP,
    MAX_ZOOM_STEP,
    MIN_ZOOM_STEP
} from './constants';

/** Interface zoom factor restored by the reset button. */
const RESET_ZOOM_FACTOR = 1.0;

/**
 * Setting tab for Zone Scroll Zoom plugin.
 *
 * Since Obsidian 1.13.0 settings are described declaratively through
 * `getSettingDefinitions()`, which is what makes them appear in the settings
 * search. `display()` is kept as an imperative fallback for older versions,
 * where the declarative API does not exist yet.
 */
export class ZoneScrollZoomSettingTab extends PluginSettingTab {
    plugin: ZoneScrollZoomPlugin;

    constructor(app: App, plugin: ZoneScrollZoomPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    /**
     * Declarative settings for Obsidian 1.13.0+ (settings search support).
     */
    getSettingDefinitions(): SettingDefinitionItem[] {
        const i18n = this.plugin.i18n;

        return [
            {
                type: 'group',
                heading: i18n.t('settings.title'),
                items: [
                    {
                        name: i18n.t('settings.language.name'),
                        desc: i18n.t('settings.language.desc'),
                        control: {
                            type: 'dropdown',
                            key: 'language',
                            options: this.buildLanguageOptions()
                        }
                    },
                    {
                        name: i18n.t('settings.modifierKey.name'),
                        desc: i18n.t('settings.modifierKey.desc'),
                        control: {
                            type: 'dropdown',
                            key: 'modifierKey',
                            options: {
                                ctrl: i18n.t('settings.modifierKey.options.ctrl'),
                                shift: i18n.t('settings.modifierKey.options.shift'),
                                alt: i18n.t('settings.modifierKey.options.alt'),
                                'ctrl+shift': i18n.t('settings.modifierKey.options.ctrl+shift'),
                                'ctrl+alt': i18n.t('settings.modifierKey.options.ctrl+alt'),
                                'shift+alt': i18n.t('settings.modifierKey.options.shift+alt')
                            }
                        }
                    },
                    {
                        name: i18n.t('settings.zoomStep.name'),
                        desc: i18n.t('settings.zoomStep.desc'),
                        control: {
                            type: 'text',
                            key: 'zoomStep',
                            placeholder: i18n.t('settings.zoomStep.placeholder'),
                            validate: (value: string) => this.validateZoomStep(value)
                        }
                    }
                ]
            },
            {
                name: i18n.t('settings.currentZoom.name'),
                desc: i18n.t('settings.currentZoom.desc', { value: this.getZoomPercent() }),
                render: (setting: Setting) => this.renderZoomReset(setting)
            },
            {
                name: i18n.t('settings.currentFontSize.name'),
                desc: i18n.t('settings.currentFontSize.desc', { value: this.plugin.getEditorFontSize() }),
                render: (setting: Setting) => this.renderFontSizeReset(setting)
            }
        ];
    }

    /**
     * Reads control values from the plugin settings.
     */
    getControlValue(key: string): unknown {
        switch (key) {
            case 'language':
                return this.plugin.settings.language;
            case 'modifierKey':
                return this.plugin.settings.modifierKey;
            case 'zoomStep':
                return String(this.plugin.settings.zoomStep);
            default:
                return super.getControlValue(key);
        }
    }

    /**
     * Persists control values into the plugin settings.
     */
    setControlValue(key: string, value: unknown): void | Promise<void> {
        switch (key) {
            case 'language': {
                if (typeof value !== 'string') {
                    return;
                }
                this.plugin.settings.language = value;
                this.plugin.i18n.load();
                // Labels are translated, so rebuild the definitions. Deferred
                // to avoid re-rendering the tab while the framework is still
                // applying this change.
                window.setTimeout(() => this.update(), 0);
                return this.plugin.saveSettings();
            }
            case 'modifierKey': {
                if (typeof value !== 'string') {
                    return;
                }
                this.plugin.settings.modifierKey = value as ModifierKey;
                return this.plugin.saveSettings();
            }
            case 'zoomStep': {
                this.plugin.settings.zoomStep = this.parseZoomStep(value);
                return this.plugin.saveSettings();
            }
            default:
                return;
        }
    }

    /**
     * Imperative fallback for Obsidian versions older than 1.13.0, where the
     * declarative settings API is not available.
     */
    display(): void {
        const { containerEl } = this;
        const i18n = this.plugin.i18n;
        containerEl.empty();

        new Setting(containerEl)
            .setName(i18n.t('settings.title'))
            .setHeading();

        // Language setting
        new Setting(containerEl)
            .setName(i18n.t('settings.language.name'))
            .setDesc(i18n.t('settings.language.desc'))
            .addDropdown(dropdown => {
                dropdown.addOption('auto', i18n.t('settings.language.options.auto'));
                for (const locale of I18n.getAvailableLocales()) {
                    const key = `settings.language.options.${locale.code}`;
                    const label = i18n.t(key);
                    dropdown.addOption(locale.code, label === key ? locale.name : label);
                }
                return dropdown
                    .setValue(this.plugin.settings.language)
                    .onChange((value: string) => {
                        this.plugin.settings.language = value;
                        void this.plugin.saveSettings();
                        this.plugin.i18n.load();
                        this.display();
                    });
            });

        // Modifier key setting
        new Setting(containerEl)
            .setName(i18n.t('settings.modifierKey.name'))
            .setDesc(i18n.t('settings.modifierKey.desc'))
            .addDropdown(dropdown => dropdown
                .addOption('ctrl', i18n.t('settings.modifierKey.options.ctrl'))
                .addOption('shift', i18n.t('settings.modifierKey.options.shift'))
                .addOption('alt', i18n.t('settings.modifierKey.options.alt'))
                .addOption('ctrl+shift', i18n.t('settings.modifierKey.options.ctrl+shift'))
                .addOption('ctrl+alt', i18n.t('settings.modifierKey.options.ctrl+alt'))
                .addOption('shift+alt', i18n.t('settings.modifierKey.options.shift+alt'))
                .setValue(this.plugin.settings.modifierKey)
                .onChange((value: string) => {
                    this.plugin.settings.modifierKey = value as ModifierKey;
                    void this.plugin.saveSettings();
                }));

        // Zoom step setting
        new Setting(containerEl)
            .setName(i18n.t('settings.zoomStep.name'))
            .setDesc(i18n.t('settings.zoomStep.desc'))
            .addText(text => text
                .setPlaceholder(i18n.t('settings.zoomStep.placeholder'))
                .setValue(String(this.plugin.settings.zoomStep))
                .onChange((value: string) => {
                    this.plugin.settings.zoomStep = this.parseZoomStep(value);
                    void this.plugin.saveSettings();
                }));

        // Current zoom display and reset
        this.renderZoomReset(new Setting(containerEl)
            .setName(i18n.t('settings.currentZoom.name')));

        // Current font size display and reset
        this.renderFontSizeReset(new Setting(containerEl)
            .setName(i18n.t('settings.currentFontSize.name')));
    }

    /**
     * Adds the description and reset button for the interface zoom row.
     */
    private renderZoomReset(setting: Setting): void {
        const i18n = this.plugin.i18n;

        setting
            .setDesc(i18n.t('settings.currentZoom.desc', { value: this.getZoomPercent() }))
            .addButton(btn => btn
                .setButtonText(i18n.t('settings.currentZoom.reset'))
                .setCta()
                .onClick(() => {
                    webFrame.setZoomFactor(RESET_ZOOM_FACTOR);
                    setting.setDesc(i18n.t('settings.currentZoom.desc', { value: 100 }));
                    this.plugin.showZoomTip(i18n.t('settings.currentZoom.resetTip'));
                }));
    }

    /**
     * Adds the description and reset button for the editor font size row.
     */
    private renderFontSizeReset(setting: Setting): void {
        const i18n = this.plugin.i18n;

        setting
            .setDesc(i18n.t('settings.currentFontSize.desc', { value: this.plugin.getEditorFontSize() }))
            .addButton(btn => btn
                .setButtonText(i18n.t('settings.currentFontSize.reset'))
                .setCta()
                .onClick(() => {
                    this.plugin.setEditorFontSize(DEFAULT_FONT_SIZE);
                    setting.setDesc(i18n.t('settings.currentFontSize.desc', { value: DEFAULT_FONT_SIZE }));
                    this.plugin.showZoomTip(i18n.t('settings.currentFontSize.resetTip'));
                }));
    }

    /**
     * Builds the language dropdown options: auto plus every bundled locale.
     */
    private buildLanguageOptions(): Record<string, string> {
        const i18n = this.plugin.i18n;
        const options: Record<string, string> = {
            auto: i18n.t('settings.language.options.auto')
        };

        for (const locale of I18n.getAvailableLocales()) {
            const key = `settings.language.options.${locale.code}`;
            const label = i18n.t(key);
            options[locale.code] = label === key ? locale.name : label;
        }

        return options;
    }

    /**
     * Validates a zoom step entered as text. Returns an error message to reject.
     */
    private validateZoomStep(value: string): string | void {
        const parsed = parseFloat(value);
        if (Number.isNaN(parsed) || parsed < MIN_ZOOM_STEP || parsed > MAX_ZOOM_STEP) {
            return this.plugin.i18n.t('settings.zoomStep.invalid', {
                min: MIN_ZOOM_STEP,
                max: MAX_ZOOM_STEP
            });
        }
        return;
    }

    /**
     * Parses a zoom step, falling back to the default when invalid.
     */
    private parseZoomStep(value: unknown): number {
        const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (!Number.isFinite(parsed) || parsed < MIN_ZOOM_STEP || parsed > MAX_ZOOM_STEP) {
            return DEFAULT_ZOOM_STEP;
        }
        return parsed;
    }

    /**
     * Current interface zoom level in percent.
     */
    private getZoomPercent(): number {
        return Math.round(webFrame.getZoomFactor() * 100);
    }
}
