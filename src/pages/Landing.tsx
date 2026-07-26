import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { APP_VERSION } from '@/lib/version';

export function Landing() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">CoreTuff Editor</CardTitle>
          <CardDescription>
            Web-based configuration editor for CoreTuff Minecraft plugin
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            Use <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/ct editor</code> in-game to create a
            configuration session.
          </p>
          <p>
            You will receive a unique URL to access this editor.
          </p>
          <p className="pt-4 text-xs text-muted-foreground/60">{APP_VERSION}</p>
        </CardContent>
      </Card>
    </div>
  );
}
