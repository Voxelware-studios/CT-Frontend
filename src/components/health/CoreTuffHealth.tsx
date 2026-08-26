import type { HealthComponent } from '@/types';
import { HealthBadge } from './HealthBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HealthState } from '@/types';

interface Subsystem {
  name: string;
  state: HealthState;
  message: string;
}

export function CoreTuffHealth({ component }: { component: HealthComponent }) {
  const subsystems = (component.details.subsystems as Subsystem[]) || [];
  const version = (component.details.version as string) || '?';
  const channel = (component.details.channel as string) || '';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            CoreTuff
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              v{version} {channel}
            </span>
          </CardTitle>
          <HealthBadge state={component.state} size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {subsystems.map((sub) => (
            <div
              key={sub.name}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium">{sub.name}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{sub.message}</p>
              </div>
              <HealthBadge state={sub.state} size="sm" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
