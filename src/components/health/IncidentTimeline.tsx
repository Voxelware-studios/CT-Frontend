import type { Incident } from '@/types';
import { HealthBadge } from './HealthBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatTimeRange(start: number, end: number): string {
  const s = new Date(start);
  const e = end > 0 ? new Date(end) : null;
  const fmt = { hour: '2-digit', minute: '2-digit' } as const;
  const startStr = s.toLocaleTimeString([], fmt);
  if (!e) return `${startStr} - Present`;
  return `${startStr} - ${e.toLocaleTimeString([], fmt)}`;
}

function severityBadge(severity: string) {
  switch (severity) {
    case 'CRITICAL':
      return <span className="text-xs font-medium text-red-500">CRITICAL</span>;
    case 'WARNING':
      return <span className="text-xs font-medium text-amber-500">WARNING</span>;
    default:
      return null;
  }
}

function IncidentDetail({ incident }: { incident: Incident }) {
  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      {incident.timeline.map((event, i) => (
        <div key={i} className="flex items-start gap-3 text-xs">
          <span className="text-muted-foreground tabular-nums shrink-0 w-16">
            {formatTime(event.timestamp)}
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-foreground">{event.message}</span>
            {event.severity && (
              <span className="ml-2">{severityBadge(event.severity)}</span>
            )}
          </div>
        </div>
      ))}
      {Object.keys(incident.symptoms).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(incident.symptoms).map(([key, val]) => (
            <span key={key} className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs">
              <span className="text-muted-foreground mr-1">{key}:</span>
              <span className="font-medium">{val}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function IncidentTimeline({ incidents }: { incidents: Incident[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeCount = incidents.filter((i) => i.status !== 'RECOVERED').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Incidents</CardTitle>
          <span className="text-xs text-muted-foreground">
            {activeCount > 0 ? `${activeCount} active` : 'None active'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No incidents detected. Server is operating normally.
          </p>
        ) : (
          <div className="space-y-2">
            {incidents.map((incident) => {
              const isActive = incident.status !== 'RECOVERED';
              const isExpanded = expandedId === incident.id;
              return (
                <div
                  key={incident.id}
                  className="rounded-md border border-border overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <HealthBadge
                        state={isActive ? (incident.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING') : 'HEALTHY'}
                        size="sm"
                      />
                      <span className="text-sm font-medium truncate">{incident.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeRange(incident.started_at, incident.resolved_at)}
                      </span>
                      <span className={`text-xs ${isActive ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        {isActive ? 'Active' : 'Resolved'}
                      </span>
                    </div>
                  </button>
                  {isExpanded && <IncidentDetail incident={incident} />}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
