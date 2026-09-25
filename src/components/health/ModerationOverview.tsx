import type { ModerationSummary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ModerationOverviewProps {
  summary: ModerationSummary | undefined;
  isLoading: boolean;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

export function ModerationOverview({ summary, isLoading }: ModerationOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading moderation data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Moderation data unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Moderation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          <StatCard label="Total Punishments" value={summary.totalPunishments} />
          <StatCard label="Active" value={summary.activePunishments} />
          <StatCard label="Bans" value={summary.bans} />
          <StatCard label="Temp Bans" value={summary.tempBans} />
          <StatCard label="IP Bans" value={summary.ipBans} />
          <StatCard label="Pardoned" value={summary.pardoned} />
          <StatCard label="Expired" value={summary.expired} />
          <StatCard label="This Week" value={summary.thisWeek} />
          <StatCard label="This Month" value={summary.thisMonth} />
        </div>
      </CardContent>
    </Card>
  );
}
