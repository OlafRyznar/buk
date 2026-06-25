// Builds the public/match-feed.json snapshot the browser reads to fire
// "match starting soon" e-mail alerts. On a static export there's no server
// or scheduler, so the alert check runs client-side (see MatchAlertWatcher)
// and needs the upcoming events + best h2h odds as a plain fetchable file.
import { OddsApiEvent } from './types';
import { ALL_BOOKMAKERS } from './store-types';

const BOOKMAKER_URLS: Record<string, string> = Object.fromEntries(
  ALL_BOOKMAKERS.map((bm) => [bm.key, bm.url])
);

export interface FeedOdds {
  bookmaker: string;
  bookmakerKey: string;
  url: string;
  outcome: string;
  price: number;
}

export interface FeedEvent {
  id: string;
  sportTitle: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  odds: FeedOdds[];
}

function bestOddsForEvent(event: OddsApiEvent): FeedOdds[] {
  const best = new Map<string, FeedOdds>();
  for (const bm of event.bookmakers) {
    const h2h = bm.markets.find((m) => m.key === 'h2h');
    if (!h2h) continue;
    for (const outcome of h2h.outcomes) {
      const current = best.get(outcome.name);
      if (!current || outcome.price > current.price) {
        best.set(outcome.name, {
          bookmaker: bm.title,
          bookmakerKey: bm.key,
          url: BOOKMAKER_URLS[bm.key] || '',
          outcome: outcome.name,
          price: outcome.price,
        });
      }
    }
  }
  return Array.from(best.values());
}

export function buildMatchFeed(events: OddsApiEvent[]): FeedEvent[] {
  return events
    .filter((e) => e.bookmakers && e.bookmakers.length > 0)
    .map((e) => ({
      id: e.id,
      sportTitle: e.sport_title,
      homeTeam: e.home_team,
      awayTeam: e.away_team,
      commenceTime: e.commence_time,
      odds: bestOddsForEvent(e),
    }));
}
