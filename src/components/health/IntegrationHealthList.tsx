import type { HealthComponent } from '@/types';
import { HealthBadge } from './HealthBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HealthState } from '@/types';

interface IntegrationInfo {
  id: string;
  name: string;
  provider: string;
  version: string;
  status: string;
  description: string;
  capabilities: string[];
}

function integrationState(status: string): HealthState {
  switch (status) {
    case 'ACTIVE': return 'HEALTHY';
    case 'DEGRADED': return 'WARNING';
    case 'ERROR': return 'CRITICAL';
    default: return 'UNKNOWN';
  }
}

export function IntegrationHealthList({ component }: { component: HealthComponent }) {
  const integrationList = (component.details.integration_list as IntegrationInfo[]) || [];
  const active = (component.details.active as number) || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Integrations</CardTitle>
          <span className="text-xs text-muted-foreground">
            {active} active
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {integrationList.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No CoreTuff integrations are currently active.
          </p>
        ) : (
          <div className="space-y-2">
            {integrationList.map((intg) => (
              <div
                key={intg.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{intg.name}</span>
                    {intg.version && (
                      <span className="text-xs text-muted-foreground">v{intg.version}</span>
                    )}
                  </div>
                  {intg.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{intg.description}</p>
                  )}
                </div>
                <HealthBadge state={integrationState(intg.status)} size="sm" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
