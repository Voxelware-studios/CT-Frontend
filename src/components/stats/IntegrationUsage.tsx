import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getIntegrationStats } from '@/lib/stats-api';

function IntegrationPill({ name, percentage }: { name: string; percentage: number }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
      <span className="text-sm font-medium">{name}</span>
      <span className="text-sm text-emerald-400 font-mono">{percentage}%</span>
    </div>
  );
}

export function IntegrationUsage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'integrations'],
    queryFn: getIntegrationStats,
    refetchInterval: 120_000,
  });

  const integrations = data?.integrations || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Integrations</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
            ))}
          </div>
        ) : integrations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Not enough data yet. Integration detection will appear as installations report statistics.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {integrations.map((i) => (
              <IntegrationPill key={i.name} name={i.name} percentage={i.percentage} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
