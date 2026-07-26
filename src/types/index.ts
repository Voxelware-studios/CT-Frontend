export interface SettingDefinition {
  key: string;
  type: string;
  defaultValue: unknown;
  value: unknown;
  category: string;
  description: string;
  displayName?: string;
  min?: number | null;
  max?: number | null;
  options?: string[] | null;
}

export interface SchemaModule {
  module: string;
  settings: SettingDefinition[];
}

export interface EditorSession {
  session_id: string;
  server_name: string;
  plugin_version: string;
  expires_at: number;
  schema: Record<string, SettingDefinition[]>;
  values: Record<string, Record<string, unknown>>;
}

export interface ApplyResult {
  results: Array<{
    index: number;
    module: string;
    key: string;
    success: boolean;
    error?: string;
  }>;
  status: string;
}
