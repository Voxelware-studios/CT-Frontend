import type { Incident, IncidentEvent } from '@/types';
import { HealthBadge } from './HealthBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useMemo } from 'react';

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function severityBadge(severity: string) {
  switch (severity) {
    case 'CRITICAL':
      return <span className="text-xs font-medium text-red-500">CRITICAL</span>;
    case 'WARNING':
      return <span className="text-xs font-medium text-amber-500">WARNING</span>;
    case 'INFO':
      return <span className="text-xs font-medium text-blue-500">INFO</span>;
    default:
      return null;
  }
}

function eventSeverityBadge(severity?: string) {
  if (!severity) return null;
  switch (severity) {
    case 'CRITICAL':
      return <span className="text-[10px] font-medium text-red-500 ml-1">CRITICAL</span>;
    case 'WARNING':
      return <span className="text-[10px] font-medium text-amber-500 ml-1">WARNING</span>;
    case 'INFO':
      return <span className="text-[10px] font-medium text-blue-500 ml-1">INFO</span>;
    default:
      return null;
  }
}

interface FullTimelineProps {
  incidents: Incident[];
  onClose: () => void;
}

export function FullTimeline({ incidents, onClose }: FullTimelineProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [subsystemFilter, setSubsystemFilter] = useState<string>('ALL');

  const subsystems = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => set.add(i.subsystem));
    return Array.from(set).sort();
  }, [incidents]);

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      if (severityFilter !== 'ALL' && i.severity !== severityFilter) return false;
      if (statusFilter === 'ACTIVE' && i.status === 'RECOVERED') return false;
      if (statusFilter === 'RESOLVED' && i.status !== 'RECOVERED') return false;
      if (subsystemFilter !== 'ALL' && i.subsystem !== subsystemFilter) return false;
      return true;
    });
  }, [incidents, severityFilter, statusFilter, subsystemFilter]);

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Incident[]>();
    for (const incident of filtered) {
      const dateKey = formatDate(incident.started_at);
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)!.push(incident);
    }
    return groups;
  }, [filtered]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Incident Timeline</CardTitle>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs rounded-md border border-border bg-card px-2 py-1 text-foreground"
          >
            <option value="ALL">All severities</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-md border border-border bg-card px-2 py-1 text-foreground"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <select
            value={subsystemFilter}
            onChange={(e) => setSubsystemFilter(e.target.value)}
            className="text-xs rounded-md border border-border bg-card px-2 py-1 text-foreground"
          >
            <option value="ALL">All subsystems</option>
            {subsystems.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No incidents match the current filters.
          </p>
        ) : (
          <div className="space-y-6">
            {Array.from(groupedByDate.entries()).map(([date, dateIncidents]) => (
              <div key={date}>
                <h3 className="text-xs font-medium text-muted-foreground mb-3">{date}</h3>
                <div className="space-y-3 ml-1">
                  {dateIncidents.map((incident) => {
                    const isActive = incident.status !== 'RECOVERED';
                    return (
                      <div key={incident.id} className="rounded-md border border-border overflow-hidden">
                        <div className="px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <HealthBadge
                                state={isActive ? (incident.severity === 'CRITICAL' ? 'CRITICAL' : incident.severity === 'WARNING' ? 'WARNING' : 'HEALTHY') : 'HEALTHY'}
                                size="sm"
                              />
                              <span className="text-sm font-medium">{incident.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(incident.started_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{incident.subsystem}</span>
                            <span>·</span>
                            <span className={isActive ? 'text-amber-500' : ''}>
                              {isActive ? 'Active' : 'Resolved'}
                            </span>
                            {incident.resolved_at > 0 && (
                              <>
                                <span>·</span>
                                <span>Resolved at {formatTime(incident.resolved_at)}</span>
                              </>
                            )}
                          </div>
                          {incident.description && (
                            <p className="text-xs text-muted-foreground mt-1">{incident.description}</p>
                          )}
                        </div>
                        {incident.timeline.length > 0 && (
                          <div className="border-t border-border px-3 py-2 space-y-1.5">
                            {incident.timeline.map((event: IncidentEvent, i: number) => (
                              <div key={i} className="flex items-start gap-3 text-xs">
                                <span className="text-muted-foreground tabular-nums shrink-0 w-16">
                                  {formatTime(event.timestamp)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <span className="text-foreground">{event.message}</span>
                                  {eventSeverityBadge(event.severity)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {Object.keys(incident.symptoms).length > 0 && (
                          <div className="border-t border-border px-3 py-2 flex flex-wrap gap-2">
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
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
