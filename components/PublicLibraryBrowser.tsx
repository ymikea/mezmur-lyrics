'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SeasonSidebar from '@/components/SeasonSidebar';
import { LANGUAGES, Language, LiturgicalSeason, Mezmur } from '@/types/database';

interface PublicLibraryBrowserProps {
  mezmurs: Mezmur[];
  defaultSeason: LiturgicalSeason | 'all';
}

export default function PublicLibraryBrowser({ mezmurs, defaultSeason }: PublicLibraryBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<LiturgicalSeason | 'all'>(defaultSeason);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'all'>('all');

  const filteredMezmurs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return mezmurs.filter((mezmur) => {
      const matchesSeason =
        selectedSeason === 'all' || mezmur.liturgical_season === selectedSeason;
      const matchesTitle =
        normalizedQuery.length === 0 || mezmur.title.toLowerCase().includes(normalizedQuery);
      const matchesLanguage = selectedLanguage === 'all' || mezmur.language === selectedLanguage;

      return matchesSeason && matchesTitle && matchesLanguage;
    });
  }, [mezmurs, searchQuery, selectedSeason, selectedLanguage]);

  return (
    <div className="library-layout">
      <SeasonSidebar
        activeSeason={selectedSeason}
        onSeasonChange={setSelectedSeason}
        showEnglishLabels={selectedLanguage === 'English'}
      />
      <div className="library-content">
        <div className="language-tabs" role="tablist" aria-label="Filter mezmurs by language">
          <button
            type="button"
            role="tab"
            className={`language-tab${selectedLanguage === 'all' ? ' language-tab--active' : ''}`}
            aria-selected={selectedLanguage === 'all'}
            onClick={() => setSelectedLanguage('all')}
          >
            All Languages
          </button>
          {LANGUAGES.map((language) => (
            <button
              key={language}
              type="button"
              role="tab"
              className={`language-tab${selectedLanguage === language ? ' language-tab--active' : ''}`}
              aria-selected={selectedLanguage === language}
              onClick={() => setSelectedLanguage(language)}
            >
              {language}
            </button>
          ))}
        </div>

        <label className="field library-search">
          Search by title
          <input
            className="input"
            placeholder="Search mezmur title..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

        <section className="card-list">
          {filteredMezmurs.length === 0 ? (
            <p>No approved mezmurs matched your filters.</p>
          ) : (
            filteredMezmurs.map((mezmur) => (
              <Link key={mezmur.id} href={`/mezmur/${mezmur.id}`} className="card">
                <h2 className="card__title">{mezmur.title}</h2>
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
