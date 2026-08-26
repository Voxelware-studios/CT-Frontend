import type { HealthComponent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExceptionRecord {
  timestamp: number;
  type: string;
  source: string;
  message: string;
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString();
}

export function ExceptionsList({ component }: { component: HealthComponent }) {
  const recent = (component.details.recent as ExceptionRecord[]) || [];
  const count = (component.details.recent_count as number) || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Exceptions</CardTitle>
          <span className="text-xs text-muted-foreground">{count} in buffer</span>
        </div>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent exceptions</p>
        ) : (
          <div className="space-y-2">
            {recent.map((ex, i) => (
              <div
                key={i}
                className="rounded-md border border-border px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{ex.type}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(ex.timestamp)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{ex.source}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{ex.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
