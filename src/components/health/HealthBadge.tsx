import type { HealthState } from '@/types';
import { cn } from '@/lib/utils';

const stateConfig: Record<HealthState, { label: string; className: string }> = {
  HEALTHY: {
    label: 'Healthy',
    className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  },
  WARNING: {
    label: 'Warning',
    className: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  },
  CRITICAL: {
    label: 'Critical',
    className: 'bg-red-500/15 text-red-500 border-red-500/30',
  },
  UNKNOWN: {
    label: 'Unknown',
    className: 'bg-muted text-muted-foreground border-border',
  },
  PENDING: {
    label: 'Pending',
    className: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  },
};

export function HealthBadge({
  state,
  size = 'default',
}: {
  state: HealthState;
  size?: 'sm' | 'default';
}) {
  const config = stateConfig[state] || stateConfig.UNKNOWN;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs',
        config.className
      )}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-1.5 w-1.5',
          state === 'HEALTHY' && 'bg-emerald-500',
          state === 'WARNING' && 'bg-amber-500',
          state === 'CRITICAL' && 'bg-red-500',
          state === 'UNKNOWN' && 'bg-muted-foreground',
          state === 'PENDING' && 'bg-blue-500',
          'mr-1.5'
        )}
      />
      {config.label}
    </span>
  );
}
