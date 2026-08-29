'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LANGUAGES, LITURGICAL_SEASONS, Language, LiturgicalSeason, Mezmur } from '@/types/database';
import StanzaEditor, { EditableStanza } from '@/components/StanzaEditor';
import { updateMezmur } from '../../actions';

interface EditMezmurFormProps {
  mezmur: Mezmur;
}

export default function EditMezmurForm({ mezmur }: EditMezmurFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(mezmur.title);
  const [language, setLanguage] = useState<Language>(mezmur.language);
  const [season, setSeason] = useState<LiturgicalSeason>(mezmur.liturgical_season);
  const [stanzas, setStanzas] = useState<EditableStanza[]>(
    [...mezmur.lyrics]
      .sort((a, b) => a.stanza_order - b.stanza_order)
      .map((stanza) => ({ ...stanza, localId: crypto.randomUUID() })),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const cleanStanzas = stanzas
      .filter((stanza) => stanza.text.trim().length > 0)
      .map((stanza, index) => ({
        stanza_order: index + 1,
        text: stanza.text,
        is_chorus: stanza.is_chorus,
      }));

    if (!title.trim() || cleanStanzas.length === 0) {
      setError('Title and at least one stanza are required.');
      return;
    }

    setLoading(true);

    try {
      await updateMezmur(mezmur.id, {
        title: title.trim(),
        language,
        liturgical_season: season,
        lyrics: cleanStanzas,
      });
      router.push('/admin');
      router.refresh();
    } catch (updateError) {
      const text = updateError instanceof Error ? updateError.message : 'Failed to update mezmur.';
      setError(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'grid', gap: 14 }}>
      <input
        className="input"
        placeholder="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <label className="field">
        Language
        <select
          className="input"
          value={language}
          onChange={(event) => setLanguage(event.target.value as Language)}
        >
          {LANGUAGES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Liturgical Season
        <select
          className="input"
          value={season}
          onChange={(event) => setSeason(event.target.value as LiturgicalSeason)}
        >
          {LITURGICAL_SEASONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <StanzaEditor stanzas={stanzas} onChange={setStanzas} />

      {error && <p className="banner banner--error">{error}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save changes'}
        </button>
        <button type="button" className="btn" onClick={() => router.push('/admin')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
