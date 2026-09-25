import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DistributionItem } from '@/types/stats';

interface DistributionChartProps {
  title: string;
  data: DistributionItem[];
  emptyMessage?: string;
}

function BarSegment({ item, maxPercentage }: { item: DistributionItem; maxPercentage: number }) {
  const width = maxPercentage > 0 ? (item.percentage / maxPercentage) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-sm text-foreground w-32 truncate shrink-0" title={item.name}>
        {item.name}
      </span>
      <div className="flex-1 h-5 bg-secondary rounded overflow-hidden">
        <div
          className="h-full bg-emerald-500/70 rounded transition-all duration-500"
          style={{ width: `${Math.max(width, 2)}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-12 text-right shrink-0">
        {item.percentage}%
      </span>
    </div>
  );
}

export function DistributionChart({ title, data, emptyMessage }: DistributionChartProps) {
  const maxPct = data.length > 0 ? Math.max(...data.map((d) => d.percentage)) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {emptyMessage || 'Not enough data yet.'}
          </p>
        ) : (
          <div className="space-y-0.5">
            {data.map((item) => (
              <BarSegment key={item.name} item={item} maxPercentage={maxPct} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
