import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SUPPORTED_PLUGIN_VERSION, APP_VERSION } from '@/lib/version';

export function Expired() {
  const location = useLocation();
  const reason = (location.state as { reason?: string } | null)?.reason;

  if (reason === 'version') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Unsupported CoreTuff Version</CardTitle>
            <CardDescription>
              This panel ({APP_VERSION}) only works with CoreTuff {SUPPORTED_PLUGIN_VERSION}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Your server is running an older (or newer) version of CoreTuff, so this session cannot be
              opened.
            </p>
            <p>
              Update CoreTuff to <strong className="text-foreground">{SUPPORTED_PLUGIN_VERSION}</strong> and
              start a new session with <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/ct editor</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reason === 'conflict') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Session Taken Over</CardTitle>
            <CardDescription>This session was opened in another browser tab</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground space-y-2">
            <p>Only one tab can hold a session at a time.</p>
            <p>
              Use <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/ct editor</code> in-game to start a
              new session.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Session Expired</CardTitle>
          <CardDescription>
            This editor session is no longer available
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground space-y-2">
          <p>Sessions expire after 15 minutes or when explicitly closed.</p>
          <p>
            Use <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/ct editor</code> in-game to start a new session.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
