import type { EditorSession, ApplyResult } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://ct.api.voxelware.org/api');

export async function getSession(sessionId: string): Promise<EditorSession> {
  const res = await fetch(`${API_BASE}/editor/${encodeURIComponent(sessionId)}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Session not found or expired');
    throw new Error(`Failed to load session: ${res.statusText}`);
  }
  return res.json();
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
  const res = await fetch(`${API_BASE}/editor/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, patch }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Apply failed: ${res.statusText}`);
  }

  return res.json();
}

export async function cancelSession(sessionId: string): Promise<void> {
  await fetch(`${API_BASE}/editor/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
}
