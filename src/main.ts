import { Plugin } from 'obsidian';
import { webFrame } from 'electron';
import {
    ZoneScrollZoomSettings,
    ModifierKey,
    VaultWithConfig,
    AppWithFontSize,
    AppWithBaseFontSize
} from './types';
import { I18n } from './i18n';
import { ZoneScrollZoomSettingTab } from './settings';
import {
    DEFAULT_FONT_SIZE,
    DEFAULT_ZOOM_STEP,
    MAX_FONT_SIZE,
    MIN_FONT_SIZE
} from './constants';

// Default settings
const DEFAULT_SETTINGS: ZoneScrollZoomSettings = {
    zoomStep: DEFAULT_ZOOM_STEP,
    modifierKey: 'ctrl',
    language: 'auto'
};

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
                const target = evt.target as HTMLElement;

                // Canvas has its own native zoom, don't intercept
                if (target.closest('.canvas-wrapper')) {
                    return;
                }

                evt.preventDefault();
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

    async loadSettings(): Promise<void> {
        try {
            const data = await this.loadData() as Partial<ZoneScrollZoomSettings> | null;
            this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
        } catch (error) {
            console.error(this.i18n.t('console.loadFailed'), error);
            this.settings = Object.assign({}, DEFAULT_SETTINGS);
        }
    }

    async saveSettings(): Promise<void> {
        try {
            await this.saveData(this.settings);
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
            this.tipElement = activeDocument.body.createDiv({ cls: 'zone-scroll-zoom-tip' });
            this.tipElement.setCssStyles({
                position: 'fixed',
                top: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                color: 'rgba(255, 255, 255, 0.95)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 'bold',
                zIndex: '9999',
                pointerEvents: 'none',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(5px)'
            });
            activeDocument.body.appendChild(this.tipElement);
        }
        this.tipElement.setText(text);
        
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
     * Read the current editor base font size.
     *
     * Obsidian 1.14.2 moved the base font size from `appearance.json` to
     * per-device local storage and added `app.getBaseFontSize()`, which clamps
     * the value to 10-30. Older versions only expose it through the vault
     * config, so both paths are supported.
     */
    getEditorFontSize(): number {
        const app = this.app as unknown as Partial<AppWithBaseFontSize>;
        if (typeof app.getBaseFontSize === 'function') {
            const size = app.getBaseFontSize();
            if (typeof size === 'number' && Number.isFinite(size)) {
                return size;
            }
        }

        const legacySize = ((this.app.vault as unknown) as VaultWithConfig).getConfig('baseFontSize');
        if (typeof legacySize === 'number' && Number.isFinite(legacySize)) {
            return legacySize;
        }

        return DEFAULT_FONT_SIZE;
    }

    /**
     * Apply a new editor base font size.
     *
     * Uses the Obsidian 1.14.2+ API when available (which also persists the
     * value to device local storage and refreshes the UI), otherwise falls back
     * to the legacy vault config + `app.updateFontSize()` combination.
     */
    setEditorFontSize(size: number): void {
        const clamped = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(size)));
        const app = this.app as unknown as Partial<AppWithBaseFontSize> & Partial<AppWithFontSize>;

        if (typeof app.setBaseFontSize === 'function') {
            app.setBaseFontSize(clamped);
            return;
        }

        ((this.app.vault as unknown) as VaultWithConfig).setConfig('baseFontSize', clamped);
        if (typeof app.updateFontSize === 'function') {
            app.updateFontSize();
        }
    }

    /**
     * Adjust editor font size
     */
    private adjustEditorFontSize(deltaY: number): void {
        const currentSize = Math.round(this.getEditorFontSize());
        const step = deltaY < 0 ? 1 : -1;
        const newSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, currentSize + step));

        if (newSize !== currentSize) {
            this.setEditorFontSize(newSize);
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
