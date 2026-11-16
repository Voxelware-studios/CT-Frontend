export const APP_VERSION = 'v1.0-Alpha-3.1';

/**
 * CoreTuff plugin version this panel build is wired against.
 * Must stay in sync with `SUPPORTED_PLUGIN_VERSION` in backend/src/config/index.ts.
 */

export const SUPPORTED_PLUGIN_VERSIONS = [
  '2.0-Nightly-3',
  '2.0-Nightly-4',
  'future-update',
] as const;

export function isSupportedPluginVersion(version: unknown): boolean {
  return (
      typeof version === 'string' &&
      SUPPORTED_PLUGIN_VERSIONS.includes(
          version.trim() as (typeof SUPPORTED_PLUGIN_VERSIONS)[number]
      )
  );
}

