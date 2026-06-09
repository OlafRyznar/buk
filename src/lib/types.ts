// Types for The Odds API and our application

export interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

export interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

export interface OddsApiMarket {
  key: string;
  last_update: string;
  outcomes: OddsApiOutcome[];
}

export interface OddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}

// Application types

export interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface BookmakerOdds {
  bookmaker: string;
  bookmakerKey: string;
  outcome: string;
  odds: number;
  lastUpdate: string;
}

export interface EventWithOdds {
  id: string;
  sportKey: string;
  sportTitle: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  markets: MarketComparison[];
}

export interface MarketComparison {
  marketKey: string;
  outcomes: OutcomeComparison[];
}

export interface OutcomeComparison {
  name: string;
  bookmakers: BookmakerOdds[];
  bestOdds: BookmakerOdds;
  worstOdds: BookmakerOdds;
}

export interface ArbitrageOpportunity {
  id: string;
  event: EventWithOdds;
  marketKey: string;
  profit: number; // percentage profit (e.g., 2.5 = 2.5%)
  totalImpliedProbability: number;
  bets: ArbitrageBet[];
  stake: number;
  guaranteedReturn: number;
}

export interface ArbitrageBet {
  outcome: string;
  bookmaker: string;
  bookmakerKey: string;
  odds: number;
  stake: number;
  potentialReturn: number;
}

export interface NearArbitrageOpportunity {
  id: string;
  event: EventWithOdds;
  marketKey: string;
  totalImpliedProbability: number;
  distanceFromArbitrage: number;
  requiredOddsChangePercent: number;
  targetOutcome: string;
  currentOdds: number;
  targetOdds: number;
  bookmaker: string;
  bookmakerKey: string;
  outcomes: NearArbitrageOutcome[];
}

export interface NearArbitrageOutcome {
  outcome: string;
  bookmaker: string;
  bookmakerKey: string;
  odds: number;
}

export interface DashboardStats {
  totalEvents: number;
  totalBookmakers: number;
  totalArbitrages: number;
  totalNearArbitrages: number;
  bestProfit: number;
  averageProfit: number;
  closestToArbitrage: number;
  sportsWithArbitrages: string[];
}

export const SUPPORTED_SPORTS = [
  { key: 'soccer_epl', title: 'EPL - Premier League' },
  { key: 'soccer_spain_la_liga', title: 'La Liga - Spain' },
  { key: 'soccer_germany_bundesliga', title: 'Bundesliga - Germany' },
  { key: 'soccer_italy_serie_a', title: 'Serie A - Italy' },
  { key: 'soccer_france_ligue_one', title: 'Ligue 1 - France' },
  { key: 'soccer_uefa_champs_league', title: 'UEFA Champions League' },
  { key: 'soccer_poland_ekstraklasa', title: 'Ekstraklasa - Poland' },
  { key: 'basketball_nba', title: 'NBA' },
  { key: 'basketball_euroleague', title: 'Euroleague' },
  { key: 'tennis_atp_french_open', title: 'ATP French Open' },
  { key: 'icehockey_nhl', title: 'NHL' },
  { key: 'mma_mixed_martial_arts', title: 'MMA' },
  { key: 'baseball_mlb', title: 'MLB' },
] as const;

export const BOOKMAKER_LOGOS: Record<string, string> = {
  'betfair': '🔵',
  'betway': '🟢',
  'pinnacle': '🔴',
  'unibet': '🟡',
  'williamhill': '🟤',
  'bet365': '🟢',
  'draftkings': '⚫',
  'fanduel': '🔵',
  'bovada': '🔴',
  'betmgm': '🟡',
  'superbet': '🔴',
  'marathonbet': '🔵',
  'betsson': '🟢',
  'bwin': '🟡',
  'betclic': '🔴',
  '1xbet': '🔵',
  'sts': '🟢',
  'fortuna': '🔴',
  'lvbet': '🟡',
  'betfan': '🟤',
};
