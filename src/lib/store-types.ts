// Store types for BukScan app state (demo mode, journal, settings, etc.)

export const ALL_BOOKMAKERS = [
  { key: 'pinnacle', name: 'Pinnacle', url: 'https://www.pinnacle.com' },
  { key: 'bet365', name: 'Bet365', url: 'https://www.bet365.com' },
  { key: 'unibet', name: 'Unibet', url: 'https://unibet.pl' },
  { key: 'betway', name: 'Betway', url: 'https://betway.com' },
  { key: 'williamhill', name: 'William Hill', url: 'https://williamhill.com' },
  { key: 'superbet', name: 'Superbet', url: 'https://superbet.pl' },
  { key: 'sts', name: 'STS', url: 'https://sts.pl' },
  { key: 'fortuna', name: 'Fortuna', url: 'https://fortuna.pl' },
  { key: 'betclic', name: 'Betclic', url: 'https://betclic.pl' },
  { key: 'marathonbet', name: 'Marathon Bet', url: 'https://marathonbet.com' },
  { key: 'lvbet', name: 'LvBet', url: 'https://lvbet.pl' },
  { key: 'betfan', name: 'Betfan', url: 'https://betfan.pl' },
  { key: 'bwin', name: 'bwin', url: 'https://bwin.com' },
  { key: 'betsson', name: 'Betsson', url: 'https://betsson.com' },
  { key: '1xbet', name: '1xBet', url: 'https://1xbet.com' },
  { key: 'draftkings', name: 'DraftKings', url: 'https://sportsbook.draftkings.com' },
  { key: 'fanduel', name: 'FanDuel', url: 'https://sportsbook.fanduel.com' },
  { key: 'betmgm', name: 'BetMGM', url: 'https://sports.betmgm.com' },
  { key: 'forbet', name: 'forBET', url: 'https://iforbet.pl' },
  { key: 'etoto', name: 'ETOTO', url: 'https://etoto.pl' },
  { key: 'totalbet', name: 'TOTALbet', url: 'https://totalbet.pl' },
  { key: 'fuksiarz', name: 'Fuksiarz', url: 'https://fuksiarz.pl' },
  { key: 'pzbuk', name: 'PZBuk', url: 'https://pzbuk.pl' },
] as const;

export type BookmakerKey = typeof ALL_BOOKMAKERS[number]['key'];

// Bookmakers that offer a tax-free game mode (no 12% tax on winnings).
// Confirmed: Betclic. STS and others charge the standard tax — extend this
// list as more tax-free modes are confirmed.
export const TAX_FREE_BOOKMAKER_KEYS: string[] = ['betclic'];

export interface UserSettings {
  selectedBookmakers: string[]; // which bookmakers user has accounts at
  notificationsEnabled: boolean;
  minProfitForAlert: number; // minimum % profit to trigger surebet alert
  preSurebetThreshold: number; // margin% above 100, e.g. 2 means up to 102%
  roundingEnabled: boolean;
  roundingStep: number; // round to nearest X PLN (e.g. 10)
  excludeNicheMarkets: boolean;
  mainMarketsOnly: boolean;
  taxRate: number; // tax % on net winnings (Polish default: 12)
  isPremium: boolean;
  virtualBalance: number;
  darkMode: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  selectedBookmakers: ['sts', 'fortuna', 'superbet', 'betclic', 'lvbet', 'betfan', 'forbet', 'totalbet', 'etoto'],
  notificationsEnabled: true,
  minProfitForAlert: 0.5,
  preSurebetThreshold: 2,
  roundingEnabled: false,
  roundingStep: 10,
  excludeNicheMarkets: false,
  mainMarketsOnly: false,
  taxRate: 12,
  isPremium: false,
  virtualBalance: 10000,
  darkMode: true,
};

export interface BookmakerBalance {
  bookmakerKey: string;
  bookmakerName: string;
  balance: number;
  lastUpdated: string;
}

export const DEFAULT_BALANCES: BookmakerBalance[] = ALL_BOOKMAKERS.filter(bm => 
  ['sts', 'fortuna', 'superbet', 'betclic', 'lvbet', 'betfan', 'forbet', 'totalbet', 'etoto'].includes(bm.key)
).map(bm => ({
  bookmakerKey: bm.key,
  bookmakerName: bm.name,
  balance: 500,
  lastUpdated: new Date().toISOString(),
}));

export type JournalEntryStatus = 'pending' | 'won' | 'lost' | 'cancelled';

export interface JournalBet {
  bookmaker: string;
  bookmakerKey: string;
  outcome: string;
  odds: number;
  stake: number;
  potentialReturn: number;
  result: 'win' | 'loss' | 'pending';
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  eventName: string;
  sportTitle: string;
  commenceTime: string;
  marketKey: string;
  bets: JournalBet[];
  totalStake: number;
  guaranteedReturn: number;
  profit: number;
  profitPercent: number;
  status: JournalEntryStatus;
  notes: string;
  arbitrageId?: string;
  isDemo?: boolean;
}

export const DEMO_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'j-001',
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    eventName: 'Real Madrid vs Barcelona',
    sportTitle: 'La Liga',
    commenceTime: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    marketKey: 'h2h',
    bets: [
      { bookmaker: 'Pinnacle', bookmakerKey: 'pinnacle', outcome: 'Real Madrid', odds: 2.45, stake: 367.65, potentialReturn: 901.24, result: 'win' },
      { bookmaker: 'Bet365', bookmakerKey: 'bet365', outcome: 'Draw', odds: 3.55, stake: 253.51, potentialReturn: 900.0, result: 'loss' },
      { bookmaker: 'Unibet', bookmakerKey: 'unibet', outcome: 'Barcelona', odds: 2.90, stake: 310.34, potentialReturn: 900.0, result: 'loss' },
    ],
    totalStake: 931.5,
    guaranteedReturn: 900.0,
    profit: -31.5,
    profitPercent: -3.38,
    status: 'lost',
    notes: 'Surebet rozliczony. Real Madrid wygrał, ale arbitraż był źle obliczony.',
    isDemo: true,
  },
  {
    id: 'j-002',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    eventName: 'Arsenal vs Chelsea',
    sportTitle: 'EPL',
    commenceTime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    marketKey: 'h2h',
    bets: [
      { bookmaker: 'Unibet', bookmakerKey: 'unibet', outcome: 'Arsenal', odds: 2.25, stake: 444.44, potentialReturn: 1000.0, result: 'loss' },
      { bookmaker: 'Betway', bookmakerKey: 'betway', outcome: 'Draw', odds: 3.75, stake: 266.67, potentialReturn: 1000.0, result: 'win' },
      { bookmaker: 'Bet365', bookmakerKey: 'bet365', outcome: 'Chelsea', odds: 3.60, stake: 277.78, potentialReturn: 1000.0, result: 'loss' },
    ],
    totalStake: 988.89,
    guaranteedReturn: 1000.0,
    profit: 11.11,
    profitPercent: 1.12,
    status: 'won',
    notes: 'Klasyczny surebet 3-drogowy. Remis przyniósł wygraną.',
    isDemo: true,
  },
  {
    id: 'j-003',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    eventName: 'Bayern Monachium vs Borussia Dortmund',
    sportTitle: 'Bundesliga',
    commenceTime: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    marketKey: 'h2h',
    bets: [
      { bookmaker: 'Pinnacle', bookmakerKey: 'pinnacle', outcome: 'Bayern Monachium', odds: 1.72, stake: 581.40, potentialReturn: 1000.0, result: 'pending' },
      { bookmaker: 'William Hill', bookmakerKey: 'williamhill', outcome: 'Borussia Dortmund', odds: 5.80, stake: 172.41, potentialReturn: 1000.0, result: 'pending' },
      { bookmaker: 'Bet365', bookmakerKey: 'bet365', outcome: 'Draw', odds: 4.20, stake: 238.10, potentialReturn: 1000.0, result: 'pending' },
    ],
    totalStake: 991.91,
    guaranteedReturn: 1000.0,
    profit: 8.09,
    profitPercent: 0.82,
    status: 'pending',
    notes: '',
    isDemo: true,
  },
];

export type NotificationCategory = 'surebet' | 'pre-surebet' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationCategory;
  title: string;
  message: string;
  profit?: number;
  timestamp: string;
  read: boolean;
  expired?: boolean;
  surebetId?: string;
  eventName?: string;
}

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-001',
    type: 'surebet',
    title: '🎯 Nowy surebet! Arsenal vs Chelsea',
    message: 'Surebet 3-drogowy z gwarantowanym zyskiem +1.12%. Stawka 1000 zł → zwrot 1011 zł.',
    profit: 1.12,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    expired: false,
    surebetId: 'demo-001-h2h',
    eventName: 'Arsenal vs Chelsea',
  },
  {
    id: 'n-002',
    type: 'surebet',
    title: '🔥 Gorący surebet! Real Madrid vs Barcelona',
    message: 'Surebet z zyskiem +2.34%! Bardzo krótkie okno – działaj szybko.',
    profit: 2.34,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    expired: false,
    surebetId: 'demo-002-h2h',
    eventName: 'Real Madrid vs Barcelona',
  },
  {
    id: 'n-003',
    type: 'pre-surebet',
    title: '📊 Obserwuj: Bayern vs Dortmund zbliża się do progu!',
    message: 'Marża wynosi 101.2% – wystarczy wzrost kursu o 1.4%, by powstał surebet.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: false,
    expired: false,
    eventName: 'Bayern vs Dortmund',
  },
  {
    id: 'n-004',
    type: 'surebet',
    title: '⏰ Surebet wygasł: Liverpool vs Man City',
    message: 'Okazja arbitrażowa nie jest już dostępna. Kurs u Pinnacle się zmienił.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    read: true,
    expired: true,
    eventName: 'Liverpool vs Man City',
  },
  {
    id: 'n-005',
    type: 'pre-surebet',
    title: '🔔 Pre-surebet: Sporting vs Benfica (102%)',
    message: 'Wydarzenie graniczne – marża 102%. Kurs musi wzrosnąć o 2.4% do wejścia w surebet.',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    read: true,
    expired: false,
    eventName: 'Sporting vs Benfica',
  },
  {
    id: 'n-006',
    type: 'system',
    title: '✅ Vitoria! Arsenal vs Chelsea zakończony',
    message: 'Twój surebet z 2 dni temu zakończył się wygraną. Sprawdź dziennik.',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    read: true,
    expired: false,
  },
];
