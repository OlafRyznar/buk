import {
  OddsApiEvent,
  EventWithOdds,
  MarketComparison,
  OutcomeComparison,
  BookmakerOdds,
  Sport,
} from './types';

const API_KEY = process.env.ODDS_API_KEY || '';
const BASE_URL = 'https://api.the-odds-api.com/v4';

export async function fetchSports(): Promise<Sport[]> {
  const res = await fetch(`${BASE_URL}/sports/?apiKey=${API_KEY}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error('Failed to fetch sports:', res.status, res.statusText);
    return [];
  }

  return res.json();
}

export async function fetchOddsForSport(
  sportKey: string,
  regions: string = 'eu,uk',
  markets: string = 'h2h'
): Promise<OddsApiEvent[]> {
  const url = `${BASE_URL}/sports/${sportKey}/odds/?apiKey=${API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=decimal`;

  const res = await fetch(url, {
    next: { revalidate: 120 }, // revalidate every 2 minutes
  });

  if (!res.ok) {
    console.error(`Failed to fetch odds for ${sportKey}:`, res.status, res.statusText);
    return [];
  }

  return res.json();
}

export async function fetchOddsForMultipleSports(
  sportKeys: string[],
  regions: string = 'eu,uk',
  markets: string = 'h2h'
): Promise<OddsApiEvent[]> {
  const promises = sportKeys.map((key) => fetchOddsForSport(key, regions, markets));
  const results = await Promise.allSettled(promises);

  const events: OddsApiEvent[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      events.push(...result.value);
    }
  }

  return events;
}

export function transformToEventWithOdds(apiEvent: OddsApiEvent): EventWithOdds {
  const marketsMap = new Map<string, Map<string, BookmakerOdds[]>>();

  for (const bookmaker of apiEvent.bookmakers) {
    for (const market of bookmaker.markets) {
      if (!marketsMap.has(market.key)) {
        marketsMap.set(market.key, new Map());
      }
      const outcomesMap = marketsMap.get(market.key)!;

      for (const outcome of market.outcomes) {
        if (!outcomesMap.has(outcome.name)) {
          outcomesMap.set(outcome.name, []);
        }
        outcomesMap.get(outcome.name)!.push({
          bookmaker: bookmaker.title,
          bookmakerKey: bookmaker.key,
          outcome: outcome.name,
          odds: outcome.price,
          lastUpdate: bookmaker.last_update,
          eventUrl: bookmaker.event_url,
        });
      }
    }
  }

  const markets: MarketComparison[] = [];
  for (const [marketKey, outcomesMap] of marketsMap) {
    const outcomes: OutcomeComparison[] = [];

    for (const [name, bookmakers] of outcomesMap) {
      const sorted = [...bookmakers].sort((a, b) => b.odds - a.odds);
      outcomes.push({
        name,
        bookmakers: sorted,
        bestOdds: sorted[0],
        worstOdds: sorted[sorted.length - 1],
      });
    }

    markets.push({ marketKey, outcomes });
  }

  return {
    id: apiEvent.id,
    sportKey: apiEvent.sport_key,
    sportTitle: apiEvent.sport_title,
    homeTeam: apiEvent.home_team,
    awayTeam: apiEvent.away_team,
    commenceTime: apiEvent.commence_time,
    markets,
  };
}

export function transformEvents(apiEvents: OddsApiEvent[]): EventWithOdds[] {
  return apiEvents.map(transformToEventWithOdds);
}
