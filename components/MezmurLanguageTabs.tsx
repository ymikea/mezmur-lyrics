'use client';

import { useMemo, useState } from 'react';
import { LANGUAGES, Language, Mezmur } from '@/types/database';
import { renderStanzaText } from '@/utils/lyrics';

interface MezmurLanguageTabsProps {
  mezmursByLanguage: Partial<Record<Language, Mezmur>>;
  defaultLanguage: Language;
}

export default function MezmurLanguageTabs({
  mezmursByLanguage,
  defaultLanguage,
}: MezmurLanguageTabsProps) {
  const availableLanguages = useMemo(
    () => LANGUAGES.filter((language) => Boolean(mezmursByLanguage[language])),
    [mezmursByLanguage],
  );
  const [activeLanguage, setActiveLanguage] = useState<Language>(
    mezmursByLanguage[defaultLanguage] ? defaultLanguage : (availableLanguages[0] ?? defaultLanguage),
  );

  const activeMezmur = mezmursByLanguage[activeLanguage];

  if (!activeMezmur) {
    return <p className="banner banner--info">Lyrics are not available yet for this mezmur.</p>;
  }

  const stanzas = [...activeMezmur.lyrics].sort((a, b) => a.stanza_order - b.stanza_order);

  return (
    <>
      <div className="language-tabs" role="tablist" aria-label="Mezmur language options">
        {LANGUAGES.map((language) => {
          const hasLyrics = Boolean(mezmursByLanguage[language]);
          return (
            <button
              key={language}
              type="button"
              role="tab"
              className={`language-tab${activeLanguage === language ? ' language-tab--active' : ''}`}
              disabled={!hasLyrics}
              aria-selected={activeLanguage === language}
              onClick={() => setActiveLanguage(language)}
            >
              {language}
            </button>
          );
        })}
      </div>

      <p className="card__meta">
        {activeMezmur.language} • {activeMezmur.liturgical_season}
      </p>

      <section className="card" style={{ marginTop: 12 }}>
        {stanzas.map((stanza) => (
          <div
            key={`${activeLanguage}-${stanza.stanza_order}-${stanza.text}`}
            className={`stanza${stanza.is_chorus ? ' stanza--chorus' : ''}`}
          >
            <p>{renderStanzaText(stanza.text)}</p>
          </div>
        ))}
      </section>
    </>
  );
}
