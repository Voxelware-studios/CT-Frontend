import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getModuleStats } from '@/lib/stats-api';

function ModuleBar({ name, percentage }: { name: string; percentage: number }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-2 w-28 shrink-0">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="text-sm truncate" title={name}>{name}</span>
      </div>
      <div className="flex-1 h-6 bg-secondary rounded overflow-hidden">
        <div
          className="h-full bg-emerald-500/60 rounded flex items-center justify-end pr-2 transition-all duration-500"
          style={{ width: `${Math.max(percentage, 5)}%` }}
        >
          {percentage >= 15 && (
            <span className="text-[10px] text-white font-medium">{percentage}%</span>
          )}
        </div>
      </div>
      {percentage < 15 && (
        <span className="text-xs text-muted-foreground w-10 text-right">{percentage}%</span>
      )}
    </div>
  );
}

export function ModuleUsage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'modules'],
    queryFn: getModuleStats,
    refetchInterval: 120_000,
  });

  const modules = data?.modules || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">CoreTuff Module Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 bg-secondary rounded animate-pulse" />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Not enough data yet. Module usage will appear as installations report statistics.
          </p>
        ) : (
          <div className="space-y-0.5">
            {modules.map((m) => (
              <ModuleBar key={m.name} name={m.name} percentage={m.percentage} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
