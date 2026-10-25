/**
 * Shared numeric limits and defaults.
 *
 * Kept in a standalone module so both the plugin entry point and the settings
 * tab can use them without a circular import.
 */

/** Default editor base font size in px. */
export const DEFAULT_FONT_SIZE = 16;

/** Smallest editor base font size allowed by Obsidian. */
export const MIN_FONT_SIZE = 10;

/** Largest editor base font size allowed by Obsidian (Appearance slider cap). */
export const MAX_FONT_SIZE = 30;

/** Default interface zoom step. */
export const DEFAULT_ZOOM_STEP = 0.05;

/** Smallest allowed interface zoom step. */
export const MIN_ZOOM_STEP = 0.01;

/** Largest allowed interface zoom step. */
export const MAX_ZOOM_STEP = 1;
