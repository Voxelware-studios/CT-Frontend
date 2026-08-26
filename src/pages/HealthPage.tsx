import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getServerHealth, getConnectedServers } from '@/lib/api';
import { HealthOverview } from '@/components/health/HealthOverview';
import { ServerMetrics } from '@/components/health/ServerMetrics';
import { PluginHealthList } from '@/components/health/PluginHealthList';
import { IntegrationHealthList } from '@/components/health/IntegrationHealthList';
import { CoreTuffHealth } from '@/components/health/CoreTuffHealth';
import { ExceptionsList } from '@/components/health/ExceptionsList';
import { IncidentTimeline } from '@/components/health/IncidentTimeline';
import { HealthBadge } from '@/components/health/HealthBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HealthReport, ConnectedServer, HealthComponent } from '@/types';

function ServerSelector({
  servers,
  activeServer,
  onSelect,
}: {
  servers: ConnectedServer[];
  activeServer: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {servers.map((s) => (
        <button
          key={s.serverId}
          onClick={() => onSelect(s.serverId)}
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
            activeServer === s.serverId
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:bg-secondary'
          }`}
        >
          <span className="font-medium">{s.serverName}</span>
          {s.hasHealth && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          )}
        </button>
      ))}
    </div>
  );
}

function OverviewCards({ report }: { report: HealthReport }) {
  const serverComponent = report.components.find((c) => c.name === 'Server');
  const pluginComponent = report.components.find((c) => c.name === 'Plugins');
  const integrationComponent = report.components.find((c) => c.name === 'Integrations');
  const coretuffComponent = report.components.find((c) => c.name === 'CoreTuff');

  const cards = [
    { name: 'Server', component: serverComponent },
    { name: 'Plugins', component: pluginComponent },
    { name: 'Integrations', component: integrationComponent },
    { name: 'CoreTuff', component: coretuffComponent },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ name, component }) => (
        <Card key={name} className="py-3">
          <CardContent className="px-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{name}</span>
              {component && <HealthBadge state={component.state} size="sm" />}
            </div>
            {component && (
              <p className="text-xs text-muted-foreground/70 mt-1 truncate">{component.message}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function HealthPage() {
  const { serverId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();
  const [activeServer, setActiveServer] = useState(serverId || '');

  const { data: serversData } = useQuery({
    queryKey: ['servers'],
    queryFn: getConnectedServers,
    refetchInterval: 30_000,
  });

  const servers = serversData?.servers || [];

  useEffect(() => {
    if (!activeServer && servers.length > 0) {
      setActiveServer(servers[0].serverId);
    }
  }, [servers, activeServer]);

  useEffect(() => {
    if (serverId && serverId !== activeServer) {
      setActiveServer(serverId);
    }
  }, [serverId]);

  const handleSelectServer = useCallback(
    (id: string) => {
      setActiveServer(id);
      navigate(`/h/${id}`, { replace: true });
    },
    [navigate]
  );

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['health', activeServer],
    queryFn: () => getServerHealth(activeServer),
    enabled: !!activeServer,
    refetchInterval: 10_000,
  });

  if (servers.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Server Health</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground space-y-4">
            <p>No servers are currently connected.</p>
            <p>
              Make sure the CoreTuff plugin is running and connected to the backend.
            </p>
            <Link to="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading health data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center text-sm text-muted-foreground p-6">
            <p>Failed to load health data</p>
            <p className="text-xs mt-1">{(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const serverComponent = report?.components.find((c) => c.name === 'Server');
  const pluginComponent = report?.components.find((c) => c.name === 'Plugins');
  const integrationComponent = report?.components.find((c) => c.name === 'Integrations');
  const coretuffComponent = report?.components.find((c) => c.name === 'CoreTuff');
  const exceptionComponent = report?.components.find((c) => c.name === 'Exceptions');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-semibold hover:opacity-80">
              CoreTuff
            </Link>
            <span className="text-sm text-muted-foreground">Server Health</span>
          </div>
          <div className="flex items-center gap-3">
            {report && <HealthBadge state={report.overall_state} />}
            <span className="text-xs text-muted-foreground">
              Updated {report ? new Date(report.timestamp).toLocaleTimeString() : ''}
            </span>
          </div>
        </div>
        <div className="px-6 pb-3">
          <ServerSelector
            servers={servers}
            activeServer={activeServer}
            onSelect={handleSelectServer}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 space-y-6">
        {report && <HealthOverview report={report} />}
        {report && <OverviewCards report={report} />}

        {report && <IncidentTimeline incidents={report.incidents || []} />}

        <div className="grid gap-6 lg:grid-cols-2">
          {serverComponent && <ServerMetrics component={serverComponent} />}
          {coretuffComponent && <CoreTuffHealth component={coretuffComponent} />}
          {pluginComponent && <PluginHealthList component={pluginComponent} />}
          {integrationComponent && <IntegrationHealthList component={integrationComponent} />}
        </div>

        {exceptionComponent && <ExceptionsList component={exceptionComponent} />}
      </main>
    </div>
  );
}
