import { HeroStats } from '@/components/stats/HeroStats';
import { StatsChart } from '@/components/stats/StatsChart';
import { DistributionChart } from '@/components/stats/DistributionChart';
import { ServerEnvironment } from '@/components/stats/ServerEnvironment';
import { StatsFooter } from '@/components/stats/StatsFooter';
import { useQuery } from '@tanstack/react-query';
import { getPlatformStats } from '@/lib/stats-api';

export function Landing() {
  const { data: platforms } = useQuery({
    queryKey: ['stats', 'platforms'],
    queryFn: getPlatformStats,
    refetchInterval: 120_000,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">CoreTuff</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Modern server management for Paper & Folia
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://docs.coretuff.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </a>
              <a
                href="https://modrinth.com/plugin/coretuff"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Modrinth
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-10">
        <section>
          <HeroStats />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Servers using CoreTuff</h2>
          <StatsChart title="Historical" type="servers" color="#10b981" />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Players using CoreTuff</h2>
          <StatsChart title="Historical" type="players" color="#3b82f6" />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Platform</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <DistributionChart
              title="Server Software"
              data={platforms?.serverSoftware || []}
              emptyMessage="Not enough data yet."
            />
            <DistributionChart
              title="Minecraft Version"
              data={platforms?.minecraftVersion || []}
              emptyMessage="Not enough data yet."
            />
            <DistributionChart
              title="Java Version"
              data={platforms?.javaVersion || []}
              emptyMessage="Not enough data yet."
            />
            <DistributionChart
              title="CoreTuff Version"
              data={platforms?.coretuffVersion || []}
              emptyMessage="Not enough data yet."
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Server Environment</h2>
          <ServerEnvironment />
        </section>
      </main>

      <StatsFooter />
    </div>
  );
}
