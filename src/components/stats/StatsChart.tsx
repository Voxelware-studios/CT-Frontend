import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerHistory, getPlayerHistory } from '@/lib/stats-api';

const RANGES = [
  { label: '1d', value: '1d' },
  { label: '1w', value: '1w' },
  { label: '1m', value: '1m' },
  { label: '3m', value: '3m' },
  { label: '1y', value: '1y' },
  { label: 'All', value: 'all' },
];

interface StatsChartProps {
  title: string;
  type: 'servers' | 'players';
  color: string;
}

function formatXAxis(dateStr: string, range: string): string {
  const d = new Date(dateStr);
  if (range === '1d') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (range === '1w' || range === '1m') return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return d.toLocaleDateString([], { month: 'short', year: '2-digit' });
}

function EmptyState({ type }: { type: 'servers' | 'players' }) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground text-sm">
        Not enough data yet. As CoreTuff installations report statistics, the {type} chart will populate.
      </p>
    </div>
  );
}

export function StatsChart({ title, type, color }: StatsChartProps) {
  const [range, setRange] = useState('all');

  const fetcher = type === 'servers' ? getServerHistory : getPlayerHistory;

  const { data, isLoading } = useQuery({
    queryKey: ['stats', type, range],
    queryFn: () => fetcher(range),
    refetchInterval: 120_000,
  });

  const chartData = data?.data?.map((p) => ({
    date: p.date,
    count: p.count,
    displayDate: formatXAxis(p.date, range),
  })) || [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  range === r.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-sm">Loading statistics...</p>
          </div>
        ) : chartData.length === 0 ? (
          <EmptyState type={type} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
