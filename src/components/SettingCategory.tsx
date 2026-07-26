import type { SettingDefinition } from '@/types';
import { SettingField } from './SettingField';
import { Separator } from './ui/separator';

interface SettingCategoryProps {
  name: string;
  settings: SettingDefinition[];
  values: Record<string, unknown>;
  onSettingChange: (key: string, value: unknown) => void;
}

export function SettingCategory({ name, settings, values, onSettingChange }: SettingCategoryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <Separator className="mt-2" />
      </div>
      <div className="space-y-6">
        {settings.map((def) => (
          <SettingField
            key={def.key}
            definition={def}
            value={values[def.key] ?? def.value ?? def.defaultValue}
            onChange={onSettingChange}
          />
        ))}
      </div>
    </div>
  );
}
