import type { HealthComponent, HealthState } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getServerRecord } from '@/lib/stats-api';

interface PerformanceAlert {
  status: HealthState;
  value: number;
  warning: number;
  critical: number;
}

function StatusDot({ status }: { status: HealthState }) {
  const color =
    status === 'CRITICAL' ? 'bg-red-500' :
    status === 'WARNING' ? 'bg-amber-500' :
    'bg-emerald-500';
  const textColor =
    status === 'CRITICAL' ? 'text-red-500' :
    status === 'WARNING' ? 'text-amber-500' :
    'text-emerald-500';
  const label =
    status === 'CRITICAL' ? 'Critical' :
    status === 'WARNING' ? 'Warning' :
    'Healthy';

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${textColor}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function MetricRow({
  label,
  value,
  unit,
  alert,
  max,
}: {
  label: string;
  value: number;
  unit: string;
  alert?: PerformanceAlert;
  max?: number;
}) {
  const percent = max !== undefined ? Math.min(100, (value / max) * 100) : undefined;
  const status = alert?.status || 'HEALTHY';

  let barColor = 'bg-emerald-500';
  if (status === 'CRITICAL') barColor = 'bg-red-500';
  else if (status === 'WARNING') barColor = 'bg-amber-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tabular-nums">
            {typeof value === 'number' ? (value % 1 === 0 ? value : value.toFixed(1)) : value}
            {unit}
          </span>
          <StatusDot status={status} />
        </div>
      </div>
      {percent !== undefined && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

function TpsDisplay({ tps, alert }: { tps: number[]; alert?: PerformanceAlert }) {
  const primary = tps[0] ?? 20;
  const status = alert?.status || 'HEALTHY';

  let color = 'text-emerald-500';
  if (status === 'CRITICAL') color = 'text-red-500';
  else if (status === 'WARNING') color = 'text-amber-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">TPS (1m / 5m / 15m)</span>
        <StatusDot status={status} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold tabular-nums ${color}`}>
          {primary.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">
          / {tps[1]?.toFixed(1) ?? '20.0'} / {tps[2]?.toFixed(1) ?? '20.0'}
        </span>
      </div>
    </div>
  );
}

export function ServerMetrics({ component }: { component: HealthComponent }) {
  const d = component.details;
  const tps = (d.tps as number[]) || [20, 20, 20];
  const mspt = (d.mspt as number) || 0;
  const memoryUsed = (d.memory_used_mb as number) || 0;
  const memoryMax = (d.memory_max_mb as number) || 0;
  const memoryPercent = (d.memory_percent as number) || 0;
  const cpu = (d.cpu_percent as number) ?? -1;
  const onlinePlayers = (d.online_players as number) || 0;
  const maxPlayers = (d.max_players as number) || 0;

  const alerts = (d.performance_alerts as Record<string, PerformanceAlert>) || {};
  const serverSoftware = (d.server_software as string) || 'Unknown';

  const { data: highestPlayersRecord } = useQuery({
    queryKey: ['record', 'highest_concurrent_players'],
    queryFn: () => getServerRecord('highest_concurrent_players'),
    refetchInterval: 30_000,
  });

  const highestPlayers = highestPlayersRecord?.record_value || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-xs text-muted-foreground">Server Software</span>
          <span className="text-sm font-medium">{serverSoftware}</span>
        </div>

        <TpsDisplay tps={tps} alert={alerts.tps} />

        <MetricRow label="MSPT" value={mspt} unit="ms" alert={alerts.mspt} />

        <MetricRow
          label="Memory"
          value={memoryPercent}
          unit="%"
          max={100}
          alert={alerts.memory}
        />
        <p className="text-xs text-muted-foreground">
          {memoryUsed.toLocaleString()} / {memoryMax.toLocaleString()} MB
        </p>

        {cpu >= 0 && alerts.cpu && (
          <MetricRow label="CPU" value={cpu} unit="%" max={100} alert={alerts.cpu} />
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">Players</span>
          <div className="text-right">
            <span className="text-sm font-medium">
              {onlinePlayers} / {maxPlayers}
            </span>
            {highestPlayers > 0 && (
              <p className="text-[10px] text-muted-foreground">
                Record: {highestPlayers}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <span>OS: </span>
            <span className="text-foreground">{(d.os as string) || 'Unknown'}</span>
          </div>
          <div>
            <span>Java: </span>
            <span className="text-foreground">{(d.java_version as string) || 'Unknown'}</span>
          </div>
          <div>
            <span>Worlds: </span>
            <span className="text-foreground">{(d.worlds as number) || 0}</span>
          </div>
          <div>
            <span>Folia: </span>
            <span className="text-foreground">{d.folia ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
