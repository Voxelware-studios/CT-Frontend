import type { HealthComponent } from '@/types';
import { HealthBadge } from './HealthBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HealthState } from '@/types';

interface PluginInfo {
  name: string;
  version: string;
  enabled: boolean;
  health_state: HealthState;
  status: string;
  missing_dependencies?: string[];
}

export function PluginHealthList({ component }: { component: HealthComponent }) {
  const pluginList = (component.details.plugin_list as PluginInfo[]) || [];
  const healthy = (component.details.healthy as number) || 0;
  const warning = (component.details.warning as number) || 0;
  const total = (component.details.total as number) || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Plugins</CardTitle>
          <span className="text-xs text-muted-foreground">
            {healthy} healthy{warning > 0 ? `, ${warning} warning` : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {pluginList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No plugins found</p>
        ) : (
          <div className="space-y-2">
            {pluginList.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.version}</span>
                  </div>
                  {p.missing_dependencies && p.missing_dependencies.length > 0 && (
                    <p className="text-xs text-amber-500 mt-0.5">
                      Missing: {p.missing_dependencies.join(', ')}
                    </p>
                  )}
                </div>
                <HealthBadge state={p.health_state} size="sm" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
