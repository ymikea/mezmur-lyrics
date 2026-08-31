'use client';

import { LITURGICAL_SEASONS, LiturgicalSeason } from '@/types/database';

interface SeasonSidebarProps {
  activeSeason: LiturgicalSeason | 'all';
  onSeasonChange: (season: LiturgicalSeason | 'all') => void;
}

export default function SeasonSidebar({ activeSeason, onSeasonChange }: SeasonSidebarProps) {
  return (
    <aside className="sidebar">
      <p className="sidebar__heading">Liturgical Seasons</p>
      <label className="field">
        <span className="visually-hidden">Select liturgical season</span>
        <select
          className="input"
          value={activeSeason}
          onChange={(event) => onSeasonChange(event.target.value as LiturgicalSeason | 'all')}
        >
          <option value="all">All Seasons</option>
          {LITURGICAL_SEASONS.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}
