'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Language, LiturgicalSeason, Stanza } from '@/types/database';
import { createClient } from '@/utils/supabase/client';

const LANGUAGES: Language[] = ['Amharic', 'Tigrinya', 'Geez', 'Oromo', 'English'];
const SEASONS: LiturgicalSeason[] = [
  'Fast of the Prophets',
  'Nativity',
  'Epiphany',
  'Great Lent',
  'Holy Week',
  'Resurrection',
  'Pentecost',
  'Assumption',
  'General',
];

export default function SubmitPage() {
  const router = useRouter();
  type EditableStanza = Stanza & { localId: string };

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [language, setLanguage] = useState<Language>('Amharic');
  const [season, setSeason] = useState<LiturgicalSeason>('General');
  const [stanzas, setStanzas] = useState<EditableStanza[]>([
    { localId: crypto.randomUUID(), stanza_order: 1, text: '', is_chorus: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateStanza = (index: number, stanza: EditableStanza) => {
    setStanzas((prev) => prev.map((item, i) => (i === index ? stanza : item)));
  };

  const addStanza = () => {
    setStanzas((prev) => [
      ...prev,
      { localId: crypto.randomUUID(), stanza_order: prev.length + 1, text: '', is_chorus: false },
    ]);
  };

  const removeStanza = (index: number) => {
    setStanzas((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((stanza, i) => ({ ...stanza, stanza_order: i + 1 })),
    );
  };

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

    if (!title.trim() || !artist.trim() || cleanStanzas.length === 0) {
      setError('Title, artist, and at least one stanza are required.');
      return;
    }

    setLoading(true);

    const { error: insertError } = await supabase.from('mezmurs').insert({
      title: title.trim(),
      artist: artist.trim(),
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
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Submit Mezmur</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <input
          placeholder="Artist"
          value={artist}
          onChange={(event) => setArtist(event.target.value)}
          required
        />

        <label>
          Language
          <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
            {LANGUAGES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label>
          Liturgical Season
          <select
            value={season}
            onChange={(event) => setSeason(event.target.value as LiturgicalSeason)}
          >
            {SEASONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <section style={{ display: 'grid', gap: 10 }}>
          <h2>Stanzas</h2>
          {stanzas.map((stanza, index) => (
            <div key={stanza.localId} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
              <p>Stanza {index + 1}</p>
              <textarea
                value={stanza.text}
                onChange={(event) =>
                  updateStanza(index, {
                    ...stanza,
                    text: event.target.value,
                  })
                }
                rows={4}
                style={{ width: '100%', marginTop: 8 }}
              />
              <label style={{ display: 'block', marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={stanza.is_chorus}
                  onChange={(event) =>
                    updateStanza(index, {
                      ...stanza,
                      is_chorus: event.target.checked,
                    })
                  }
                />{' '}
                Chorus
              </label>
              {stanzas.length > 1 && (
                <button type="button" onClick={() => removeStanza(index)} style={{ marginTop: 8 }}>
                  <Trash2 size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Remove
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addStanza}>
            <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Add stanza
          </button>
        </section>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit for review'}
        </button>
      </form>
    </main>
  );
}
