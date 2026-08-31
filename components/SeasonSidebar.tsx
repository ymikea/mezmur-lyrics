'use client';

import { LITURGICAL_SEASONS, LiturgicalSeason, getGeezName } from '@/types/database';

interface SeasonSidebarProps {
  activeSeason: LiturgicalSeason | 'all';
  onSeasonChange: (season: LiturgicalSeason | 'all') => void;
  showEnglishLabels: boolean;
}

export default function SeasonSidebar({
  activeSeason,
  onSeasonChange,
  showEnglishLabels,
}: SeasonSidebarProps) {
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
          <option value="all">{showEnglishLabels ? 'All Seasons' : 'ኩሉ ወቅታት'}</option>
          {LITURGICAL_SEASONS.map((season) => (
            <option key={season} value={season}>
              {showEnglishLabels ? season : getGeezName(season)}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}
