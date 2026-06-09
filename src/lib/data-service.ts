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

const USE_DEMO = !process.env.ODDS_API_KEY;

export async function getAllEvents(): Promise<EventWithOdds[]> {
  if (USE_DEMO) {
    const demoEvents = getDemoEvents();
    return demoEvents.map(transformToEventWithOdds);
  }

  const sportKeys = SUPPORTED_SPORTS.map((s) => s.key);
  const apiEvents = await fetchOddsForMultipleSports(sportKeys);
  return transformEvents(apiEvents);
}

export async function getArbitrageOpportunities(
  stake: number = 1000
): Promise<ArbitrageOpportunity[]> {
  const events = await getAllEvents();
  return findAllArbitrages(events, stake);
}

export async function getNearArbitrageOpportunities(
  threshold: number = 0.04
): Promise<NearArbitrageOpportunity[]> {
  const events = await getAllEvents();
  return findAllNearArbitrages(events, threshold);
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
