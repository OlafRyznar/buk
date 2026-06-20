// Scans scraped-data.json for events about to start and, once per event,
// pushes a "match starting soon" payload to the n8n webhook so it can e-mail
// the user the best odds across bookmakers (h2h market).
import fs from 'fs';
import path from 'path';
import { OddsApiEvent } from './types';
import { ALL_BOOKMAKERS } from './store-types';
import { readNotifiedIds, markNotified, sendToN8n, OddsRow, readNotifiedEventAlertIds, markEventAlertNotified } from './notify-store';
import { readEventAlerts, removeEventAlert, EventAlert } from './event-alerts';

const SCRAPED_DATA_PATH = path.join(process.cwd(), 'src', 'lib', 'scraped-data.json');
const BOOKMAKER_URLS: Record<string, string> = Object.fromEntries(
  ALL_BOOKMAKERS.map(bm => [bm.key, bm.url])
);

function readScrapedEvents(): OddsApiEvent[] {
  try {
    if (fs.existsSync(SCRAPED_DATA_PATH)) {
      return JSON.parse(fs.readFileSync(SCRAPED_DATA_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading scraped-data.json:', e);
  }
  return [];
}

function bestOddsForEvent(event: OddsApiEvent): OddsRow[] {
  const best = new Map<string, OddsRow>();
  for (const bm of event.bookmakers) {
    const h2h = bm.markets.find(m => m.key === 'h2h');
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

export async function checkAndSendMatchAlerts() {
  // Generic match starting soon alerts disabled to prevent spamming n8n.
  // We only want explicitly added match alerts to fire.
  return;
}

async function fireEventAlert(alert: EventAlert, event: OddsApiEvent, minutesUntil: number) {
  markEventAlertNotified(alert.id);
  removeEventAlert(alert.id);

  const result = await sendToN8n({
    isTest: false,
    email: alert.email,
    event: {
      id: event.id,
      sportTitle: event.sport_title,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      commenceTime: event.commence_time,
      minutesUntil: Math.round(minutesUntil),
    },
    odds: bestOddsForEvent(event),
  });
  if (result.ok) {
    console.log(`[EventAlerts] Fired ${alert.type} alert for ${event.home_team} vs ${event.away_team}`);
  } else {
    console.error(`[EventAlerts] Failed to fire alert ${alert.id}:`, result.error || result.status);
  }
}

// User-created "powiadom mnie gdy..." subscriptions tied to a specific event:
// X minutes before kickoff, at a specific clock time, or once a given
// outcome's odds cross a threshold at any bookmaker.
export async function checkAndSendEventAlerts() {
  const alerts = readEventAlerts();
  if (alerts.length === 0) return;

  const events = readScrapedEvents();
  const eventsById = new Map(events.map(e => [e.id, e]));
  const notifiedAlertIds = new Set(readNotifiedEventAlertIds());
  const now = Date.now();
  const windowMs = 60 * 1000;

  for (const alert of alerts) {
    // Skip if this alert has already been fired
    if (notifiedAlertIds.has(alert.id)) continue;

    const event = eventsById.get(alert.eventId);
    if (!event) continue; // event disappeared from the last scrape
    const minutesUntil = (new Date(event.commence_time).getTime() - now) / 60000;

    if (alert.type === 'before-kickoff' && alert.minutesBefore !== undefined) {
      const withinWindow =
        minutesUntil <= alert.minutesBefore && minutesUntil > alert.minutesBefore - windowMs / 60000;
      if (withinWindow) await fireEventAlert(alert, event, minutesUntil);
      continue;
    }

    if (alert.type === 'at-time' && alert.atTime) {
      if (now >= new Date(alert.atTime).getTime()) await fireEventAlert(alert, event, minutesUntil);
      continue;
    }

    if (alert.type === 'odds-threshold' && alert.outcomeName && alert.thresholdPrice !== undefined) {
      const best = bestOddsForEvent(event).find(o => o.outcome === alert.outcomeName);
      if (best && best.price >= alert.thresholdPrice) await fireEventAlert(alert, event, minutesUntil);
      continue;
    }
  }
}
