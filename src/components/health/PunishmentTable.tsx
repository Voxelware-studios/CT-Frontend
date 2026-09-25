import type { Punishment, PagedResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect, useCallback } from 'react';
import { getPunishments } from '@/lib/api';

function formatTime(ts: number): string {
  if (!ts || ts === -1) return '-';
  return new Date(ts).toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function typeBadge(type: string) {
  switch (type) {
    case 'BAN': return <span className="text-xs font-medium text-red-500">BAN</span>;
    case 'TEMPBAN': return <span className="text-xs font-medium text-amber-500">TEMPBAN</span>;
    case 'IPBAN': return <span className="text-xs font-medium text-orange-500">IPBAN</span>;
    default: return <span className="text-xs font-medium">{type}</span>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'ACTIVE': return <span className="text-xs font-medium text-amber-500">Active</span>;
    case 'PARDONED': return <span className="text-xs font-medium text-emerald-500">Pardoned</span>;
    case 'EXPIRED': return <span className="text-xs font-medium text-muted-foreground">Expired</span>;
    default: return <span className="text-xs font-medium">{status}</span>;
  }
}

interface PunishmentTableProps {
  serverId: string;
  onSelectPlayer: (uuid: string) => void;
  onSelectPunishment: (punishment: Punishment) => void;
}

export function PunishmentTable({ serverId, onSelectPlayer, onSelectPunishment }: PunishmentTableProps) {
  const [data, setData] = useState<PagedResult<Punishment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPunishments(serverId, {
        page,
        pageSize: 25,
        search: search || undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        sort,
        order,
      });
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load punishments');
    } finally {
      setIsLoading(false);
    }
  }, [serverId, page, search, typeFilter, statusFilter, sort, order]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter, sort, order]);

  const handleSort = (field: string) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('desc');
    }
  };

  const sortIcon = (field: string) => {
    if (sort !== field) return <span className="text-muted-foreground ml-1">↕</span>;
    return <span className="ml-1">{order === 'asc' ? '↑' : '↓'}</span>;
  };

  if (isLoading && !data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Punishments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading punishments...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Punishments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={fetchData} className="text-xs text-blue-500 hover:text-blue-400 mt-2">Retry</button>
        </CardContent>
      </Card>
    );
  }

  const items = data?.items || [];
  const totalPages = data?.totalPages || 0;
  const total = data?.total || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Punishments</CardTitle>
          {total > 0 && (
            <span className="text-xs text-muted-foreground">
              Showing {((page - 1) * 25) + 1}–{Math.min(page * 25, total)} of {total.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <input
            type="text"
            placeholder="Search ID, player, moderator, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs rounded-md border border-border bg-card px-3 py-1.5 text-foreground flex-1 min-w-[200px]"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs rounded-md border border-border bg-card px-2 py-1 text-foreground"
          >
            <option value="ALL">All types</option>
            <option value="BAN">Ban</option>
            <option value="TEMPBAN">Tempban</option>
            <option value="IPBAN">IP Ban</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-md border border-border bg-card px-2 py-1 text-foreground"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PARDONED">Pardoned</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No punishments have been recorded.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 cursor-pointer hover:text-foreground" onClick={() => handleSort('id')}>
                      ID{sortIcon('id')}
                    </th>
                    <th className="text-left py-2 px-2 cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>
                      Player{sortIcon('name')}
                    </th>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Duration</th>
                    <th className="text-left py-2 px-2 cursor-pointer hover:text-foreground" onClick={() => handleSort('expires_at')}>
                      Expires{sortIcon('expires_at')}
                    </th>
                    <th className="text-left py-2 px-2 cursor-pointer hover:text-foreground" onClick={() => handleSort('moderator')}>
                      Moderator{sortIcon('moderator')}
                    </th>
                    <th className="text-left py-2 px-2">Reason</th>
                    <th className="text-left py-2 px-2 cursor-pointer hover:text-foreground" onClick={() => handleSort('created_at')}>
                      Issued{sortIcon('created_at')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => onSelectPunishment(p)}
                    >
                      <td className="py-2 px-2 font-mono">{p.id || '-'}</td>
                      <td className="py-2 px-2">
                        <button
                          className="text-blue-500 hover:text-blue-400 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.player?.uuid) onSelectPlayer(p.player.uuid);
                          }}
                        >
                          {p.player?.name || 'Unknown'}
                        </button>
                      </td>
                      <td className="py-2 px-2">{typeBadge(p.type || 'UNKNOWN')}</td>
                      <td className="py-2 px-2">{statusBadge(p.status || 'UNKNOWN')}</td>
                      <td className="py-2 px-2">{p.duration || '-'}</td>
                      <td className="py-2 px-2">{!p.expiresAt || p.expiresAt === -1 ? 'Never' : formatTime(p.expiresAt)}</td>
                      <td className="py-2 px-2">{p.moderator || '-'}</td>
                      <td className="py-2 px-2 max-w-[200px] truncate" title={p.reason || ''}>{p.reason || '-'}</td>
                      <td className="py-2 px-2">{formatTime(p.issuedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="text-xs rounded-md border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`text-xs rounded-md px-2 py-1 ${
                          page === pageNum
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-muted'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="text-xs rounded-md border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
