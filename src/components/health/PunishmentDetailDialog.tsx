import type { Punishment } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function formatTime(ts: number): string {
  if (!ts || ts === -1) return '-';
  return new Date(ts).toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-right">{value || 'Not available'}</span>
    </div>
  );
}

interface PunishmentDetailDialogProps {
  punishment: Punishment | null;
  open: boolean;
  onClose: () => void;
  onSelectPlayer: (uuid: string) => void;
}

export function PunishmentDetailDialog({ punishment, open, onClose, onSelectPlayer }: PunishmentDetailDialogProps) {
  if (!punishment) return null;

  const p = punishment;
  const player = p.player || { uuid: null, name: 'Unknown' };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Punishment #{p.id || 'Unknown'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-0">
          <DetailRow label="Player" value={
            player.uuid ? (
              <button
                className="text-blue-500 hover:text-blue-400 hover:underline"
                onClick={() => { onClose(); onSelectPlayer(player.uuid!); }}
              >
                {player.name}
              </button>
            ) : player.name
          } />
          {player.uuid && <DetailRow label="UUID" value={<span className="font-mono">{player.uuid}</span>} />}
          <DetailRow label="Type" value={p.type || 'Unknown'} />
          <DetailRow label="Status" value={p.status || 'Unknown'} />
          <DetailRow label="Duration" value={p.duration || (p.expiresAt === -1 ? 'Permanent' : '-')} />
          <DetailRow label="Issued" value={formatTime(p.issuedAt)} />
          <DetailRow label="Expires" value={!p.expiresAt || p.expiresAt === -1 ? 'Never' : formatTime(p.expiresAt)} />
          <DetailRow label="Moderator" value={p.moderator || 'Unknown'} />
          <DetailRow label="Reason" value={p.reason || 'No reason provided'} />
          {p.ip && <DetailRow label="IP" value={<span className="font-mono">{p.ip}</span>} />}
          {p.pardonedBy && <DetailRow label="Pardoned By" value={p.pardonedBy} />}
          {p.pardonReason && <DetailRow label="Pardon Reason" value={p.pardonReason} />}
          {p.removedAt && p.removedAt > 0 && <DetailRow label="Pardoned At" value={formatTime(p.removedAt)} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
