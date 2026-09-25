import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getSession, checkSessionStatus, applyChanges, cancelSession, getServerHealth, getSessionStatus, SessionConflictError, IncompatibleVersionError, getModerationSummary, getModeratorStats } from '@/lib/api';
import { groupByCategory, getModuleDisplayName } from '@/lib/schema-utils';
import { HealthOverview } from '@/components/health/HealthOverview';
import { ServerMetrics } from '@/components/health/ServerMetrics';
import { PluginHealthList } from '@/components/health/PluginHealthList';
import { CoreTuffHealth } from '@/components/health/CoreTuffHealth';
import { ExceptionsList } from '@/components/health/ExceptionsList';
import { IncidentTimeline } from '@/components/health/IncidentTimeline';
import { ActiveIncidentBanner } from '@/components/health/ActiveIncidentBanner';
import { RecentIncidents } from '@/components/health/RecentIncidents';
import { FullTimeline } from '@/components/health/FullTimeline';
import { ModerationOverview } from '@/components/health/ModerationOverview';
import { PunishmentTable } from '@/components/health/PunishmentTable';
import { ModeratorStats } from '@/components/health/ModeratorStats';
import { PunishmentDetailDialog } from '@/components/health/PunishmentDetailDialog';
import { PlayerHistoryDialog } from '@/components/health/PlayerHistoryDialog';
import { EditorSidebar } from '@/components/EditorSidebar';
import { PlayersTab } from '@/components/players/PlayersTab';
import { SettingCategory } from '@/components/SettingCategory';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import type { SettingDefinition, HealthReport, Punishment } from '@/types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'expired';

function ConnectionIndicator({ status, lastUpdate }: { status: ConnectionStatus; lastUpdate: number | null }) {
  const now = Date.now();
  const secondsAgo = lastUpdate ? Math.floor((now - lastUpdate) / 1000) : null;

  const config = {
    connecting: { color: 'bg-amber-500', label: 'Connecting', textColor: 'text-amber-500' },
    connected: { color: 'bg-emerald-500', label: 'Connected', textColor: 'text-emerald-500' },
    disconnected: { color: 'bg-red-500', label: 'Disconnected', textColor: 'text-red-500' },
    expired: { color: 'bg-muted-foreground', label: 'Session Expired', textColor: 'text-muted-foreground' },
  }[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${config.color} ${status === 'connected' ? 'animate-pulse' : ''}`} />
      <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
      {status === 'connected' && secondsAgo !== null && (
        <span className="text-xs text-muted-foreground">
          {secondsAgo < 3 ? 'Just now' : `${secondsAgo}s ago`}
        </span>
      )}
      {status === 'disconnected' && secondsAgo !== null && (
        <span className="text-xs text-muted-foreground">
          Last update: {secondsAgo}s ago
        </span>
      )}
    </div>
  );
}

function StaleMetric({ label, value, unit, stale }: { label: string; value: string | number; unit?: string; stale: boolean }) {
  return (
    <div className={`flex items-center justify-between ${stale ? 'opacity-50' : ''}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium tabular-nums">
          {value}{unit}
        </span>
        {stale && (
          <span className="text-[10px] text-amber-500 font-medium">STALE</span>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ report, connectionStatus, lastHealthUpdate }: { report: HealthReport; connectionStatus: ConnectionStatus; lastHealthUpdate: number | null }) {
  const serverComponent = report.components.find((c) => c.name === 'Server');
  const pluginComponent = report.components.find((c) => c.name === 'Plugins');
  const coretuffComponent = report.components.find((c) => c.name === 'CoreTuff');
  const exceptionComponent = report.components.find((c) => c.name === 'Exceptions');
  const incidents = report.incidents || [];

  const isStale = connectionStatus === 'disconnected';
  const [showTimeline, setShowTimeline] = useState(false);

  if (showTimeline) {
    return (
      <div className="space-y-6">
        <FullTimeline incidents={incidents} onClose={() => setShowTimeline(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HealthOverview report={report} />

      <ActiveIncidentBanner incidents={incidents} />

      <div className="grid gap-6 lg:grid-cols-2">
        {serverComponent && <ServerMetrics component={serverComponent} />}
        {coretuffComponent && <CoreTuffHealth component={coretuffComponent} />}
      </div>

      <RecentIncidents incidents={incidents} onViewTimeline={() => setShowTimeline(true)} />

      {pluginComponent && <PluginHealthList component={pluginComponent} />}

      {exceptionComponent && <ExceptionsList component={exceptionComponent} />}

      {isStale && (
        <Card className="border-amber-500/50">
          <CardContent className="p-4 text-sm text-amber-600 dark:text-amber-400">
            Server disconnected. Statistics may be outdated.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ModerationTab({
  serverId,
  summary,
  summaryLoading,
  modStats,
  modStatsLoading,
  onSelectPlayer,
  onSelectPunishment,
}: {
  serverId: string;
  summary: import('@/types').ModerationSummary | undefined;
  summaryLoading: boolean;
  modStats: import('@/types').ModeratorStat[] | undefined;
  modStatsLoading: boolean;
  onSelectPlayer: (uuid: string) => void;
  onSelectPunishment: (p: Punishment) => void;
}) {
  return (
    <div className="space-y-6">
      <ModerationOverview summary={summary} isLoading={summaryLoading} />
      <PunishmentTable
        serverId={serverId}
        onSelectPlayer={onSelectPlayer}
        onSelectPunishment={onSelectPunishment}
      />
      <ModeratorStats stats={modStats} isLoading={modStatsLoading} />
      <p className="text-xs text-muted-foreground">
        Warning data is stored in memory and is reset when the server restarts.
      </p>
    </div>
  );
}

function ConfigurationTab({
  session,
  activeModule,
  onModuleChange,
  editedValues,
  onSettingChange,
  rawJson,
  onToggleRawJson,
  rawJsonText,
  onRawJsonTextChange,
  onApply,
  isApplying,
}: {
  session: { schema: Record<string, SettingDefinition[]>; values: Record<string, Record<string, unknown>> };
  activeModule: string;
  onModuleChange: (m: string) => void;
  editedValues: Record<string, Record<string, unknown>>;
  onSettingChange: (key: string, value: unknown) => void;
  rawJson: boolean;
  onToggleRawJson: () => void;
  rawJsonText: string;
  onRawJsonTextChange: (t: string) => void;
  onApply: () => void;
  isApplying: boolean;
}) {
  const modules = Object.keys(session.schema);
  const currentSettings: SettingDefinition[] = session.schema[activeModule] || [];
  const currentValues: Record<string, unknown> = editedValues[activeModule] || {};
  const grouped = groupByCategory(currentSettings);

  return (
    <div className="flex gap-0">
      <EditorSidebar
        modules={modules}
        activeModule={activeModule}
        onModuleChange={onModuleChange}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{getModuleDisplayName(activeModule)}</h2>
          <Button variant="outline" size="sm" onClick={onToggleRawJson}>
            {rawJson ? 'Form View' : 'Raw JSON'}
          </Button>
        </div>

        {rawJson ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Edit raw JSON configuration. Invalid JSON will not be saved.
            </p>
            <textarea
              className="w-full h-[60vh] rounded-md border border-input bg-card p-4 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={rawJsonText}
              onChange={(e) => onRawJsonTextChange(e.target.value)}
            />
            <Button
              size="sm"
              onClick={() => {
                try {
                  JSON.parse(rawJsonText);
                  onToggleRawJson();
                } catch {
                  // Invalid JSON, keep editing
                }
              }}
            >
              Apply JSON to Form
            </Button>
          </div>
        ) : (
          <Tabs defaultValue={Array.from(grouped.keys())[0] || ''}>
            <TabsList className="mb-4 flex-wrap h-auto">
              {Array.from(grouped.keys()).map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-sm">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            {Array.from(grouped.entries()).map(([cat, settings]) => (
              <TabsContent key={cat} value={cat}>
                <SettingCategory
                  name={cat}
                  settings={settings}
                  values={currentValues}
                  onSettingChange={onSettingChange}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeModule, setActiveModule] = useState<string>('');
  const [editedValues, setEditedValues] = useState<Record<string, Record<string, unknown>>>({});
  const [rawJson, setRawJson] = useState(false);
  const [rawJsonText, setRawJsonText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastHealthUpdate, setLastHealthUpdate] = useState<number | null>(null);
  const lastHealthUpdateRef = useRef<number | null>(null);

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
    retry: 1,
  });

  const serverId = session?.server_id;

  const { data: sessionStatus } = useQuery({
    queryKey: ['sessionStatus', sessionId],
    queryFn: () => getSessionStatus(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 10_000,
  });

  const { data: healthReport } = useQuery({
    queryKey: ['health', serverId],
    queryFn: () => getServerHealth(serverId!),
    enabled: !!serverId,
    refetchInterval: 5_000,
    retry: 3,
  });

  const { data: moderationSummary, isLoading: moderationLoading } = useQuery({
    queryKey: ['moderationSummary', serverId],
    queryFn: () => getModerationSummary(serverId!),
    enabled: !!serverId && activeTab === 'moderation',
    refetchInterval: 30_000,
  });

  const { data: moderatorStats, isLoading: moderatorStatsLoading } = useQuery({
    queryKey: ['moderatorStats', serverId],
    queryFn: () => getModeratorStats(serverId!),
    enabled: !!serverId && activeTab === 'moderation',
    refetchInterval: 30_000,
  });

  const [selectedPunishment, setSelectedPunishment] = useState<Punishment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [historyUuid, setHistoryUuid] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (sessionStatus) {
      if (!sessionStatus.valid) {
        setConnectionStatus('expired');
      } else if (sessionStatus.server_connected) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    }
  }, [sessionStatus]);

  useEffect(() => {
    if (healthReport) {
      const now = Date.now();
      setLastHealthUpdate(now);
      lastHealthUpdateRef.current = now;
    }
  }, [healthReport]);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      const interval = setInterval(() => {
        if (lastHealthUpdateRef.current) {
          setLastHealthUpdate(lastHealthUpdateRef.current);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (session) {
      const modules = Object.keys(session.schema);
      if (modules.length > 0 && !activeModule) {
        setActiveModule(modules[0]);
      }
      setEditedValues(session.values || {});
    }
  }, [session, activeModule]);

  useEffect(() => {
    if (error) {
      if (error instanceof SessionConflictError) {
        navigate('/expired', { replace: true, state: { reason: 'conflict' } });
      } else if (error instanceof IncompatibleVersionError) {
        navigate('/expired', { replace: true, state: { reason: 'version' } });
      } else {
        navigate('/expired', { replace: true });
      }
    }
  }, [error, navigate]);

  const applyMutation = useMutation({
    mutationFn: () => {
      if (!sessionId) throw new Error('No session ID');
      const patch = buildPatch(session!.schema, editedValues);
      return applyChanges(sessionId, patch);
    },
    onSuccess: (data) => {
      if (data.status === 'applied' || data.results.every((r) => r.success)) {
        const newValues = { ...editedValues };
        for (const result of data.results) {
          if (result.success && newValues[result.module]) {
            // values already reflect the edit
          }
        }
        setEditedValues(newValues);
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelSession(sessionId!),
    onSuccess: () => {
      navigate('/expired', { replace: true });
    },
  });

  const handleSettingChange = useCallback(
    (module: string, key: string, value: unknown) => {
      setEditedValues((prev) => ({
        ...prev,
        [module]: { ...(prev[module] || {}), [key]: value },
      }));
    },
    [],
  );

  const overallState = healthReport?.overall_state || 'UNKNOWN';
  const isPending = healthReport?.overall_state === 'PENDING';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Connecting to server...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center text-sm text-muted-foreground p-6">
            <p>Session not found</p>
            <p className="text-xs mt-1">The session may have expired or been invalidated.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">CoreTuff Dashboard</h1>
                <ConnectionIndicator status={connectionStatus} lastUpdate={lastHealthUpdate} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{session.server_name}</span>
                <span>&middot;</span>
                <span>v{session.plugin_version}</span>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === 'configuration' && connectionStatus === 'connected' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRawJson(!rawJson);
                        if (!rawJson) {
                          setRawJsonText(JSON.stringify(editedValues, null, 2));
                        }
                      }}
                    >
                      {rawJson ? 'Form View' : 'Raw JSON'}
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelMutation.mutate()}
                          disabled={cancelMutation.isPending}
                        >
                          Discard
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Close session without saving</TooltipContent>
                    </Tooltip>
                    <Button
                      size="sm"
                      onClick={() => applyMutation.mutate()}
                      disabled={applyMutation.isPending}
                    >
                      {applyMutation.isPending ? 'Applying...' : 'Apply'}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="px-6 pb-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="players">Players</TabsTrigger>
                  <TabsTrigger value="moderation">Moderation</TabsTrigger>
                  <TabsTrigger value="configuration">Configuration</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </header>

          <div className="p-6">
            {applyMutation.isSuccess && activeTab === 'configuration' && (
              <Card className="mb-6 border-green-500/50">
                <CardContent className="p-4 text-sm text-green-600 dark:text-green-400">
                  Changes applied successfully.
                </CardContent>
              </Card>
            )}
            {applyMutation.isError && activeTab === 'configuration' && (
              <Card className="mb-6 border-destructive/50">
                <CardContent className="p-4 text-sm text-destructive">
                  Failed to apply changes: {(applyMutation.error as Error).message}
                </CardContent>
              </Card>
            )}

            {activeTab === 'overview' ? (
              healthReport && !isPending ? (
                <OverviewTab report={healthReport} connectionStatus={connectionStatus} lastHealthUpdate={lastHealthUpdate} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  {connectionStatus === 'connecting' && (
                    <>
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="text-muted-foreground">Connecting to server...</p>
                    </>
                  )}
                  {connectionStatus === 'connected' && (
                    <>
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="text-muted-foreground">Waiting for server statistics...</p>
                    </>
                  )}
                  {connectionStatus === 'disconnected' && (
                    <p className="text-muted-foreground">Server disconnected. Waiting for reconnection...</p>
                  )}
                  {connectionStatus === 'expired' && (
                    <p className="text-muted-foreground">Session expired.</p>
                  )}
                </div>
              )
            ) : activeTab === 'players' ? (
              serverId ? (
                <PlayersTab
                  serverId={serverId}
                  onViewModeration={(uuid) => {
                    setHistoryUuid(uuid);
                    setHistoryOpen(true);
                    setActiveTab('moderation');
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <p className="text-muted-foreground">Server not connected.</p>
                </div>
              )
            ) : activeTab === 'moderation' ? (
              serverId ? (
                <ModerationTab
                  serverId={serverId}
                  summary={moderationSummary}
                  summaryLoading={moderationLoading}
                  modStats={moderatorStats?.moderators}
                  modStatsLoading={moderatorStatsLoading}
                  onSelectPlayer={(uuid) => { setHistoryUuid(uuid); setHistoryOpen(true); }}
                  onSelectPunishment={(p) => { setSelectedPunishment(p); setDetailOpen(true); }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <p className="text-muted-foreground">Server not connected.</p>
                </div>
              )
            ) : (
              <ConfigurationTab
                session={session}
                activeModule={activeModule}
                onModuleChange={setActiveModule}
                editedValues={editedValues}
                onSettingChange={(key, value) => handleSettingChange(activeModule, key, value)}
                rawJson={rawJson}
                onToggleRawJson={() => {
                  setRawJson(!rawJson);
                  if (!rawJson) {
                    setRawJsonText(JSON.stringify(editedValues, null, 2));
                  }
                }}
                rawJsonText={rawJsonText}
                onRawJsonTextChange={setRawJsonText}
                onApply={() => applyMutation.mutate()}
                isApplying={applyMutation.isPending}
              />
            )}
          </div>
        </main>
      </div>

      <PunishmentDetailDialog
        punishment={selectedPunishment}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedPunishment(null); }}
        onSelectPlayer={(uuid) => { setHistoryUuid(uuid); setHistoryOpen(true); }}
      />

      {serverId && (
        <PlayerHistoryDialog
          serverId={serverId}
          playerUuid={historyUuid}
          open={historyOpen}
          onClose={() => { setHistoryOpen(false); setHistoryUuid(null); }}
          onSelectPunishment={(p) => { setSelectedPunishment(p); setDetailOpen(true); }}
        />
      )}
    </TooltipProvider>
  );
}

function buildPatch(
  schema: Record<string, SettingDefinition[]>,
  values: Record<string, Record<string, unknown>>,
): Array<{ op: string; path: string; value: unknown }> {
  const patch: Array<{ op: string; path: string; value: unknown }> = [];
  for (const [module, moduleValues] of Object.entries(values)) {
    const moduleSchema = schema[module] || [];
    for (const def of moduleSchema) {
      const newValue = moduleValues[def.key];
      if (newValue !== undefined) {
        patch.push({
          op: 'replace',
          path: `/${module}/${def.key}`,
          value: newValue,
        });
      }
    }
  }
  return patch;
}
