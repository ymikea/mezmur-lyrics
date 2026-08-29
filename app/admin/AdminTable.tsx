'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mezmur, ReviewStatus } from '@/types/database';
import { renderStanzaText } from '@/utils/lyrics';
import { deleteMezmur, updateMezmurStatus } from './actions';

interface AdminTableProps {
  mezmurs: Mezmur[];
  canDelete: boolean;
}

const STATUSES: ReviewStatus[] = ['pending_review', 'approved', 'rejected'];

export default function AdminTable({ mezmurs, canDelete }: AdminTableProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusById, setStatusById] = useState<Record<string, ReviewStatus>>(() =>
    Object.fromEntries(mezmurs.map((mezmur) => [mezmur.id, mezmur.status])),
  );

  return (
    <section style={{ marginTop: 20 }}>
      {message && <p className="banner banner--info">{message}</p>}
      <div className="card-list">
        {mezmurs.map((mezmur) => (
          <article key={mezmur.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="card__title">{mezmur.title}</h2>
              <span className={`badge badge--${statusById[mezmur.id] ?? mezmur.status}`}>
                {(statusById[mezmur.id] ?? mezmur.status).replace('_', ' ')}
              </span>
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
        ))}
      </div>
    </section>
  );
}
