export type Language = 'Tigrinya' | 'Geez' | 'Amharic' | 'English';

export const LANGUAGES: Language[] = ['Tigrinya', 'Geez', 'Amharic','English'];

export type LiturgicalSeason =
  | 'Fast of the Prophets'
  | 'Nativity'
  | 'Epiphany'
  | 'Great Lent'
  | 'Holy Week'
  | 'Resurrection'
  | 'Pentecost'
  | 'Assumption'
  | 'General';

export const LITURGICAL_SEASONS: LiturgicalSeason[] = [
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

export type ReviewStatus = 'pending_review' | 'approved' | 'rejected';
export type AppRole = 'admin' | 'moderator';

export interface Stanza {
  stanza_order: number;
  text: string;
  is_chorus: boolean;
}

export interface Mezmur {
  id: string;
  title: string;
  language: Language;
  liturgical_season: LiturgicalSeason;
  lyrics: Stanza[];
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}
