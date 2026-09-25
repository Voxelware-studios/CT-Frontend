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
  server_id: string;
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

export type HealthState = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN' | 'PENDING';

export interface HealthComponent {
  name: string;
  state: HealthState;
  message: string;
  details: Record<string, unknown>;
}

export interface HealthReport {
  overall_state: HealthState;
  timestamp: number;
  server_uptime: number;
  monitor_uptime: number;
  components: HealthComponent[];
  server_info: Record<string, unknown>;
  incidents: Incident[];
}

export interface Incident {
  id: string;
  type: string;
  subsystem: string;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'DETECTED' | 'ACTIVE' | 'RECOVERED';
  started_at: number;
  resolved_at: number;
  timeline: IncidentEvent[];
  symptoms: Record<string, string>;
  current_values: Record<string, unknown>;
}

export interface IncidentEvent {
  timestamp: number;
  type: string;
  message: string;
  severity?: string;
}

export interface ConnectedServer {
  serverId: string;
  serverName: string;
  pluginVersion: string;
  connectedAt: number;
  hasHealth: boolean;
}

export interface Punishment {
  id: string;
  player: { uuid: string | null; name: string };
  type: 'BAN' | 'TEMPBAN' | 'IPBAN';
  status: 'ACTIVE' | 'PARDONED' | 'EXPIRED';
  reason: string | null;
  moderator: string;
  issuedAt: number;
  expiresAt: number;
  duration?: string;
  ip?: string;
  pardonedBy?: string;
  pardonReason?: string;
  removedAt?: number;
  expiredAt?: number;
}

export interface ModerationSummary {
  totalPunishments: number;
  activePunishments: number;
  bans: number;
  tempBans: number;
  ipBans: number;
  pardoned: number;
  expired: number;
  thisWeek: number;
  thisMonth: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ModeratorStat {
  moderator: string;
  count: number;
}

export interface PlayerData {
  uuid: string;
  name: string;
  online: boolean;
  world: string;
  gamemode: string;
  ping: number;
  firstSeen: number;
  lastSeen: number;
  playtime: number;
  moderation?: {
    activePunishments: number;
    totalPunishments: number;
  };
}

export interface PlayerListResponse {
  online_count: number;
  players: PlayerData[];
}
