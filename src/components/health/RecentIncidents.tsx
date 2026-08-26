import type { Incident } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function severityIcon(severity: string) {
  switch (severity) {
    case 'CRITICAL':
      return <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />;
    case 'WARNING':
      return <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />;
    default:
      return <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />;
  }
}

interface RecentIncidentsProps {
  incidents: Incident[];
  onViewTimeline: () => void;
}

export function RecentIncidents({ incidents, onViewTimeline }: RecentIncidentsProps) {
  const recent = incidents.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Incidents</CardTitle>
          {incidents.length > 0 && (
            <button
              onClick={onViewTimeline}
              className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              View timeline
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No incidents detected.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.map((incident) => {
              const isActive = incident.status !== 'RECOVERED';
              return (
                <div
                  key={incident.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {severityIcon(incident.severity)}
                    <div className="min-w-0">
                      <span className="text-sm font-medium truncate block">{incident.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {incident.subsystem} · {formatTime(incident.started_at)}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs shrink-0 ${isActive ? 'text-amber-500' : 'text-muted-foreground'}`}>
                    {isActive ? 'Active' : 'Resolved'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
