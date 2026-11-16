import type {
  StatsOverview,
  HistoryPoint,
  PlatformStats,
  ModuleStats,
  IntegrationStats,
  EnvironmentStats,
} from '@/types/stats';

export interface ServerRecord {
  record_name: string;
  record_value: number;
  recorded_at: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://ct.api.voxelware.org/api');

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
  return res.json();
}

export async function getStatsOverview(): Promise<StatsOverview> {
  return fetchJson(`${API_BASE}/stats/overview`);
}

export async function getServerHistory(range: string = 'all'): Promise<{ range: string; data: HistoryPoint[] }> {
  return fetchJson(`${API_BASE}/stats/servers?range=${encodeURIComponent(range)}`);
}

export async function getPlayerHistory(range: string = 'all'): Promise<{ range: string; data: HistoryPoint[] }> {
  return fetchJson(`${API_BASE}/stats/players?range=${encodeURIComponent(range)}`);
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return fetchJson(`${API_BASE}/stats/platforms`);
}

export async function getModuleStats(): Promise<ModuleStats> {
  return fetchJson(`${API_BASE}/stats/modules`);
}

export async function getIntegrationStats(): Promise<IntegrationStats> {
  return fetchJson(`${API_BASE}/stats/integrations`);
}

export async function getEnvironmentStats(): Promise<EnvironmentStats> {
  return fetchJson(`${API_BASE}/stats/environment`);
}

export async function getServerRecords(): Promise<{ records: ServerRecord[] }> {
  return fetchJson(`${API_BASE}/stats/records`);
}

export async function getServerRecord(recordName: string): Promise<ServerRecord> {
  return fetchJson(`${API_BASE}/stats/records/${encodeURIComponent(recordName)}`);
}
