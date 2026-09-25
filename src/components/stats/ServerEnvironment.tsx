import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEnvironmentStats } from '@/lib/stats-api';

function MiniDistribution({ items }: { items: Array<{ name: string; percentage: number }> }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Not enough data yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm"
        >
          <span>{item.name}</span>
          <span className="text-emerald-400 font-mono text-xs">{item.percentage}%</span>
        </div>
      ))}
    </div>
  );
}

export function ServerEnvironment() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'environment'],
    queryFn: getEnvironmentStats,
    refetchInterval: 120_000,
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Online Mode</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 bg-secondary rounded animate-pulse" />
          ) : (
            <MiniDistribution items={data?.onlineMode || []} />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Server Software</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 bg-secondary rounded animate-pulse" />
          ) : (
            <MiniDistribution items={data?.foliaDistribution || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
