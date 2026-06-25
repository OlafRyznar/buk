// Real FIFA World Cup 2026 group-stage draw and matchday 1 standings, as
// provided by the user (fifa.com/FotMob-style table). Hardcoded rather than
// scraped — there is no reliable source for this in our odds scrapers, and
// guessing group assignments would just be another flavor of the "fake
// arbitrage" problem: confidently wrong data.

export interface WorldCupStanding {
  /** Display name, matching the Polish spelling used elsewhere in the app. */
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface WorldCupGroup {
  letter: string;
  standings: WorldCupStanding[];
}

// Alternate spellings (English official names, alternate Polish spellings)
// that scrapers/bookmakers might use for the same team, keyed by the
// canonical Polish display name used in `standings`.
const TEAM_ALIASES: Record<string, string[]> = {
  Meksyk: ['Mexico'],
  'Korea Południowa': ['Korea Republic', 'South Korea', 'Korea Płd.', 'Korea Płd'],
  Czechy: ['Czechia', 'Czech Republic'],
  RPA: ['South Africa'],
  Szwajcaria: ['Switzerland'],
  Kanada: ['Canada'],
  Katar: ['Qatar'],
  'Bośnia i Hercegowina': ['Bosnia and Herzegovina', 'Bosnia i Hercegowina'],
  Szkocja: ['Scotland'],
  Maroko: ['Morocco'],
  Brazylia: ['Brazil'],
  Haiti: [],
  'Stany Zjednoczone': ['USA', 'United States'],
  Australia: [],
  Turcja: ['Türkiye', 'Turkiye', 'Turkey'],
  Paragwaj: ['Paraguay'],
  Niemcy: ['Germany'],
  'Wybrzeże Kości Słoniowej': ["Côte d'Ivoire", "Cote d'Ivoire", 'Ivory Coast'],
  Ekwador: ['Ecuador'],
  Curaçao: ['Curacao'],
  Szwecja: ['Sweden'],
  Japonia: ['Japan'],
  Holandia: ['Netherlands'],
  Tunezja: ['Tunisia'],
  'Nowa Zelandia': ['New Zealand'],
  Iran: ['IR Iran'],
  Belgia: ['Belgium'],
  Egipt: ['Egypt'],
  Urugwaj: ['Uruguay'],
  'Arabia Saudyjska': ['Saudi Arabia'],
  Hiszpania: ['Spain'],
  'Republika Zielonego Przylądka': ['Cabo Verde', 'Wyspy Zielonego Przylądka'],
  Norwegia: ['Norway'],
  Francja: ['France'],
  Senegal: [],
  Irak: ['Iraq'],
  Argentyna: ['Argentina'],
  Austria: [],
  Jordania: ['Jordan'],
  Algieria: ['Algeria'],
  'DR Kongo': ['Congo DR', 'Democratic Republic of the Congo', 'DR Konga'],
  Portugalia: ['Portugal'],
  Kolumbia: ['Colombia'],
  Uzbekistan: [],
  Anglia: ['England'],
  Panama: [],
  Ghana: [],
  Chorwacja: ['Croatia'],
};

function standing(
  team: string,
  played: number,
  won: number,
  drawn: number,
  lost: number,
  goalsFor: number,
  goalsAgainst: number,
  points: number
): WorldCupStanding {
  return { team, played, won, drawn, lost, goalsFor, goalsAgainst, goalDiff: goalsFor - goalsAgainst, points };
}

export const WORLD_CUP_GROUPS: WorldCupGroup[] = [
  {
    letter: 'A',
    standings: [
      standing('Meksyk', 2, 2, 0, 0, 3, 0, 6),
      standing('Korea Południowa', 2, 1, 0, 1, 2, 2, 3),
      standing('Czechy', 2, 0, 1, 1, 2, 3, 1),
      standing('RPA', 2, 0, 1, 1, 1, 3, 1),
    ],
  },
  {
    letter: 'B',
    standings: [
      standing('Kanada', 2, 1, 1, 0, 7, 1, 4),
      standing('Szwajcaria', 2, 1, 1, 0, 5, 2, 4),
      standing('Bośnia i Hercegowina', 2, 0, 1, 1, 2, 5, 1),
      standing('Katar', 2, 0, 1, 1, 1, 7, 1),
    ],
  },
  {
    letter: 'C',
    standings: [
      standing('Brazylia', 2, 1, 1, 0, 4, 1, 4),
      standing('Maroko', 2, 1, 1, 0, 2, 1, 4),
      standing('Szkocja', 2, 1, 0, 1, 1, 1, 3),
      standing('Haiti', 2, 0, 0, 2, 0, 4, 0),
    ],
  },
  {
    letter: 'D',
    standings: [
      standing('Stany Zjednoczone', 2, 2, 0, 0, 6, 1, 6),
      standing('Australia', 2, 1, 0, 1, 2, 2, 3),
      standing('Paragwaj', 2, 1, 0, 1, 2, 4, 3),
      standing('Turcja', 2, 0, 0, 2, 0, 3, 0),
    ],
  },
  {
    letter: 'E',
    standings: [
      standing('Niemcy', 2, 2, 0, 0, 9, 2, 6),
      standing('Wybrzeże Kości Słoniowej', 2, 1, 0, 1, 2, 2, 3),
      standing('Ekwador', 2, 0, 1, 1, 0, 1, 1),
      standing('Curaçao', 2, 0, 1, 1, 1, 7, 1),
    ],
  },
  {
    letter: 'F',
    standings: [
      standing('Holandia', 2, 1, 1, 0, 7, 3, 4),
      standing('Japonia', 2, 1, 1, 0, 6, 2, 4),
      standing('Szwecja', 2, 1, 0, 1, 6, 6, 3),
      standing('Tunezja', 2, 0, 0, 2, 1, 9, 0),
    ],
  },
  {
    letter: 'G',
    standings: [
      standing('Egipt', 2, 1, 1, 0, 4, 2, 4),
      standing('Iran', 2, 0, 2, 0, 2, 2, 2),
      standing('Belgia', 2, 0, 2, 0, 1, 1, 2),
      standing('Nowa Zelandia', 2, 0, 1, 1, 3, 5, 1),
    ],
  },
  {
    letter: 'H',
    standings: [
      standing('Hiszpania', 2, 1, 1, 0, 4, 0, 4),
      standing('Urugwaj', 2, 0, 2, 0, 3, 3, 2),
      standing('Republika Zielonego Przylądka', 2, 0, 2, 0, 2, 2, 2),
      standing('Arabia Saudyjska', 2, 0, 1, 1, 1, 5, 1),
    ],
  },
  {
    letter: 'I',
    standings: [
      standing('Norwegia', 1, 1, 0, 0, 4, 1, 3),
      standing('Francja', 1, 1, 0, 0, 3, 1, 3),
      standing('Senegal', 1, 0, 0, 1, 1, 3, 0),
      standing('Irak', 1, 0, 0, 1, 1, 4, 0),
    ],
  },
  {
    letter: 'J',
    standings: [
      standing('Argentyna', 1, 1, 0, 0, 3, 0, 3),
      standing('Austria', 1, 1, 0, 0, 3, 1, 3),
      standing('Jordania', 1, 0, 0, 1, 1, 3, 0),
      standing('Algieria', 1, 0, 0, 1, 0, 3, 0),
    ],
  },
  {
    letter: 'K',
    standings: [
      standing('Kolumbia', 1, 1, 0, 0, 3, 1, 3),
      standing('DR Kongo', 1, 0, 1, 0, 1, 1, 1),
      standing('Portugalia', 1, 0, 1, 0, 1, 1, 1),
      standing('Uzbekistan', 1, 0, 0, 1, 1, 3, 0),
    ],
  },
  {
    letter: 'L',
    standings: [
      standing('Anglia', 1, 1, 0, 0, 4, 2, 3),
      standing('Ghana', 1, 1, 0, 0, 1, 0, 3),
      standing('Panama', 1, 0, 0, 1, 0, 1, 0),
      standing('Chorwacja', 1, 0, 0, 1, 2, 4, 0),
    ],
  },
];

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const TEAM_TO_GROUP = new Map<string, string>();
for (const group of WORLD_CUP_GROUPS) {
  for (const s of group.standings) {
    TEAM_TO_GROUP.set(normalize(s.team), group.letter);
    for (const alias of TEAM_ALIASES[s.team] ?? []) {
      TEAM_TO_GROUP.set(normalize(alias), group.letter);
    }
  }
}

/** Returns the group letter ('A'..'L') for a team name in any known
 * spelling/language, or null if the team isn't part of the 2026 draw. */
export function findGroupLetterForTeam(teamName: string): string | null {
  return TEAM_TO_GROUP.get(normalize(teamName)) ?? null;
}

export function groupLetterForMatch(homeTeam: string, awayTeam: string): string | null {
  const home = findGroupLetterForTeam(homeTeam);
  const away = findGroupLetterForTeam(awayTeam);
  return home && home === away ? home : null;
}
