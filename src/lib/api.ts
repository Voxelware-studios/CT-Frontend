import type { EditorSession, ApplyResult, HealthReport, ConnectedServer, ModerationSummary, PagedResult, Punishment, ModeratorStat, PlayerData, PlayerListResponse } from '@/types';
import { SUPPORTED_PLUGIN_VERSION, isSupportedPluginVersion } from '@/lib/version';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://ct.api.voxelware.org/api');

export class SessionConflictError extends Error {
  constructor() {
    super('Session terminated: opened in another tab');
    this.name = 'SessionConflictError';
  }
}

export class IncompatibleVersionError extends Error {
  readonly pluginVersion: string;
  constructor(pluginVersion: string) {
    super(
      `This panel only supports CoreTuff ${SUPPORTED_PLUGIN_VERSION}, but the session was created by CoreTuff ${pluginVersion}. Update CoreTuff to continue.`,
    );
    this.name = 'IncompatibleVersionError';
    this.pluginVersion = pluginVersion;
  }
}

function getClaimToken(): string {
  let token = sessionStorage.getItem('ct_claim_token');
  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem('ct_claim_token', token);
  }
  return token;
}

export async function getSession(sessionId: string): Promise<EditorSession> {
  const token = getClaimToken();
  const res = await fetch(`${API_BASE}/editor/${encodeURIComponent(sessionId)}?claim_token=${encodeURIComponent(token)}`);
  if (!res.ok) {
    if (res.status === 409) throw new SessionConflictError();
    if (res.status === 404) throw new Error('Session not found or expired');
    if (res.status === 426) throw new IncompatibleVersionError('unknown');
    throw new Error(`Failed to load session: ${res.statusText}`);
  }
  const session: EditorSession = await res.json();
  if (!isSupportedPluginVersion(session.plugin_version)) {
    throw new IncompatibleVersionError(session.plugin_version);
  }
  return session;
}

export async function checkSessionStatus(sessionId: string): Promise<{ valid: boolean }> {
  const res = await fetch(`${API_BASE}/editor/status?session_id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) return { valid: false };
  const data = await res.json();
  return { valid: data.valid === true };
}

export async function applyChanges(
  sessionId: string,
  patch: Array<{ op: string; path: string; value: unknown }>,
): Promise<ApplyResult> {
  const token = getClaimToken();
  const res = await fetch(`${API_BASE}/editor/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, patch, claim_token: token }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Apply failed: ${res.statusText}`);
  }

  return res.json();
}

export async function cancelSession(sessionId: string): Promise<void> {
  const token = getClaimToken();
  await fetch(`${API_BASE}/editor/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, claim_token: token }),
  });
}

export async function getConnectedServers(): Promise<{ servers: ConnectedServer[] }> {
  const res = await fetch(`${API_BASE.replace('/api', '')}/api/health/servers`);
  if (!res.ok) throw new Error(`Failed to fetch servers: ${res.statusText}`);
  return res.json();
}

export async function getServerHealth(serverId: string): Promise<HealthReport | null> {
  const res = await fetch(`${API_BASE.replace('/api', '')}/api/health/${encodeURIComponent(serverId)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getSessionStatus(sessionId: string): Promise<{
  valid: boolean;
  server_id?: string;
  server_name?: string;
  server_connected?: boolean;
  server_status?: string;
  expires_at?: number;
}> {
  const res = await fetch(`${API_BASE.replace('/api', '')}/api/session/${encodeURIComponent(sessionId)}/status`);
  if (!res.ok) return { valid: false };
  return res.json();
}

export async function getModerationSummary(serverId: string): Promise<ModerationSummary> {
  const res = await fetch(`${API_BASE}/moderation/${encodeURIComponent(serverId)}/summary`);
  if (!res.ok) throw new Error(`Failed to fetch moderation summary: ${res.statusText}`);
  return res.json();
}

export async function getPunishments(
  serverId: string,
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    status?: string;
    sort?: string;
    order?: string;
  } = {},
): Promise<PagedResult<Punishment>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.search) query.set('search', params.search);
  if (params.type) query.set('type', params.type);
  if (params.status) query.set('status', params.status);
  if (params.sort) query.set('sort', params.sort);
  if (params.order) query.set('order', params.order);
  const qs = query.toString();
  const res = await fetch(`${API_BASE}/moderation/${encodeURIComponent(serverId)}/punishments${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error(`Failed to fetch punishments: ${res.statusText}`);
  return res.json();
}

export async function getPunishmentDetail(serverId: string, id: string): Promise<Punishment | null> {
  const res = await fetch(`${API_BASE}/moderation/${encodeURIComponent(serverId)}/punishments/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getPlayerHistory(
  serverId: string,
  uuid: string,
  page = 1,
  pageSize = 25,
): Promise<PagedResult<Punishment>> {
  const res = await fetch(
    `${API_BASE}/moderation/${encodeURIComponent(serverId)}/players/${encodeURIComponent(uuid)}/history?page=${page}&pageSize=${pageSize}`,
  );
  if (!res.ok) throw new Error(`Failed to fetch player history: ${res.statusText}`);
  return res.json();
}

export async function getModeratorStats(serverId: string): Promise<{ moderators: ModeratorStat[] }> {
  const res = await fetch(`${API_BASE}/moderation/${encodeURIComponent(serverId)}/moderators`);
  if (!res.ok) throw new Error(`Failed to fetch moderator stats: ${res.statusText}`);
  return res.json();
}

export async function getPlayers(
  serverId: string,
  search?: string,
): Promise<PlayerListResponse> {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  const qs = query.toString();
  const res = await fetch(`${API_BASE.replace('/api', '')}/api/players/${encodeURIComponent(serverId)}${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error(`Failed to fetch players: ${res.statusText}`);
  return res.json();
}

export async function getPlayerDetail(
  serverId: string,
  uuid: string,
): Promise<PlayerData | null> {
  const res = await fetch(`${API_BASE.replace('/api', '')}/api/players/${encodeURIComponent(serverId)}/${encodeURIComponent(uuid)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function searchPlayers(
  serverId: string,
  query: string,
): Promise<PlayerData[]> {
  const res = await fetch(`${API_BASE.replace('/api', '')}/api/players/${encodeURIComponent(serverId)}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Failed to search players: ${res.statusText}`);
  return res.json();
}
