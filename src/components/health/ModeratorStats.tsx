import type { ModeratorStat } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ModeratorStatsProps {
  stats: ModeratorStat[] | undefined;
  isLoading: boolean;
}

export function ModeratorStats({ stats, isLoading }: ModeratorStatsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Moderation Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Moderation Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No moderator data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Moderation Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stats.map((stat) => (
            <div key={stat.moderator} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="text-sm font-medium">{stat.moderator}</span>
              <span className="text-sm text-muted-foreground">{stat.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
