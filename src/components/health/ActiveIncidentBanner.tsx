import type { Incident } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function ActiveIncidentBanner({ incidents }: { incidents: Incident[] }) {
  const active = incidents.filter((i) => i.status !== 'RECOVERED');
  if (active.length === 0) return null;

  const worst = active.reduce((a, b) =>
    a.severity === 'CRITICAL' ? a : b.severity === 'CRITICAL' ? b : a
  );

  const isCritical = worst.severity === 'CRITICAL';
  const borderColor = isCritical ? 'border-red-500/50' : 'border-amber-500/50';
  const bgColor = isCritical ? 'bg-red-500/5 dark:bg-red-500/10' : 'bg-amber-500/5 dark:bg-amber-500/10';
  const labelColor = isCritical ? 'text-red-500' : 'text-amber-500';
  const label = isCritical ? 'CRITICAL' : 'WARNING';

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = formatDuration(now - worst.started_at);
  const symptoms = Object.entries(worst.symptoms);

  return (
    <Card className={`${borderColor} ${bgColor}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${labelColor}`}>{label}</span>
              <span className="text-sm font-medium">{worst.title}</span>
            </div>
            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {symptoms.map(([key, val]) => (
                  <span key={key}>
                    <span className="uppercase">{key}</span>: {val}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Started {elapsed} ago</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
