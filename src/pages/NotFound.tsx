import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">404</CardTitle>
          <CardDescription>Page not found</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>The page you are looking for does not exist.</p>
        </CardContent>
      </Card>
    </div>
  );
}
