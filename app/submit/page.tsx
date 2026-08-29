'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LANGUAGES, LITURGICAL_SEASONS, Language, LiturgicalSeason } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import StanzaEditor, { EditableStanza, createEmptyStanza } from '@/components/StanzaEditor';

export default function SubmitPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<Language>('Tigrinya');
  const [season, setSeason] = useState<LiturgicalSeason>('General');
  const [stanzas, setStanzas] = useState<EditableStanza[]>([createEmptyStanza(1)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const supabase = createClient();

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

    const { error: insertError } = await supabase.from('mezmurs').insert({
      title: title.trim(),
      language,
      liturgical_season: season,
      lyrics: cleanStanzas,
      status: 'pending_review',
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <main className="container">
      <h1 className="page-title">Submit Mezmur</h1>
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

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit for review'}
        </button>
      </form>
    </main>
  );
}
