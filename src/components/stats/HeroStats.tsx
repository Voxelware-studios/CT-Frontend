import { useQuery } from '@tanstack/react-query';
import { getStatsOverview } from '@/lib/stats-api';
import { Card, CardContent } from '@/components/ui/card';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function HeroStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: getStatsOverview,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 w-20 bg-muted rounded mb-2" />
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = data || { totalServers: 0, activeServers: 0, recordServers: 0, totalPlayers: 0, recordPlayers: 0 };

  const items = [
    { label: 'Active Servers', value: stats.activeServers, sub: `All time: ${formatNumber(stats.totalServers)}` },
    { label: 'Current Players', value: stats.totalPlayers, sub: `Record: ${formatNumber(stats.recordPlayers)}` },
    { label: 'Total Installations', value: stats.totalServers, sub: `Peak concurrent: ${formatNumber(stats.recordServers)}` },
    { label: 'Record Players', value: stats.recordPlayers, sub: 'Highest observed' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-3xl font-bold mt-1 text-emerald-400">{formatNumber(item.value)}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{item.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
