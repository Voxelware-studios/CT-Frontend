import type { SettingDefinition } from '@/types';

export function getDisplayName(key: string): string {
  return key
    .split('.')
    .pop()!
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getModuleDisplayName(module: string): string {
  return module.charAt(0).toUpperCase() + module.slice(1);
}

export function getSettingValue(
  values: Record<string, unknown>,
  def: SettingDefinition,
): unknown {
  if (values[def.key] !== undefined) return values[def.key];
  return def.value ?? def.defaultValue;
}

export function groupByCategory(settings: SettingDefinition[]): Map<string, SettingDefinition[]> {
  const groups = new Map<string, SettingDefinition[]>();
  for (const s of settings) {
    const cat = s.category || 'General';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(s);
  }
  return groups;
}
