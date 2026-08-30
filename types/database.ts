export type Language = 'Tigrinya' | 'Geez' | 'Amharic' | 'English';

export const LANGUAGES: Language[] = ['Tigrinya', 'Geez', 'Amharic','English'];

export type LiturgicalSeason =
  | 'General'
  | 'Nativity'
  | 'Epiphany'
  | 'Great Lent'
  | 'Resurrection'
  | 'Ascension'
  | 'Pentecost'
  | 'St. Virgin Mary General'
  | 'Tsgie'
  | 'Holy Cross'
  | 'Holy Angels'
  | 'Holy Church'
  | 'Holy Fathers';

export const LITURGICAL_SEASONS: LiturgicalSeason[] = [
  'General',
  'Nativity',
  'Epiphany',
  'Great Lent',
  'Resurrection',
  'Ascension',
  'Pentecost',
  'St. Virgin Mary General',
  'Tsgie',
  'Holy Cross',
  'Holy Angels',
  'Holy Church',
  'Holy Fathers',
];

export const SEASON_GEEZ_NAMES: Record<LiturgicalSeason, string> = {
  'General': 'ዘዘወትር',
  'Nativity': 'ልደት',
  'Epiphany': 'ጥምቀት',
  'Great Lent': 'ዐብይ ጾም',
  'Resurrection': 'ትንሳኤ',
  'Ascension': 'ዕርገት',
  'Pentecost': 'ጰራቅሊጦስ',
  'St. Virgin Mary General': 'ቅ/ድንግል ማርያም ዘዘወትር',
  'Tsgie': 'ጽጌ',
  'Holy Cross': 'መስቀል',
  'Holy Angels': 'ቅዱሳን መላእክት',
  'Holy Church': 'ቤተ ክርስቲያን',
  'Holy Fathers': 'ቅዱሳን አበው',
};

export function getGeezName(season: LiturgicalSeason): string {
  return SEASON_GEEZ_NAMES[season] ?? season;
}

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
