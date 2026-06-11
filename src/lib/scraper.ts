import { chromium, Browser, Page } from 'playwright';
import { OddsApiEvent } from './types';

type SportKind = 'soccer' | 'basketball';

interface RawOdds {
  home: number;
  draw: number; // 0 => two-way market (basketball)
  away: number;
}

interface ScrapedEventRaw {
  home: string;
  away: string;
  commenceTimeStr: string;
  odds: RawOdds;
}

interface BookmakerResult {
  key: string;
  title: string;
  sport: SportKind;
  events: ScrapedEventRaw[];
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Selectors that commonly mark a single match row across betting sites
const COMMON_ROW_SELECTORS = [
  '[class*="event-row"]',
  '[class*="eventRow"]',
  '[class*="match-row"]',
  '[class*="event-card"]',
  '[class*="eventCard"]',
  'li[class*="event"]',
  '[class*="prematch"] [class*="event"]',
];

interface GenericSiteConfig {
  key: string;
  title: string;
  url: string;
  selectors: string[];
}

const GENERIC_SITES: GenericSiteConfig[] = [
  {
    key: 'fuksiarz',
    title: 'Fuksiarz',
    url: 'https://fuksiarz.pl/zaklady-bukmacherskie/pilka-nozna',
    selectors: ['.period-item', '[class*="period-item"]', ...COMMON_ROW_SELECTORS],
  },
  {
    key: 'betclic',
    title: 'Betclic',
    url: 'https://www.betclic.pl/pilka-nozna-s1',
    selectors: [
      'sports-events-event',
      '[class*="cardEvent"]',
      'a[class*="cardEvent"]',
      '[class*="card-event"]',
      'a[href*="/pilka-nozna"]',
      ...COMMON_ROW_SELECTORS,
    ],
  },
  {
    key: 'forbet',
    title: 'forBET',
    url: 'https://www.iforbet.pl/zaklady-bukmacherskie/1',
    selectors: ['div.h-44', ...COMMON_ROW_SELECTORS],
  },
  {
    key: 'lvbet',
    title: 'LVBET',
    url: 'https://lvbet.pl/pl/zaklady-bukmacherskie/',
    selectors: [
      '[class*="match-tile"]',
      '[class*="sports-event"]',
      ...COMMON_ROW_SELECTORS,
    ],
  },
  {
    key: 'betfan',
    title: 'Betfan',
    url: 'https://betfan.pl/zaklady-bukmacherskie/pilka-nozna',
    selectors: [
      '[class*="event-list-item"]',
      '[class*="eventListItem"]',
      ...COMMON_ROW_SELECTORS,
    ],
  },
];

// Whole-name aliases (applied after basic normalization) so the same team
// written differently by two bookmakers still matches.
const NAME_ALIASES: Record<string, string> = {
  usa: 'stany zjednoczone',
  zea: 'zjednoczone emiraty arabskie',
  wks: 'wybrzeze kosci sloniowej',
  bosnia: 'bosnia i hercegowina',
  'republika poludniowej afryki': 'rpa',
};

// Token-level abbreviations (Korea Płd. -> Korea Południowa etc.)
const TOKEN_ALIASES: Record<string, string> = {
  pld: 'poludniowa',
  pln: 'polnocna',
  srod: 'srodkowa',
};

function normalizeName(name: string): string {
  let norm = name
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, ' ') // only alphanumeric
    .replace(/\b(fc|cf|ac|fk|ks|gks|ap|lks|real|fcb|club|de|la|du|the|and|vs|mecz)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  norm = norm
    .split(' ')
    .map((token) => TOKEN_ALIASES[token] || token)
    .join(' ');

  return NAME_ALIASES[norm] || norm;
}

// National teams (normalized Polish names) used to tag World Cup matches.
const NATIONAL_TEAMS = new Set(
  [
    'meksyk', 'kanada', 'stany zjednoczone', 'argentyna', 'brazylia', 'urugwaj',
    'kolumbia', 'ekwador', 'paragwaj', 'chile', 'peru', 'boliwia', 'wenezuela',
    'anglia', 'szkocja', 'walia', 'irlandia', 'irlandia polnocna', 'francja',
    'niemcy', 'hiszpania', 'portugalia', 'wlochy', 'holandia', 'belgia',
    'chorwacja', 'serbia', 'bosnia i hercegowina', 'szwajcaria', 'austria',
    'polska', 'czechy', 'slowacja', 'slowenia', 'wegry', 'rumunia', 'bulgaria',
    'grecja', 'turcja', 'ukraina', 'dania', 'szwecja', 'norwegia', 'finlandia',
    'islandia', 'albania', 'macedonia polnocna', 'czarnogora', 'kosowo',
    'gruzja', 'armenia', 'azerbejdzan', 'kazachstan', 'japonia',
    'korea poludniowa', 'korea polnocna', 'chiny', 'australia', 'nowa zelandia',
    'iran', 'irak', 'arabia saudyjska', 'katar', 'zjednoczone emiraty arabskie',
    'jordania', 'uzbekistan', 'indonezja', 'tajlandia', 'wietnam', 'indie',
    'maroko', 'algieria', 'tunezja', 'egipt', 'libia', 'senegal', 'nigeria',
    'ghana', 'kamerun', 'mali', 'burkina faso', 'rpa',
    'demokratyczna republika konga', 'dr konga', 'kongo', 'zambia', 'zimbabwe',
    'angola', 'mozambik', 'gabon', 'gwinea', 'tanzania', 'uganda', 'kenia',
    'etiopia', 'wyspy zielonego przyladka', 'republika zielonego przyladka',
    'kostaryka', 'panama', 'honduras', 'gwatemala', 'salwador', 'jamajka',
    'haiti', 'trynidad i tobago', 'kuba', 'curacao', 'surinam',
  ].map((n) => normalizeName(n))
);

function isNationalTeam(name: string): boolean {
  return NATIONAL_TEAMS.has(normalizeName(name));
}

function matchTeams(teamA: string, teamB: string): boolean {
  const normA = normalizeName(teamA);
  const normB = normalizeName(teamB);
  if (!normA || !normB) return false;

  if (normA === normB) return true;

  const tokensA = normA.split(/\s+/).filter((t) => t.length > 2);
  const tokensB = normB.split(/\s+/).filter((t) => t.length > 2);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return normA.includes(normB) || normB.includes(normA);
  }

  let matches = 0;
  for (const tA of tokensA) {
    if (tokensB.some((tB) => tB.includes(tA) || tA.includes(tB))) {
      matches++;
    }
  }

  const ratio = matches / Math.max(tokensA.length, tokensB.length);
  return ratio >= 0.65; // 65% token similarity
}

function parseCommenceTime(timeStr: string): string {
  const now = new Date();
  let targetDate = new Date();
  const clean = (timeStr || '').toLowerCase().trim();

  if (clean.includes('jutro')) {
    targetDate.setDate(now.getDate() + 1);
  } else if (clean.includes('dziś') || clean.includes('dzis') || clean.includes('dzisiaj')) {
    // keep today
  } else {
    const dateMatch = clean.match(/(\d{1,2})\.(\d{1,2})\.?(\d{4})?/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      const year = dateMatch[3] ? parseInt(dateMatch[3]) : now.getFullYear();
      targetDate = new Date(year, month, day);
    }
  }

  const timeMatch = clean.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    targetDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
  }

  return targetDate.toISOString();
}

/**
 * A single bookmaker's odds must imply a probability around 1.0+margin.
 * Anything far outside that range is a parsing error — and a fake arbitrage
 * waiting to happen — so we drop it. The market shape comes from the event
 * itself: draw = 0 means a two-way market (basketball winner incl. OT),
 * draw > 0 means full 1X2.
 */
// Promo rows that sneak into event lists ("Bet Builder", boosted odds etc.)
const GARBAGE_TEAM_NAME = /bet ?builder|boost|bonus|promocj|zak[łl]ad|kupon/i;

function isValidEvent(e: ScrapedEventRaw): boolean {
  if (!e.home || !e.away || e.home === e.away) return false;
  if (GARBAGE_TEAM_NAME.test(e.home) || GARBAGE_TEAM_NAME.test(e.away)) return false;
  const twoWay = e.odds.draw === 0;
  const odds = twoWay ? [e.odds.home, e.odds.away] : [e.odds.home, e.odds.draw, e.odds.away];
  for (const v of odds) {
    if (!v || !isFinite(v) || v < 1.01 || v > 66) return false;
  }
  const implied = odds.reduce((sum, v) => sum + 1 / v, 0);
  return twoWay
    ? implied >= 0.92 && implied <= 1.45
    : implied >= 0.95 && implied <= 1.6;
}

/**
 * Generic in-page extractor. Runs inside page.evaluate so it must be fully
 * self-contained. Tries each row selector until one yields enough rows, then
 * parses team names ("A - B" line or the two name-lines closest before the
 * odds) and the first three decimal odds (dot or comma separated).
 */
function extractGenericRows(args: { selectors: string[]; twoWay: boolean }): ScrapedEventRaw[] {
  const { selectors, twoWay } = args;
  const needOdds = twoWay ? 2 : 3;
  const isOddStr = (s: string) => /^\d{1,2}[.,]\d{2}$/.test(s.trim());
  const toOdd = (s: string) => parseFloat(s.replace(',', '.'));
  const isTime = (s: string) => /\b\d{1,2}:\d{2}\b/.test(s);
  const isDate = (s: string) =>
    /\b\d{1,2}[./]\d{1,2}\b/.test(s) || /dziś|dzis|jutro|today/i.test(s);
  const badName =
    /^(1|x|2|1x|x2|12|typ|kursy?|zak[łl]ady?|bonus|live|teraz|koniec|wynik( meczu)?|zwyci[ęe]zca.*|remis|vs|jackpot|dw[óo]jtyp|wi[ęe]cej|gole|punkty?|handicap|powy[żz]ej|poni[żz]ej|tak|nie|boost|promocj.*|betarchitekt|\+\d+|\d+)$/i;
  const looksName = (s: string) =>
    /[a-ząćęłńóśźżäöüéèáí]/i.test(s) &&
    !isOddStr(s) &&
    !isTime(s) &&
    s.length >= 2 &&
    s.length <= 45 &&
    !badName.test(s.trim());

  let rows: Element[] = [];
  for (const sel of selectors) {
    try {
      const found = Array.from(document.querySelectorAll(sel));
      if (found.length >= 3) {
        rows = found;
        break;
      }
    } catch {
      // invalid selector for this engine — try the next one
    }
  }

  const out: ScrapedEventRaw[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const text = (row as HTMLElement).innerText || '';
    if (text.length > 600) continue; // whole-list container, not a single row
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 3) continue;

    const oddIdx: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (!isOddStr(lines[i])) continue;
      // A date like "11.06" matches the odds pattern; dates sit directly
      // before the kickoff clock line, real odds don't.
      const m = lines[i].match(/^(\d{1,2})[.,](\d{1,2})$/);
      if (m && +m[2] <= 12 && +m[1] <= 31 && /^\d{1,2}:\d{2}/.test(lines[i + 1] || '')) {
        continue;
      }
      oddIdx.push(i);
    }
    if (oddIdx.length < needOdds) continue;

    let home = '';
    let away = '';
    let nameLineIdx = -1;

    // Strategy 1: a "Team A - Team B" line (Fuksiarz, Fortuna)
    const sepIdx = lines.findIndex(
      (l) => / - | – | vs /i.test(l) && !isOddStr(l) && !isTime(l)
    );
    if (sepIdx !== -1) {
      const parts = lines[sepIdx].split(/ - | – | vs /i).map((p) => p.trim());
      if (parts.length >= 2 && looksName(parts[0]) && looksName(parts[1])) {
        home = parts[0];
        away = parts[1];
        nameLineIdx = sepIdx;
      }
    }

    // Strategy 2: the two name-lines closest before the first odds (Betclic)
    if (!home || !away) {
      const names: string[] = [];
      for (let i = oddIdx[0] - 1; i >= 0 && names.length < 2; i--) {
        const l = lines[i];
        if (isTime(l) || isDate(l)) continue;
        if (looksName(l)) names.push(l);
        else if (names.length > 0) break;
      }
      if (names.length === 2) {
        away = names[0];
        home = names[1];
        // odds were scanned from after these names already
        nameLineIdx = -1;
      } else {
        const nameIdxList: number[] = [];
        for (let i = 0; i < lines.length && nameIdxList.length < 2; i++) {
          if (looksName(lines[i])) nameIdxList.push(i);
        }
        if (nameIdxList.length >= 2) {
          home = lines[nameIdxList[0]];
          away = lines[nameIdxList[1]];
          nameLineIdx = nameIdxList[1];
        }
      }
    }

    if (!home || !away || home === away) continue;

    // Only trust odds that appear AFTER the team names — a date line like
    // "10.06" earlier in the row matches the odds pattern and would shift
    // every price by one position otherwise.
    const usableOdds = nameLineIdx === -1 ? oddIdx : oddIdx.filter((i) => i > nameLineIdx);
    if (usableOdds.length < needOdds) continue;

    const h = toOdd(lines[usableOdds[0]]);
    const d = twoWay ? 0 : toOdd(lines[usableOdds[1]]);
    const a = toOdd(lines[usableOdds[twoWay ? 1 : 2]]);

    const timeLine = lines.find(isTime) || '';
    const dateLine = lines.find((l) => isDate(l) && l !== timeLine) || '';
    const commenceTimeStr = `${dateLine} ${timeLine}`.trim();

    const key = (home + '|' + away).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ home, away, commenceTimeStr, odds: { home: h, draw: d, away: a } });
  }

  return out;
}

/**
 * Extractor for sites whose match card contains a market section laid out as
 * "Wynik meczu / home / odds / Remis / odds / away / odds" (soccer) or
 * "Zwycięzca meczu / home / odds / away / odds" (basketball, two-way).
 * Used by Fortuna (.fixture-card) and Totalbet. Runs in page context.
 */
function extractWynikMeczu(args: {
  selectors: string[];
  twoWay: boolean;
}): ScrapedEventRaw[] {
  const { selectors, twoWay } = args;
  const headerRe = twoWay ? /^zwyci[ęe]zca( meczu)?/im : /^wynik meczu$/im;

  let cards: Element[] = [];
  for (const sel of selectors) {
    try {
      const found = Array.from(document.querySelectorAll(sel)).filter((el) =>
        headerRe.test((el as HTMLElement).innerText || '')
      );
      if (found.length >= 3) {
        cards = found;
        break;
      }
    } catch {
      // invalid selector — try the next one
    }
  }

  const parsed: ScrapedEventRaw[] = [];
  const seen = new Set<string>();

  for (const card of cards) {
    const text = (card as HTMLElement).innerText || '';
    if (text.length > 800) continue;
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const idx = lines.findIndex((l) => headerRe.test(l));
    const lastNeeded = twoWay ? idx + 4 : idx + 6;
    if (idx === -1 || lastNeeded > lines.length - 1) continue;

    const toOdd = (s: string) => parseFloat((s || '').replace(',', '.'));
    const home = lines[idx + 1];
    const h = toOdd(lines[idx + 2]);
    const isDraw = twoWay ? true : /^remis$/i.test(lines[idx + 3] || '');
    const d = twoWay ? 0 : toOdd(lines[idx + 4]);
    const away = lines[twoWay ? idx + 3 : idx + 5];
    const a = toOdd(lines[twoWay ? idx + 4 : idx + 6]);

    if (!home || !away || !isDraw) continue;
    if ([h, a].some((v) => isNaN(v)) || (!twoWay && isNaN(d))) continue;

    // Kickoff: first clock line before the "Wynik meczu" section ("jutro
    // 21:00", "13.06 18:30") — badges like "90:00" come later in the card.
    const headLines = lines.slice(0, idx);
    const timeLine = headLines.find((l) => /\d{1,2}:\d{2}/.test(l)) || '';
    const dateLine = headLines.find(
      (l) => l !== timeLine && (/\b\d{1,2}\.\d{1,2}\b/.test(l) || /dzi[sś]|jutro/i.test(l))
    ) || '';
    const commenceTimeStr = `${dateLine} ${timeLine}`.trim();

    const key = (home + '|' + away).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    parsed.push({ home, away, commenceTimeStr, odds: { home: h, draw: d, away: a } });
  }

  return parsed;
}

/**
 * Etoto-specific extractor (runs in page context). Rows are li.single-event
 * with lines: home / away / dd.mm / hh:mm / odds...
 */
function extractEtoto(twoWay: boolean): ScrapedEventRaw[] {
  const rows = Array.from(
    document.querySelectorAll('li.single-event, li[class*="eventListPeriodItem"]')
  );
  const parsed: ScrapedEventRaw[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const text = (row as HTMLElement).innerText || '';
    if (text.length > 600) continue;
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const timeIdx = lines.findIndex((l) => /^\d{1,2}:\d{2}$/.test(l));
    if (timeIdx < 2) continue;

    const isOddStr = (s: string) => /^\d{1,2}[.,]\d{2}$/.test(s);
    const looksName = (s: string) =>
      /[a-ząćęłńóśźż]/i.test(s) && !isOddStr(s) && s.length >= 2 && s.length <= 45;

    const nameLines = lines.slice(0, timeIdx).filter(looksName);
    if (nameLines.length < 2) continue;
    const home = nameLines[0];
    const away = nameLines[1];

    const odds = lines
      .slice(timeIdx + 1)
      .filter(isOddStr)
      .map((s) => parseFloat(s.replace(',', '.')));
    if (odds.length < (twoWay ? 2 : 3)) continue;

    const dateLine = lines.slice(0, timeIdx).find((l) => /^\d{1,2}\.\d{1,2}/.test(l)) || '';
    const commenceTimeStr = `${dateLine} ${lines[timeIdx]}`.trim();

    const key = (home + '|' + away).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    parsed.push({
      home,
      away,
      commenceTimeStr,
      odds: twoWay
        ? { home: odds[0], draw: 0, away: odds[1] }
        : { home: odds[0], draw: odds[1], away: odds[2] },
    });
  }

  return parsed;
}

/** Superbet-specific extractor (runs in page context). */
function extractSuperbet(twoWay: boolean): ScrapedEventRaw[] {
  const cards = Array.from(
    document.querySelectorAll('.event-card, [class*="event-row-container__event"]')
  );
  const parsed: ScrapedEventRaw[] = [];

  cards.forEach((card) => {
    const text = (card as HTMLElement).innerText || '';
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const teamElems = Array.from(
      card.querySelectorAll('.event-team-name, .event-card__team-name, .team-name')
    );
    let home = '';
    let away = '';
    let commenceTimeStr = '';

    if (teamElems.length >= 2) {
      home = (teamElems[0] as HTMLElement).innerText.trim();
      away = (teamElems[1] as HTMLElement).innerText.trim();
    }

    let dateIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/\d{2}:\d{2}/) || lines[i].includes('Jutro') || lines[i].includes('Dziś')) {
        dateIndex = i;
        commenceTimeStr = lines[i];
        break;
      }
    }

    if (!home && dateIndex !== -1 && dateIndex + 2 < lines.length) {
      home = lines[dateIndex + 1];
      away = lines[dateIndex + 2];
    }

    if (!home || !away) return;

    let homeOdds = 0;
    let drawOdds = 0;
    let awayOdds = 0;

    for (let i = 0; i < lines.length; i++) {
      if (
        (lines[i] === '1' || lines[i] === 'X' || lines[i] === '2') &&
        i + 1 < lines.length &&
        !isNaN(parseFloat(lines[i + 1]))
      ) {
        const val = parseFloat(lines[i + 1]);
        if (lines[i] === '1') homeOdds = val;
        if (lines[i] === 'X') drawOdds = val;
        if (lines[i] === '2') awayOdds = val;
        i++;
      }
    }

    if (homeOdds > 0 && awayOdds > 0 && (twoWay || drawOdds > 0)) {
      parsed.push({
        home,
        away,
        commenceTimeStr,
        odds: { home: homeOdds, draw: twoWay ? 0 : drawOdds, away: awayOdds },
      });
    }
  });

  return parsed;
}

/** STS-specific extractor (runs in page context). */
function extractSts(twoWay: boolean): ScrapedEventRaw[] {
  const cards = Array.from(document.querySelectorAll('.one-ticket-match-tile'));
  const parsed: ScrapedEventRaw[] = [];

  cards.forEach((card) => {
    const homeTeamEl = card.querySelector(
      '.one-ticket-match-tile-event-details-common__team-home .one-ticket-match-tile-event-details-common__team-name'
    );
    const awayTeamEl = card.querySelector(
      '.one-ticket-match-tile-event-details-common__team-away .one-ticket-match-tile-event-details-common__team-name'
    );

    const homeTeam = homeTeamEl ? (homeTeamEl as HTMLElement).innerText.trim() : '';
    const awayTeam = awayTeamEl ? (awayTeamEl as HTMLElement).innerText.trim() : '';

    const desktopHomeTeamEl = card.querySelector(
      '.one-ticket-match-tile-event-details-desktop__team-home'
    );
    const desktopAwayTeamEl = card.querySelector(
      '.one-ticket-match-tile-event-details-desktop__team-away'
    );

    const dHomeTeam = desktopHomeTeamEl
      ? (desktopHomeTeamEl as HTMLElement).innerText.trim()
      : '';
    const dAwayTeam = desktopAwayTeamEl
      ? (desktopAwayTeamEl as HTMLElement).innerText.trim()
      : '';

    const home = homeTeam || dHomeTeam || '';
    const away = awayTeam || dAwayTeam || '';

    if (!home || !away) return;

    const text = (card as HTMLElement).innerText || '';
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    let commenceTimeStr = '';
    for (const line of lines) {
      if (line.match(/\d{2}:\d{2}/) || line.includes('jutro') || line.includes('dziś')) {
        commenceTimeStr = line;
        break;
      }
    }

    const oddsButtons = Array.from(
      card.querySelectorAll('.one-ticket-match-tile-outcomes button, .market-grid button')
    );
    let homeOdds = 0;
    let drawOdds = 0;
    let awayOdds = 0;

    oddsButtons.forEach((btn) => {
      const btnText = (btn as HTMLElement).innerText.trim();
      const parts = btnText.split('\n');
      if (parts.length >= 2) {
        const type = parts[0].trim();
        const val = parseFloat(parts[1].trim().replace(',', '.'));
        if (type === '1') homeOdds = val;
        if (type === 'X') drawOdds = val;
        if (type === '2') awayOdds = val;
      }
    });

    if (homeOdds > 0 && awayOdds > 0 && (twoWay || drawOdds > 0)) {
      parsed.push({
        home,
        away,
        commenceTimeStr,
        odds: { home: homeOdds, draw: twoWay ? 0 : drawOdds, away: awayOdds },
      });
    }
  });

  return parsed;
}

async function acceptCookies(page: Page): Promise<void> {
  const selectors = [
    '#onetrust-accept-btn-handler',
    'button:has-text("Akceptuję wszystkie")',
    'button:has-text("Akceptuj wszystkie")',
    'button:has-text("Akceptuję")',
    'button:has-text("Akceptuj")',
    'button:has-text("Zgadzam się")',
    'button:has-text("Zgoda")',
    'button:has-text("Zezwól na wszystkie")',
    'button:has-text("Przejdź do serwisu")',
  ];
  for (const sel of selectors) {
    try {
      const btn = page.locator(sel).first();
      await btn.click({ timeout: 1500 });
      await page.waitForTimeout(500);
      return;
    } catch {
      // banner not present or different selector — try the next one
    }
  }
}

async function autoScroll(page: Page): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(600);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

async function withPage<T>(
  browser: Browser,
  url: string,
  fn: (page: Page) => Promise<T>
): Promise<T> {
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1440, height: 900 },
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
  });
  try {
    // The __name shim is needed because esbuild/tsx instruments serialized
    // page.evaluate functions with __name() helper calls that don't exist
    // in the browser context.
    await context.addInitScript({
      content:
        'window.__name = (fn) => fn;' +
        "Object.defineProperty(navigator, 'webdriver', { get: () => undefined });",
    });
    // Skip heavy assets — we only need the DOM
    await context.route('**/*', (route) => {
      const type = route.request().resourceType();
      if (type === 'image' || type === 'media' || type === 'font') {
        return route.abort();
      }
      return route.continue();
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);
    await acceptCookies(page);
    await autoScroll(page);
    return await fn(page);
  } finally {
    await context.close();
  }
}

async function scrapeBookmaker(
  browser: Browser,
  key: string,
  title: string,
  sport: SportKind,
  url: string,
  extract: (page: Page) => Promise<ScrapedEventRaw[]>
): Promise<BookmakerResult> {
  const label = `${title} (${sport})`;
  try {
    console.log(`[Scraper] Scraping ${label}...`);
    const rawEvents = await withPage(browser, url, extract);
    const events = rawEvents.filter(isValidEvent);
    console.log(`[Scraper] ${label}: ${events.length} valid events (${rawEvents.length} raw).`);
    return { key, title, sport, events };
  } catch (err) {
    console.error(`[Scraper] Error scraping ${label}:`, err);
    return { key, title, sport, events: [] };
  }
}

/** Run tasks with a concurrency cap so we don't open 16 pages at once. */
async function runPool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (next < tasks.length) {
      const idx = next++;
      results[idx] = await tasks[idx]();
    }
  });
  await Promise.all(workers);
  return results;
}

const MAX_KICKOFF_DIFF_MS = 6 * 60 * 60 * 1000;

function mergeResults(results: BookmakerResult[]): OddsApiEvent[] {
  interface Cluster {
    home: string;
    away: string;
    sport: SportKind;
    commenceTimeStr: string;
    commenceMs: number | null; // only set when the source had a real clock
    books: { key: string; title: string; odds: RawOdds }[];
  }

  const clusters: Cluster[] = [];

  for (const result of results) {
    for (const ev of result.events) {
      const hasClock = /\d{1,2}:\d{2}/.test(ev.commenceTimeStr || '');
      const evMs = hasClock ? new Date(parseCommenceTime(ev.commenceTimeStr)).getTime() : null;

      let placed = false;
      for (const cluster of clusters) {
        if (cluster.sport !== result.sport) continue;
        const direct =
          matchTeams(ev.home, cluster.home) && matchTeams(ev.away, cluster.away);
        const reversed =
          !direct &&
          matchTeams(ev.home, cluster.away) &&
          matchTeams(ev.away, cluster.home);

        if (!direct && !reversed) continue;

        // Same team names but kickoff hours apart => different fixtures
        // (e.g. youth vs senior game) — don't merge them.
        if (
          evMs !== null &&
          cluster.commenceMs !== null &&
          Math.abs(evMs - cluster.commenceMs) > MAX_KICKOFF_DIFF_MS
        ) {
          continue;
        }

        if (!cluster.books.some((b) => b.key === result.key)) {
          const odds = reversed
            ? { home: ev.odds.away, draw: ev.odds.draw, away: ev.odds.home }
            : ev.odds;
          cluster.books.push({ key: result.key, title: result.title, odds });
          if (!cluster.commenceTimeStr && ev.commenceTimeStr) {
            cluster.commenceTimeStr = ev.commenceTimeStr;
            cluster.commenceMs = evMs;
          }
        }
        placed = true;
        break;
      }

      if (!placed) {
        clusters.push({
          home: ev.home,
          away: ev.away,
          sport: result.sport,
          commenceTimeStr: ev.commenceTimeStr,
          commenceMs: evMs,
          books: [{ key: result.key, title: result.title, odds: ev.odds }],
        });
      }
    }
  }

  const nowStr = new Date().toISOString();
  const slug = (name: string) =>
    normalizeName(name).replace(/\s+/g, '-').substring(0, 40) || 'x';
  const usedIds = new Set<string>();

  return clusters.map((cluster) => {
    let sportKey = 'basketball';
    let sportTitle = 'Koszykówka';
    if (cluster.sport === 'soccer') {
      const isWorldCup = isNationalTeam(cluster.home) && isNationalTeam(cluster.away);
      sportKey = isWorldCup ? 'soccer_fifa_world_cup' : 'soccer_poland_ekstraklasa';
      sportTitle = isWorldCup ? 'Mistrzostwa Świata 2026' : 'Piłka nożna';
    }
    // Stable across scrape runs so links and journal entries keep working
    // after the data auto-refreshes; suffix only when two fixtures share names.
    const baseId = `scraped-${cluster.sport}-${slug(cluster.home)}-vs-${slug(cluster.away)}`;
    let id = baseId;
    for (let n = 2; usedIds.has(id); n++) id = `${baseId}-${n}`;
    usedIds.add(id);

    return {
      id,
      sport_key: sportKey,
      sport_title: sportTitle,
      commence_time: parseCommenceTime(cluster.commenceTimeStr),
      home_team: cluster.home,
      away_team: cluster.away,
      bookmakers: cluster.books.map((book) => {
        const outcomes = [{ name: cluster.home, price: book.odds.home }];
        if (book.odds.draw > 0) outcomes.push({ name: 'Draw', price: book.odds.draw });
        outcomes.push({ name: cluster.away, price: book.odds.away });
        return {
          key: book.key,
          title: book.title,
          last_update: nowStr,
          markets: [{ key: 'h2h', last_update: nowStr, outcomes }],
        };
      }),
    };
  });
}

export async function runScraper(): Promise<OddsApiEvent[]> {
  console.log('[Scraper] Starting Playwright scraper...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });

  try {
    const tasks: (() => Promise<BookmakerResult>)[] = [
      // --- Piłka nożna ---
      () =>
        scrapeBookmaker(
          browser,
          'superbet',
          'Superbet',
          'soccer',
          'https://superbet.pl/zaklady-bukmacherskie/pilka-nozna',
          (page) => page.evaluate(extractSuperbet, false)
        ),
      () =>
        scrapeBookmaker(
          browser,
          'sts',
          'STS',
          'soccer',
          'https://www.sts.pl/pl/zaklady-bukmacherskie/sport/pilka-nozna/',
          (page) => page.evaluate(extractSts, false)
        ),
      () =>
        scrapeBookmaker(
          browser,
          'fortuna',
          'Fortuna',
          'soccer',
          'https://www.efortuna.pl/zaklady-bukmacherskie/pilka-nozna',
          (page) =>
            page.evaluate(extractWynikMeczu, { selectors: ['.fixture-card'], twoWay: false })
        ),
      () =>
        scrapeBookmaker(browser, 'totalbet', 'Totalbet', 'soccer', 'https://totalbet.pl/', (page) =>
          page.evaluate(extractWynikMeczu, {
            selectors: ['div.relative.px-4.pt-2', 'div.my-3', '[class*="divide-y"] > div'],
            twoWay: false,
          })
        ),
      () =>
        scrapeBookmaker(
          browser,
          'etoto',
          'Etoto',
          'soccer',
          'https://www.etoto.pl/zaklady-bukmacherskie/pilka-nozna',
          (page) => page.evaluate(extractEtoto, false)
        ),
      ...GENERIC_SITES.map(
        (site) => () =>
          scrapeBookmaker(browser, site.key, site.title, 'soccer', site.url, (page) =>
            page.evaluate(extractGenericRows, { selectors: site.selectors, twoWay: false })
          )
      ),
      // --- Koszykówka (rynki dwudrogowe) ---
      () =>
        scrapeBookmaker(
          browser,
          'superbet',
          'Superbet',
          'basketball',
          'https://superbet.pl/zaklady-bukmacherskie/koszykowka',
          (page) => page.evaluate(extractSuperbet, true)
        ),
      () =>
        scrapeBookmaker(
          browser,
          'sts',
          'STS',
          'basketball',
          'https://www.sts.pl/pl/zaklady-bukmacherskie/sport/koszykowka/',
          (page) => page.evaluate(extractSts, true)
        ),
      () =>
        scrapeBookmaker(
          browser,
          'fortuna',
          'Fortuna',
          'basketball',
          'https://www.efortuna.pl/zaklady-bukmacherskie/koszykowka',
          (page) =>
            page.evaluate(extractWynikMeczu, { selectors: ['.fixture-card'], twoWay: true })
        ),
      // Etoto i Fuksiarz kwotują koszykówkę jako pełne 1X2 (remis w regulaminowym
      // czasie), więc parsujemy je trójdrogowo.
      () =>
        scrapeBookmaker(
          browser,
          'etoto',
          'Etoto',
          'basketball',
          'https://www.etoto.pl/zaklady-bukmacherskie/koszykowka',
          (page) => page.evaluate(extractEtoto, false)
        ),
      () =>
        scrapeBookmaker(
          browser,
          'fuksiarz',
          'Fuksiarz',
          'basketball',
          'https://fuksiarz.pl/zaklady-bukmacherskie/koszykowka',
          (page) =>
            page.evaluate(extractGenericRows, {
              selectors: ['.period-item', '[class*="period-item"]', ...COMMON_ROW_SELECTORS],
              twoWay: false,
            })
        ),
      () =>
        scrapeBookmaker(
          browser,
          'betclic',
          'Betclic',
          'basketball',
          'https://www.betclic.pl/koszykowka-s18',
          (page) =>
            page.evaluate(extractGenericRows, {
              selectors: [
                'sports-events-event',
                '[class*="cardEvent"]',
                '[class*="card-event"]',
                ...COMMON_ROW_SELECTORS,
              ],
              twoWay: true,
            })
        ),
    ];

    const results = (await runPool(tasks, 6)).filter((r) => r.events.length > 0);

    const merged = mergeResults(results);
    const multiBook = merged.filter((e) => e.bookmakers.length >= 2).length;
    console.log(
      `[Scraper] Done. ${merged.length} events total, ${multiBook} covered by 2+ bookmakers (sources: ${results
        .map((r) => `${r.title}[${r.sport}]=${r.events.length}`)
        .join(', ')}).`
    );
    return merged;
  } finally {
    await browser.close();
  }
}
