'use client';

import { useState, useTransition } from 'react';
import { Mezmur, ReviewStatus } from '@/types/database';
import { deleteMezmur, updateMezmurStatus } from './actions';

interface AdminTableProps {
  mezmurs: Mezmur[];
  canDelete: boolean;
}

const STATUSES: ReviewStatus[] = ['pending_review', 'approved', 'rejected'];

export default function AdminTable({ mezmurs, canDelete }: AdminTableProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  return (
    <section style={{ marginTop: 16 }}>
      {message && <p style={{ marginBottom: 8 }}>{message}</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {mezmurs.map((mezmur) => (
          <article key={mezmur.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <h2>{mezmur.title}</h2>
            <p>Artist: {mezmur.artist}</p>
            <p>
              {mezmur.language} • {mezmur.liturgical_season}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <label htmlFor={`status-${mezmur.id}`}>Status</label>
              <select
                id={`status-${mezmur.id}`}
                defaultValue={mezmur.status}
                disabled={pending}
                onChange={(event) => {
                  const status = event.target.value as ReviewStatus;
                  startTransition(async () => {
                    try {
                      await updateMezmurStatus(mezmur.id, status);
                      setMessage('Status updated.');
                    } catch (error) {
                      const text = error instanceof Error ? error.message : 'Failed to update status.';
                      setMessage(text);
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

              {canDelete && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      try {
                        await deleteMezmur(mezmur.id);
                        setMessage('Mezmur deleted.');
                      } catch (error) {
                        const text = error instanceof Error ? error.message : 'Failed to delete mezmur.';
                        setMessage(text);
                      }
                    });
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
