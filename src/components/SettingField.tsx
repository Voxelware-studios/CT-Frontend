import type { SettingDefinition } from '@/types';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface SettingFieldProps {
  definition: SettingDefinition;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}

export function SettingField({ definition, value, onChange }: SettingFieldProps) {
  const { key, type, description, options } = definition;
  const displayName = key.split('.').pop()!.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const id = `setting-${key}`;

  const handleChange = (newValue: unknown) => {
    onChange(key, newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {displayName}
        </Label>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div>
        {renderField(type, value, id, handleChange, options)}
      </div>
    </div>
  );
}

function renderField(
  type: string,
  value: unknown,
  id: string,
  onChange: (v: unknown) => void,
  options?: string[] | null,
) {
  switch (type) {
    case 'boolean':
    case 'bool':
      return (
        <Switch
          id={id}
          checked={Boolean(value)}
          onCheckedChange={onChange}
        />
      );

    case 'integer':
    case 'int':
      return (
        <Input
          id={id}
          type="number"
          value={value != null ? String(value) : '0'}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            onChange(Number.isNaN(v) ? 0 : v);
          }}
        />
      );

    case 'double':
    case 'float':
    case 'number':
      return (
        <Input
          id={id}
          type="number"
          step="any"
          value={value != null ? String(value) : '0'}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(Number.isNaN(v) ? 0 : v);
          }}
        />
      );

    case 'enum':
      return (
        <Select
          value={String(value ?? '')}
          onValueChange={onChange}
        >
          <SelectTrigger id={id}>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {(options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'password':
      return (
        <Input
          id={id}
          type="password"
          value={value != null ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'color':
      return (
        <div className="flex gap-2">
          <Input
            id={id}
            type="color"
            className="w-12 h-9 p-1"
            value={value != null ? String(value) : '#000000'}
            onChange={(e) => onChange(e.target.value)}
          />
          <Input
            type="text"
            value={value != null ? String(value) : ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'list':
    case 'json':
      return (
        <textarea
          id={id}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
          value={value != null ? JSON.stringify(value, null, 2) : ''}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              onChange(e.target.value);
            }
          }}
        />
      );

    default:
      return (
        <Input
          id={id}
          type="text"
          value={value != null ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
