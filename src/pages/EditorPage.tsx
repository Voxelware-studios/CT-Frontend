import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { APP_VERSION } from '@/lib/version';
import { getSession, checkSessionStatus, applyChanges, cancelSession } from '@/lib/api';
import { getSettingValue, groupByCategory, getModuleDisplayName } from '@/lib/schema-utils';
import type { SettingDefinition } from '@/types';
import { EditorSidebar } from '@/components/EditorSidebar';
import { SettingCategory } from '@/components/SettingCategory';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

export function EditorPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string>('');
  const [editedValues, setEditedValues] = useState<Record<string, Record<string, unknown>>>({});
  const [rawJson, setRawJson] = useState(false);
  const [rawJsonText, setRawJsonText] = useState('');

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
    retry: 1,
  });

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
      navigate('/expired', { replace: true });
    }
  }, [error, navigate]);

  const statusQuery = useQuery({
    queryKey: ['status', sessionId],
    queryFn: () => checkSessionStatus(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 60_000,
  });

  const applyMutation = useMutation({
    mutationFn: () => {
      if (!sessionId) throw new Error('No session ID');
      const patch = buildPatch(session!.schema, editedValues);
      return applyChanges(sessionId, patch);
    },
    onSuccess: (data) => {
      if (data.status === 'applied' || data.results.every((r) => r.success)) {
        // Update values with what was applied
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Session not found</p>
      </div>
    );
  }

  const modules = Object.keys(session.schema);
  const currentSettings: SettingDefinition[] = session.schema[activeModule] || [];
  const currentValues: Record<string, unknown> = editedValues[activeModule] || {};
  const grouped = groupByCategory(currentSettings);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden">
        <EditorSidebar
          modules={modules}
          activeModule={activeModule}
          onModuleChange={setActiveModule}
        />
        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-6 py-3">
              <div>
                <h1 className="text-lg font-semibold">
                  {getModuleDisplayName(activeModule)}
                  <span className="ml-2 text-xs text-muted-foreground/50 font-normal">{APP_VERSION}</span>
                </h1>
                <p className="text-xs text-muted-foreground">
                  Server: {session.server_name} &middot; Session expires in{' '}
                  {Math.max(0, Math.floor((session.expires_at - Date.now()) / 60000))}m
                </p>
              </div>
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </header>

          <div className="p-6">
            {applyMutation.isSuccess && (
              <Card className="mb-6 border-green-500/50">
                <CardContent className="p-4 text-sm text-green-600 dark:text-green-400">
                  Changes applied successfully.
                </CardContent>
              </Card>
            )}
            {applyMutation.isError && (
              <Card className="mb-6 border-destructive/50">
                <CardContent className="p-4 text-sm text-destructive">
                  Failed to apply changes: {(applyMutation.error as Error).message}
                </CardContent>
              </Card>
            )}

            {rawJson ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Edit raw JSON configuration. Invalid JSON will not be saved.
                </p>
                <textarea
                  className="w-full h-[60vh] rounded-md border border-input bg-card p-4 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={rawJsonText}
                  onChange={(e) => setRawJsonText(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(rawJsonText);
                      setEditedValues(parsed);
                      setRawJson(false);
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
                      onSettingChange={(key, value) => handleSettingChange(activeModule, key, value)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </main>
      </div>
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
