import { useQuery } from '@tanstack/react-query';
import { getPlayerDetail } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PlayerData } from '@/types';

function formatTimestamp(ts: number): string {
  if (!ts) return '-';
  return new Date(ts).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatPlaytime(ms: number): string {
  if (!ms) return '0h 0m';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatGamemode(gm: string): string {
  switch (gm) {
    case 'SURVIVAL': return 'Survival';
    case 'CREATIVE': return 'Creative';
    case 'ADVENTURE': return 'Adventure';
    case 'SPECTATOR': return 'Spectator';
    default: return gm;
  }
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

interface PlayerProfileDialogProps {
  serverId: string;
  playerUuid: string | null;
  open: boolean;
  onClose: () => void;
  onViewModeration: (uuid: string) => void;
}

export function PlayerProfileDialog({
  serverId,
  playerUuid,
  open,
  onClose,
  onViewModeration,
}: PlayerProfileDialogProps) {
  const { data: player, isLoading } = useQuery<PlayerData | null>({
    queryKey: ['playerDetail', serverId, playerUuid],
    queryFn: () => getPlayerDetail(serverId, playerUuid!),
    enabled: !!serverId && !!playerUuid && open,
    refetchInterval: 5_000,
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Player Profile</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading player...</p>
          </div>
        )}

        {!isLoading && !player && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Player not found.</p>
          </div>
        )}

        {!isLoading && player && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{player.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {player.online ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      ONLINE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                      OFFLINE
                    </span>
                  )}
                </div>
              </div>
              {player.online && (
                <div className="text-right text-sm text-muted-foreground">
                  <div className="tabular-nums">{player.ping}ms</div>
                  <div>{formatGamemode(player.gamemode)}</div>
                  <div>{player.world}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Player Information</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UUID</span>
                  <span className="font-mono text-xs">{player.uuid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">First Seen</span>
                  <span>{formatTimestamp(player.firstSeen)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Seen</span>
                  <span>{player.online ? 'Now' : timeAgo(player.lastSeen)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Playtime</span>
                  <span className="tabular-nums">{formatPlaytime(player.playtime)}</span>
                </div>
              </div>
            </div>

            {player.moderation && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Moderation</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Punishments</span>
                    <span className={player.moderation.activePunishments > 0 ? 'text-amber-500 font-medium' : ''}>
                      {player.moderation.activePunishments}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Punishments</span>
                    <span>{player.moderation.totalPunishments}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onViewModeration(player.uuid)}
                >
                  View Moderation History
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
