import {
  EventWithOdds,
  ArbitrageOpportunity,
  DashboardStats,
  NearArbitrageOpportunity,
  SUPPORTED_SPORTS,
} from './types';
import { fetchOddsForMultipleSports, transformEvents } from './odds-api';
import { findAllArbitrages, findAllNearArbitrages } from './arbitrage';
import { getDemoEvents } from './demo-data';
import { transformToEventWithOdds } from './odds-api';

import fs from 'fs';
import path from 'path';

const USE_DEMO = !process.env.ODDS_API_KEY;

// A single bookmaker's odds can't be compared or arbitraged against
// anything — events covered by only one source are noise, not opportunities.
const MIN_BOOKMAKERS_PER_EVENT = 2;

function countDistinctBookmakers(event: EventWithOdds): number {
  const keys = new Set<string>();
  for (const market of event.markets) {
    for (const outcome of market.outcomes) {
      for (const bm of outcome.bookmakers) keys.add(bm.bookmakerKey);
    }
  }
  return keys.size;
}

function filterCoveredEvents(events: EventWithOdds[]): EventWithOdds[] {
  return events.filter((e) => countDistinctBookmakers(e) >= MIN_BOOKMAKERS_PER_EVENT);
}

export async function getAllEvents(): Promise<EventWithOdds[]> {
  if (USE_DEMO) {
    try {
      const filePath = path.join(process.cwd(), 'src', 'lib', 'scraped-data.json');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const scrapedEvents = JSON.parse(fileContent);
        if (Array.isArray(scrapedEvents) && scrapedEvents.length > 0) {
          console.log(`[DataService] Loading ${scrapedEvents.length} events from scraped-data.json`);
          return filterCoveredEvents(scrapedEvents.map(transformToEventWithOdds));
        }
      }
    } catch (e) {
      console.error('[DataService] Error reading scraped data, falling back to demo data:', e);
    }

    const demoEvents = getDemoEvents();
    return filterCoveredEvents(demoEvents.map(transformToEventWithOdds));
  }

  const sportKeys = SUPPORTED_SPORTS.map((s) => s.key);
  const apiEvents = await fetchOddsForMultipleSports(sportKeys);
  return filterCoveredEvents(transformEvents(apiEvents));
}

export async function getArbitrageOpportunities(
  stake: number = 1000
): Promise<ArbitrageOpportunity[]> {
  const events = await getAllEvents();
  return findAllArbitrages(events, stake);
}

// "Close" means close for real: the odds move needed to flip into a surebet
// is small AND the match actually starts soon.
const NEAR_ARB_MAX_ODDS_CHANGE_PCT = 3;
const NEAR_ARB_MAX_HOURS_AHEAD = 72;
const NEAR_ARB_MAX_HOURS_STARTED = 2;

export async function getNearArbitrageOpportunities(
  threshold: number = 0.04
): Promise<NearArbitrageOpportunity[]> {
  const events = await getAllEvents();
  const all = findAllNearArbitrages(events, threshold);

  const now = Date.now();
  const earliest = now - NEAR_ARB_MAX_HOURS_STARTED * 3600 * 1000;
  const latest = now + NEAR_ARB_MAX_HOURS_AHEAD * 3600 * 1000;

  return all.filter((opp) => {
    if (opp.requiredOddsChangePercent > NEAR_ARB_MAX_ODDS_CHANGE_PCT) return false;
    const start = new Date(opp.event.commenceTime).getTime();
    return start >= earliest && start <= latest;
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const events = await getAllEvents();
  const arbitrages = findAllArbitrages(events);
  const nearArbitrages = findAllNearArbitrages(events);

  const bookmakerSet = new Set<string>();
  for (const event of events) {
    for (const market of event.markets) {
      for (const outcome of market.outcomes) {
        for (const bm of outcome.bookmakers) {
          bookmakerSet.add(bm.bookmaker);
        }
      }
    }
  }

  const sportsWithArbs = [...new Set(arbitrages.map((a) => a.event.sportTitle))];

  return {
    totalEvents: events.length,
    totalBookmakers: bookmakerSet.size,
    totalArbitrages: arbitrages.length,
    totalNearArbitrages: nearArbitrages.length,
    bestProfit: arbitrages.length > 0 ? arbitrages[0].profit : 0,
    averageProfit:
      arbitrages.length > 0
        ? Math.round(
            (arbitrages.reduce((sum, a) => sum + a.profit, 0) / arbitrages.length) * 100
          ) / 100
        : 0,
    closestToArbitrage:
      nearArbitrages.length > 0 ? nearArbitrages[0].distanceFromArbitrage : 0,
    sportsWithArbitrages: sportsWithArbs,
  };
}

export async function getEventById(id: string): Promise<EventWithOdds | null> {
  const events = await getAllEvents();
  return events.find((e) => e.id === id) || null;
}

export function isUsingDemo(): boolean {
  return USE_DEMO;
}

export interface SportMarginStat {
  margin: number;
  count: number;
}

export interface BookmakerMarginStats {
  key: string;
  title: string;
  eventCount: number;
  avgMargin: number;
  minMargin: number;
  maxMargin: number;
  soccer: SportMarginStat | null;
  worldCup: SportMarginStat | null;
  basketball: SportMarginStat | null;
}

export interface MarginsReport {
  stats: BookmakerMarginStats[];
  totalEvents: number;
  lastSync: number | null;
}

const round2 = (v: number) => Math.round(v * 100) / 100;
const avg = (list: number[]) =>
  list.length ? round2(list.reduce((s, v) => s + v, 0) / list.length) : 0;

/**
 * Real bookmaker margins computed from the odds we actually scraped —
 * for every event-market, a bookmaker's margin is the sum of inverse odds
 * it quotes minus 100%.
 */
export async function getBookmakerMargins(): Promise<MarginsReport> {
  const events = await getAllEvents();

  const acc = new Map<
    string,
    { title: string; all: number[]; soccer: number[]; worldCup: number[]; basketball: number[] }
  >();

  for (const event of events) {
    const category = event.sportKey.startsWith('basketball')
      ? 'basketball'
      : event.sportKey === 'soccer_fifa_world_cup'
        ? 'worldCup'
        : 'soccer';

    for (const market of event.markets) {
      const byBook = new Map<string, { title: string; invSum: number; quoted: number }>();
      for (const outcome of market.outcomes) {
        for (const bm of outcome.bookmakers) {
          const cur = byBook.get(bm.bookmakerKey) || {
            title: bm.bookmaker,
            invSum: 0,
            quoted: 0,
          };
          cur.invSum += 1 / bm.odds;
          cur.quoted += 1;
          byBook.set(bm.bookmakerKey, cur);
        }
      }

      for (const [key, v] of byBook) {
        if (v.quoted < 2) continue;
        const margin = (v.invSum - 1) * 100;
        if (margin < -2 || margin > 25) continue; // parse glitch, not a real margin
        const entry = acc.get(key) || {
          title: v.title,
          all: [],
          soccer: [],
          worldCup: [],
          basketball: [],
        };
        entry.all.push(margin);
        entry[category].push(margin);
        acc.set(key, entry);
      }
    }
  }

  const stats: BookmakerMarginStats[] = [...acc.entries()]
    .map(([key, v]) => ({
      key,
      title: v.title,
      eventCount: v.all.length,
      avgMargin: avg(v.all),
      minMargin: round2(Math.min(...v.all)),
      maxMargin: round2(Math.max(...v.all)),
      soccer: v.soccer.length ? { margin: avg(v.soccer), count: v.soccer.length } : null,
      worldCup: v.worldCup.length ? { margin: avg(v.worldCup), count: v.worldCup.length } : null,
      basketball: v.basketball.length
        ? { margin: avg(v.basketball), count: v.basketball.length }
        : null,
    }))
    .sort((a, b) => a.avgMargin - b.avgMargin);

  let lastSync: number | null = null;
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'scraped-data.json');
    if (fs.existsSync(filePath)) lastSync = fs.statSync(filePath).mtimeMs;
  } catch {
    // brak pliku = brak znacznika czasu
  }

  return { stats, totalEvents: events.length, lastSync };
}
