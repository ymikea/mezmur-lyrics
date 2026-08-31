'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SeasonSidebar from '@/components/SeasonSidebar';
import { LiturgicalSeason, Mezmur } from '@/types/database';

interface PublicLibraryBrowserProps {
  mezmurs: Mezmur[];
  defaultSeason: LiturgicalSeason;
}

export default function PublicLibraryBrowser({ mezmurs, defaultSeason }: PublicLibraryBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<LiturgicalSeason | 'all'>(defaultSeason);

  const filteredMezmurs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return mezmurs.filter((mezmur) => {
      const matchesSeason =
        selectedSeason === 'all' || mezmur.liturgical_season === selectedSeason;
      const matchesTitle =
        normalizedQuery.length === 0 || mezmur.title.toLowerCase().includes(normalizedQuery);

      return matchesSeason && matchesTitle;
    });
  }, [mezmurs, searchQuery, selectedSeason]);

  return (
    <div className="library-layout">
      <SeasonSidebar activeSeason={selectedSeason} onSeasonChange={setSelectedSeason} />
      <div style={{ width: '100%' }}>
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
