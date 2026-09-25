import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlayers } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { PlayerData, PlayerListResponse } from '@/types';

function formatGamemode(gm: string): string {
  switch (gm) {
    case 'SURVIVAL': return 'Survival';
    case 'CREATIVE': return 'Creative';
    case 'ADVENTURE': return 'Adventure';
    case 'SPECTATOR': return 'Spectator';
    default: return gm;
  }
}

function formatPing(ping: number): string {
  return `${ping}ms`;
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface PlayerListProps {
  serverId: string;
  onSelectPlayer: (uuid: string) => void;
}

export function PlayerList({ serverId, onSelectPlayer }: PlayerListProps) {
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery<PlayerListResponse>({
    queryKey: ['players', serverId, search],
    queryFn: () => getPlayers(serverId, search || undefined),
    enabled: !!serverId,
    refetchInterval: 5_000,
    retry: 3,
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const players = data?.players || [];
  const onlineCount = data?.online_count ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Players</CardTitle>
          <span className="text-sm text-muted-foreground">
            Online: {onlineCount}
          </span>
        </div>
        <Input
          placeholder="Search players..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        {isLoading && !data && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading players...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-destructive">Unable to retrieve player information.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && players.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {search ? 'No players found matching your search.' : 'No players are currently online.'}
            </p>
          </div>
        )}

        {players.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Player</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">World</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Gamemode</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Ping</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr
                    key={player.uuid}
                    className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onSelectPlayer(player.uuid)}
                  >
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{player.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {player.uuid.slice(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      {player.online ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-500">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{player.world || '-'}</td>
                    <td className="py-2 px-3 text-muted-foreground">{formatGamemode(player.gamemode)}</td>
                    <td className="py-2 px-3 tabular-nums text-muted-foreground">
                      {player.online ? formatPing(player.ping) : `Last seen ${timeAgo(player.lastSeen)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
