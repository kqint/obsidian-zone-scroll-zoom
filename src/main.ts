import { Plugin, normalizePath } from 'obsidian';
import { webFrame } from 'electron';
import { ZoneScrollZoomSettings, ModifierKey, VaultWithConfig, AppWithFontSize } from './types';
import { I18n } from './i18n';
import { ZoneScrollZoomSettingTab } from './settings';

// Default settings
const DEFAULT_SETTINGS: ZoneScrollZoomSettings = {
    zoomStep: 0.05,
    modifierKey: 'ctrl',
    language: 'auto'
};

// Config file name
const CONFIG_FILE_NAME = 'data.json';

/**
 * Zone Scroll Zoom Plugin
 * Zoom where your mouse is - font in editor, interface elsewhere
 */
export default class ZoneScrollZoomPlugin extends Plugin {
    settings: ZoneScrollZoomSettings = DEFAULT_SETTINGS;
    i18n: I18n;
    
    private tipElement: HTMLDivElement | null = null;
    private hideTimer: number | null = null;

    async onload(): Promise<void> {
        // Load settings first (i18n needs language setting)
        await this.loadSettings();
        
        // Initialize i18n
        this.i18n = new I18n(this);
        this.i18n.load();
        
        console.debug(this.i18n.t('console.loading'));

        // Add settings tab
        this.addSettingTab(new ZoneScrollZoomSettingTab(this.app, this));

        // Register wheel event handler
        this.registerDomEvent(window, 'wheel', (evt: WheelEvent) => {
            if (this.isModifierKeyPressed(evt)) {
                evt.preventDefault();
                const target = evt.target as HTMLElement;
                const isEditor = target.closest('.markdown-source-view') || 
                                 target.closest('.markdown-preview-view');
                if (isEditor) {
                    this.adjustEditorFontSize(evt.deltaY);
                } else {
                    this.adjustInterfaceZoom(evt.deltaY);
                }
            }
        }, { passive: false });
    }

    /**
     * Check if the configured modifier key is pressed
     */
    private isModifierKeyPressed(evt: WheelEvent): boolean {
        const key: ModifierKey = this.settings.modifierKey || 'ctrl';
        switch (key) {
            case 'ctrl':
                return evt.ctrlKey || evt.metaKey;
            case 'shift':
                return evt.shiftKey;
            case 'alt':
                return evt.altKey;
            case 'ctrl+shift':
                return (evt.ctrlKey || evt.metaKey) && evt.shiftKey;
            case 'ctrl+alt':
                return (evt.ctrlKey || evt.metaKey) && evt.altKey;
            case 'shift+alt':
                return evt.shiftKey && evt.altKey;
            default:
                return evt.ctrlKey || evt.metaKey;
        }
    }

    /**
     * Get config file path
     */
    private getConfigPath(): string {
        return normalizePath(`${this.manifest.dir}/${CONFIG_FILE_NAME}`);
    }

    /**
     * Load settings from data.json
     */
    async loadSettings(): Promise<void> {
        const path = this.getConfigPath();
        try {
            // Check if file exists
            if (await this.app.vault.adapter.exists(path)) {
                // Read file content
                const data = await this.app.vault.adapter.read(path);
                // Parse JSON and merge with default settings
                this.settings = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(data));
            } else {
                // Use defaults if file doesn't exist
                this.settings = Object.assign({}, DEFAULT_SETTINGS);
            }
        } catch (error) {
            console.error(this.i18n.t('console.loadFailed'), error);
            this.settings = Object.assign({}, DEFAULT_SETTINGS);
        }
    }

    /**
     * Save settings to data.json
     */
    async saveSettings(): Promise<void> {
        const path = this.getConfigPath();
        try {
            // Convert settings object to JSON string
            const jsonString = JSON.stringify(this.settings, null, 2);
            // Write to file
            await this.app.vault.adapter.write(path, jsonString);
            console.debug(this.i18n.t('console.settingsSaved'));
        } catch (error) {
            console.error(this.i18n.t('console.saveFailed'), error);
        }
    }

    /**
     * Show zoom tip overlay
     */
    showZoomTip(text: string): void {
        if (!this.tipElement) {
            this.tipElement = document.createElement('div');
            this.tipElement.style.cssText = `
                position: fixed;
                top: 10%; 
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.75);
                color: rgba(255, 255, 255, 0.95);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 16px;
                font-weight: bold;
                z-index: 9999;
                pointer-events: none;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(5px);
            `;
            document.body.appendChild(this.tipElement);
        }
        this.tipElement.innerText = text;
        
        if (this.hideTimer) {
            window.clearTimeout(this.hideTimer);
        }
        
        this.hideTimer = window.setTimeout(() => {
            if (this.tipElement) {
                this.tipElement.remove();
                this.tipElement = null;
            }
        }, 800);
    }

    /**
     * Adjust editor font size
     */
    private adjustEditorFontSize(deltaY: number): void {
        let currentSize = ((this.app.vault as unknown) as VaultWithConfig).getConfig('baseFontSize') as number || 16;
        const step = 1;
        let newSize = currentSize;
        
        if (deltaY < 0) {
            newSize += step;
        } else {
            newSize -= step;
        }
        
        if (newSize < 10) newSize = 10;
        if (newSize > 100) newSize = 100;
        
        if (newSize !== currentSize) {
            ((this.app.vault as unknown) as VaultWithConfig).setConfig('baseFontSize', newSize);
            ((this.app as unknown) as AppWithFontSize).updateFontSize();
            this.showZoomTip(this.i18n.t('tips.fontSize', { value: newSize }));
        }
    }

    /**
     * Adjust interface zoom level
     */
    private adjustInterfaceZoom(deltaY: number): void {
        let currentZoom = webFrame.getZoomFactor();
        const step = this.settings.zoomStep;
        let newZoom = currentZoom;
        
        if (deltaY < 0) {
            newZoom += step;
        } else {
            newZoom -= step;
        }
        
        newZoom = parseFloat(newZoom.toFixed(2));
        
        if (newZoom < 0.5) newZoom = 0.5;
        if (newZoom > 5.0) newZoom = 5.0;
        
        if (newZoom !== parseFloat(currentZoom.toFixed(2))) {
            webFrame.setZoomFactor(newZoom);
            this.showZoomTip(this.i18n.t('tips.zoomLevel', { value: Math.round(newZoom * 100) }));
        }
    }

    onunload(): void {
        if (this.tipElement) {
            this.tipElement.remove();
        }
    }
}
