import type { Punishment, PagedResult } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect, useCallback } from 'react';
import { getPlayerHistory } from '@/lib/api';

function formatTime(ts: number): string {
  if (!ts || ts === -1) return '-';
  return new Date(ts).toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function typeBadge(type: string) {
  switch (type) {
    case 'BAN': return <span className="text-xs font-medium text-red-500">BAN</span>;
    case 'TEMPBAN': return <span className="text-xs font-medium text-amber-500">TEMPBAN</span>;
    case 'IPBAN': return <span className="text-xs font-medium text-orange-500">IPBAN</span>;
    default: return <span className="text-xs font-medium">{type}</span>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'ACTIVE': return <span className="text-xs font-medium text-amber-500">Active</span>;
    case 'PARDONED': return <span className="text-xs font-medium text-emerald-500">Pardoned</span>;
    case 'EXPIRED': return <span className="text-xs font-medium text-muted-foreground">Expired</span>;
    default: return <span className="text-xs font-medium">{status}</span>;
  }
}

interface PlayerHistoryDialogProps {
  serverId: string;
  playerUuid: string | null;
  open: boolean;
  onClose: () => void;
  onSelectPunishment: (punishment: Punishment) => void;
}

export function PlayerHistoryDialog({ serverId, playerUuid, open, onClose, onSelectPunishment }: PlayerHistoryDialogProps) {
  const [data, setData] = useState<PagedResult<Punishment> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    if (!serverId || !playerUuid) return;
    setIsLoading(true);
    try {
      const result = await getPlayerHistory(serverId, playerUuid, page, 25);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [serverId, playerUuid, page]);

  useEffect(() => {
    if (open && playerUuid) {
      setPage(1);
      fetchData();
    }
  }, [open, playerUuid, fetchData]);

  useEffect(() => {
    if (open && playerUuid) fetchData();
  }, [page, fetchData, open, playerUuid]);

  const playerName = data?.items?.[0]?.player?.name || 'Unknown';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Moderation History — {playerName}</DialogTitle>
          {playerUuid && (
            <p className="text-xs text-muted-foreground font-mono">{playerUuid}</p>
          )}
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading history...</p>
          ) : !data || data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No punishment records found for this player.</p>
          ) : (
            <div className="space-y-2">
              {data.items.map((p) => (
                <div
                  key={p.id}
                  className="rounded-md border border-border px-3 py-2 hover:bg-muted/50 cursor-pointer"
                  onClick={() => { onClose(); onSelectPunishment(p); }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{p.id}</span>
                      {typeBadge(p.type)}
                      {statusBadge(p.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTime(p.issuedAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.reason || 'No reason provided'}</p>
                  {p.duration && <p className="text-xs text-muted-foreground">Duration: {p.duration}</p>}
                </div>
              ))}
            </div>
          )}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-2 border-t border-border">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="text-xs rounded-md border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                disabled={page >= data.totalPages}
                className="text-xs rounded-md border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
