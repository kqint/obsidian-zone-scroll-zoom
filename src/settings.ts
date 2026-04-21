import { App, PluginSettingTab, Setting } from 'obsidian';
import { webFrame } from 'electron';
import ZoneScrollZoomPlugin from './main';

/**
 * Setting tab for Zone Scroll Zoom plugin
 */
export class ZoneScrollZoomSettingTab extends PluginSettingTab {
    plugin: ZoneScrollZoomPlugin;

    constructor(app: App, plugin: ZoneScrollZoomPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        const i18n = this.plugin.i18n;
        containerEl.empty();

        containerEl.createEl('h2', { text: i18n.t('settings.title') });

        // Language setting
        new Setting(containerEl)
            .setName(i18n.t('settings.language.name'))
            .setDesc(i18n.t('settings.language.desc'))
            .addDropdown(dropdown => dropdown
                .addOption('auto', i18n.t('settings.language.options.auto'))
                .addOption('en', i18n.t('settings.language.options.en'))
                .addOption('zh', i18n.t('settings.language.options.zh'))
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    this.plugin.settings.language = value as 'auto' | 'en' | 'zh';
                    await this.plugin.saveSettings();
                    // Reload i18n
                    this.plugin.i18n.load();
                    // Refresh settings UI
                    this.display();
                }));

        containerEl.createEl('br');

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
                .onChange(async (value) => {
                    this.plugin.settings.modifierKey = value as 
                        | 'ctrl' | 'shift' | 'alt' | 'ctrl+shift' | 'ctrl+alt' | 'shift+alt';
                    await this.plugin.saveSettings();
                }));

        // Zoom step setting
        new Setting(containerEl)
            .setName(i18n.t('settings.zoomStep.name'))
            .setDesc(i18n.t('settings.zoomStep.desc'))
            .addText(text => text
                .setPlaceholder(i18n.t('settings.zoomStep.placeholder'))
                .setValue(String(this.plugin.settings.zoomStep))
                .onChange(async (value) => {
                    let val = parseFloat(value);
                    if (isNaN(val) || val <= 0) val = 0.05;
                    this.plugin.settings.zoomStep = val;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('br');

        // Current zoom display and reset
        const currentZoom = Math.round(webFrame.getZoomFactor() * 100);
        const zoomInfoSetting = new Setting(containerEl)
            .setName(i18n.t('settings.currentZoom.name'))
            .setDesc(i18n.t('settings.currentZoom.desc', { value: currentZoom }))
            .addButton(btn => btn
                .setButtonText(i18n.t('settings.currentZoom.reset'))
                .setCta()
                .onClick(async () => {
                    webFrame.setZoomFactor(1.0);
                    zoomInfoSetting.setDesc(i18n.t('settings.currentZoom.desc', { value: 100 }));
                    this.plugin.showZoomTip(i18n.t('settings.currentZoom.resetTip'));
                }));

        // Current font size display and reset
        const currentFontSize = (this.app.vault as any).getConfig('baseFontSize') || 16;
        const fontInfoSetting = new Setting(containerEl)
            .setName(i18n.t('settings.currentFontSize.name'))
            .setDesc(i18n.t('settings.currentFontSize.desc', { value: currentFontSize }))
            .addButton(btn => btn
                .setButtonText(i18n.t('settings.currentFontSize.reset'))
                .setCta()
                .onClick(async () => {
                    (this.app.vault as any).setConfig('baseFontSize', 16);
                    (this.app as any).updateFontSize();
                    fontInfoSetting.setDesc(i18n.t('settings.currentFontSize.desc', { value: 16 }));
                    this.plugin.showZoomTip(i18n.t('settings.currentFontSize.resetTip'));
                }));
    }
}
