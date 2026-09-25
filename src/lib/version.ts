export const APP_VERSION = 'v1.0-Alpha-3';

/**
 * CoreTuff plugin version this panel build is wired against.
 * Must stay in sync with `SUPPORTED_PLUGIN_VERSION` in backend/src/config/index.ts.
 */
export const SUPPORTED_PLUGIN_VERSION = '2.0-Nightly-3';

export function isSupportedPluginVersion(version: unknown): boolean {
  return typeof version === 'string' && version.trim() === SUPPORTED_PLUGIN_VERSION;
}
