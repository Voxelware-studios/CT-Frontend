import type { HealthReport } from '@/types';
import { HealthBadge } from './HealthBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m ${seconds % 60}s`;
}

export function HealthOverview({ report }: { report: HealthReport }) {
  const serverInfo = report.server_info || {};
  const healthyCount = report.components.filter((c) => c.state === 'HEALTHY').length;
  const totalCount = report.components.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Server Health</CardTitle>
          <HealthBadge state={report.overall_state} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Server</p>
            <p className="text-sm font-medium">{(serverInfo.server_name as string) || 'Unknown'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Plugin</p>
            <p className="text-sm font-medium">
              v{(serverInfo.plugin_version as string) || '?'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Subsystems</p>
            <p className="text-sm font-medium">
              {healthyCount}/{totalCount} healthy
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-sm font-medium">{formatUptime(report.server_uptime)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
