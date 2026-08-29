import Link from 'next/link';
import { LITURGICAL_SEASONS, LiturgicalSeason } from '@/types/database';

interface SeasonSidebarProps {
  activeSeason?: LiturgicalSeason;
}

export default function SeasonSidebar({ activeSeason }: SeasonSidebarProps) {
  return (
    <aside className="sidebar">
      <p className="sidebar__heading">Liturgical Seasons</p>
      <nav className="sidebar__links">
        <Link href="/" className={`sidebar__link${!activeSeason ? ' sidebar__link--active' : ''}`}>
          All Seasons
        </Link>
        {LITURGICAL_SEASONS.map((season) => (
          <Link
            key={season}
            href={`/?season=${encodeURIComponent(season)}`}
            className={`sidebar__link${activeSeason === season ? ' sidebar__link--active' : ''}`}
          >
            {season}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
