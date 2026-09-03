'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { Mezmur, ReviewStatus } from '@/types/database';
import { renderStanzaText } from '@/utils/lyrics';
import { deleteMezmur, updateMezmurStatus } from './actions';

interface AdminTableProps {
  mezmurs: Mezmur[];
  canDelete: boolean;
}

const STATUSES: ReviewStatus[] = ['pending_review', 'approved', 'rejected'];
type FilterValue = 'all' | ReviewStatus;

function formatRelativeTime(dateString: string): string {
  const diffMs = Date.parse(dateString) - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];

  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        Math.round(diffSeconds / secondsInUnit),
        unit,
      );
    }
  }
  return 'just now';
}

export default function AdminTable({ mezmurs, canDelete }: AdminTableProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');
  const [statusById, setStatusById] = useState<Record<string, ReviewStatus>>(() =>
    Object.fromEntries(mezmurs.map((mezmur) => [mezmur.id, mezmur.status])),
  );

  const counts = useMemo(() => {
    const result: Record<FilterValue, number> = {
      all: mezmurs.length,
      pending_review: 0,
      approved: 0,
      rejected: 0,
    };
    for (const mezmur of mezmurs) {
      result[statusById[mezmur.id] ?? mezmur.status] += 1;
    }
    return result;
  }, [mezmurs, statusById]);

  const visibleMezmurs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mezmurs.filter((mezmur) => {
      const status = statusById[mezmur.id] ?? mezmur.status;
      if (filter !== 'all' && status !== filter) return false;
      if (query && !mezmur.title.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [mezmurs, statusById, filter, search]);

  return (
    <section style={{ marginTop: 20 }}>
      {message && <p className="banner banner--info">{message}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {(['all', ...STATUSES] as FilterValue[]).map((value) => (
          <button
            key={value}
            type="button"
            className="btn"
            style={
              filter === value
                ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }
                : undefined
            }
            onClick={() => setFilter(value)}
          >
            {value === 'all' ? 'All' : value.replace('_', ' ')} ({counts[value]})
          </button>
        ))}
      </div>

      <input
        className="input"
        placeholder="Search by title..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        style={{ marginTop: 12, width: '100%' }}
      />

      <p className="card__meta" style={{ marginTop: 12 }}>
        Sorted by most recently edited. {visibleMezmurs.length} of {mezmurs.length} shown.
      </p>

      <div className="card-list">
        {visibleMezmurs.length === 0 && <p className="card__meta">No mezmurs match this filter.</p>}
        {visibleMezmurs.map((mezmur) => {
          const wasEdited = mezmur.updated_at !== mezmur.created_at;
          return (
            <article key={mezmur.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <h2 className="card__title">{mezmur.title}</h2>
                <span className={`badge badge--${statusById[mezmur.id] ?? mezmur.status}`}>
                  {(statusById[mezmur.id] ?? mezmur.status).replace('_', ' ')}
                </span>
                {wasEdited && (
                  <span className="badge" style={{ background: '#eef2ff', color: '#3730a3' }}>
                    edited {formatRelativeTime(mezmur.updated_at)}
                  </span>
                )}
              </div>
              <p className="card__meta">
                {mezmur.language} • {mezmur.liturgical_season}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <label htmlFor={`status-${mezmur.id}`} className="card__meta">
                  Status
                </label>
                <select
                  id={`status-${mezmur.id}`}
                  className="input"
                  value={statusById[mezmur.id] ?? mezmur.status}
                  disabled={isPending && pendingRowId === mezmur.id}
                  onChange={(event) => {
                    const status = event.target.value as ReviewStatus;
                    const previousStatus = statusById[mezmur.id] ?? mezmur.status;
                    setStatusById((prev) => ({ ...prev, [mezmur.id]: status }));
                    setPendingRowId(mezmur.id);
                    startTransition(async () => {
                      try {
                        await updateMezmurStatus(mezmur.id, status);
                        setMessage('Status updated.');
                      } catch (error) {
                        setStatusById((prev) => ({ ...prev, [mezmur.id]: previousStatus }));
                        const text = error instanceof Error ? error.message : 'Failed to update status.';
                        setMessage(text);
                      } finally {
                        setPendingRowId(null);
                      }
                    });
                  }}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn"
                  onClick={() => setExpandedId((prev) => (prev === mezmur.id ? null : mezmur.id))}
                >
                  {expandedId === mezmur.id ? 'Hide lyrics' : 'View lyrics'}
                </button>

                <Link href={`/admin/${mezmur.id}/edit`} className="btn">
                  Edit
                </Link>

                {canDelete && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={isPending && pendingRowId === mezmur.id}
                    onClick={() => {
                      setPendingRowId(mezmur.id);
                      startTransition(async () => {
                        try {
                          await deleteMezmur(mezmur.id);
                          setMessage('Mezmur deleted.');
                        } catch (error) {
                          const text = error instanceof Error ? error.message : 'Failed to delete mezmur.';
                          setMessage(text);
                        } finally {
                          setPendingRowId(null);
                        }
                      });
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>

              {expandedId === mezmur.id && (
                <div className="card" style={{ marginTop: 12 }}>
                  {[...mezmur.lyrics]
                    .sort((a, b) => a.stanza_order - b.stanza_order)
                    .map((stanza, index) => (
                      <div
                        key={index}
                        className={`stanza${stanza.is_chorus ? ' stanza--chorus' : ''}`}
                      >
                        <p>{renderStanzaText(stanza.text)}</p>
                      </div>
                    ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
