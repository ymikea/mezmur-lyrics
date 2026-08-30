'use client';

import { useRef, useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Stanza } from '@/types/database';
import { renderStanzaText } from '@/utils/lyrics';

export type EditableStanza = Stanza & { localId: string };

export function createEmptyStanza(order: number): EditableStanza {
  return { localId: crypto.randomUUID(), stanza_order: order, text: '', is_chorus: false };
}

interface StanzaEditorProps {
  stanzas: EditableStanza[];
  onChange: (stanzas: EditableStanza[]) => void;
}

export default function StanzaEditor({ stanzas, onChange }: StanzaEditorProps) {
  const [repeatInputs, setRepeatInputs] = useState<Record<string, number>>({});
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  const updateStanza = (localId: string, patch: Partial<EditableStanza>) => {
    onChange(stanzas.map((stanza) => (stanza.localId === localId ? { ...stanza, ...patch } : stanza)));
  };

  const addStanza = () => {
    onChange([...stanzas, createEmptyStanza(stanzas.length + 1)]);
  };

  const removeStanza = (localId: string) => {
    onChange(
      stanzas
        .filter((stanza) => stanza.localId !== localId)
        .map((stanza, i) => ({ ...stanza, stanza_order: i + 1 })),
    );
  };

  const highlightSelection = (stanza: EditableStanza) => {
    const el = textareaRefs.current.get(stanza.localId);
    if (!el || el.selectionStart === el.selectionEnd) {
      return;
    }

    const { selectionStart: start, selectionEnd: end } = el;
    const repeatCount = repeatInputs[stanza.localId] ?? 2;
    const before = stanza.text.slice(0, start);
    const selected = stanza.text.slice(start, end);
    const after = stanza.text.slice(end);
    const newText = `${before}***${selected}***^${repeatCount}${after}`;

    updateStanza(stanza.localId, { text: newText });

    requestAnimationFrame(() => {
      el.focus();
      const cursor = before.length + 6 + selected.length + String(repeatCount).length + 1;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const setTextareaRef = useCallback((localId: string, el: HTMLTextAreaElement | null) => {
    if (el) {
      textareaRefs.current.set(localId, el);
    } else {
      textareaRefs.current.delete(localId);
    }
  }, []);

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>Stanzas</h2>
      <p className="card__meta">
        Type or paste the lyrics, highlight any word or phrase, choose a repeat count, then click
        &ldquo;Highlight selection&rdquo; to mark it as repeated.
      </p>
      {stanzas.map((stanza) => (
        <div key={stanza.localId} className="card">
          <p className="card__meta">Stanza {stanza.stanza_order}</p>
          <textarea
            ref={(el) => setTextareaRef(stanza.localId, el)}
            className="input"
            value={stanza.text}
            onChange={(event) => updateStanza(stanza.localId, { text: event.target.value })}
            rows={4}
            style={{ width: '100%', marginTop: 8 }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <label className="card__meta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              Repeat ×
              <input
                type="number"
                min={2}
                className="input"
                style={{ width: 60 }}
                value={repeatInputs[stanza.localId] ?? 2}
                onChange={(event) =>
                  setRepeatInputs((prev) => ({
                    ...prev,
                    [stanza.localId]: Math.max(2, Number(event.target.value) || 2),
                  }))
                }
              />
            </label>
            <button type="button" className="btn" onClick={() => highlightSelection(stanza)}>
              Highlight selection
            </button>
          </div>

          {stanza.text.trim().length > 0 && (
            <div className="stanza" style={{ marginTop: 8, padding: '8px 0 0' }}>
              <p className="card__meta">Preview</p>
              <p>{renderStanzaText(stanza.text)}</p>
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <input
              type="checkbox"
              checked={stanza.is_chorus}
              onChange={(event) => updateStanza(stanza.localId, { is_chorus: event.target.checked })}
            />
            Chorus
          </label>

          {stanzas.length > 1 && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeStanza(stanza.localId)}
              style={{ marginTop: 10 }}
            >
              <Trash2 size={16} /> Remove
            </button>
          )}
        </div>
      ))}

      <button type="button" className="btn" onClick={addStanza}>
        <Plus size={16} /> Add stanza
      </button>
    </section>
  );
}
