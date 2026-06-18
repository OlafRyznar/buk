// Scans scraped-data.json for events about to start and, for every user with
// alerts enabled (notify_settings / event_alerts in Supabase), pushes a
// "match starting soon" payload to the n8n webhook so it can e-mail the best
// odds across bookmakers (h2h market). Reads/writes via the service-role
// client, since this runs as a standalone worker, not per-request.
import fs from 'fs';
import path from 'path';
import { OddsApiEvent } from './types';
import { ALL_BOOKMAKERS } from './store-types';
import { readNotifiedIds, markNotified, sendToN8n, OddsRow } from './notify-store';
import { createAdminClient } from './supabase/admin';

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

interface NotifySettingsRow {
  user_id: string;
  email: string;
  enabled: boolean;
  minutes_before: number;
}

interface EventAlertRow {
  id: string;
  event_id: string;
  email: string;
  type: 'before-kickoff' | 'at-time' | 'odds-threshold';
  minutes_before: number | null;
  at_time: string | null;
  outcome_name: string | null;
  threshold_price: number | null;
}

export async function checkAndSendMatchAlerts() {
  const supabase = createAdminClient();
  const { data: settingsRows, error } = await supabase
    .from('notify_settings')
    .select('user_id, email, enabled, minutes_before')
    .eq('enabled', true);
  if (error || !settingsRows || settingsRows.length === 0) return;

  const events = readScrapedEvents();
  if (events.length === 0) return;

  const notifiedIds = new Set(readNotifiedIds());
  const now = Date.now();
  const windowMs = 60 * 1000; // worker runs every minute, so a 1-minute window won't double-fire or skip

  for (const event of events) {
    if (notifiedIds.has(event.id)) continue;
    const minutesUntil = (new Date(event.commence_time).getTime() - now) / 60000;

    for (const settings of settingsRows as NotifySettingsRow[]) {
      const targetMinutes = settings.minutes_before;
      const withinWindow =
        minutesUntil <= targetMinutes && minutesUntil > targetMinutes - windowMs / 60000;
      if (!withinWindow) continue;

      const result = await sendToN8n({
        isTest: false,
        email: settings.email,
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
        console.log(`[MatchAlerts] Sent alert for ${event.home_team} vs ${event.away_team} -> ${settings.email}`);
      } else {
        console.error(`[MatchAlerts] Failed to send alert for ${event.id}:`, result.error || result.status);
      }
    }

    markNotified(event.id);
  }
}

async function fireEventAlert(supabase: ReturnType<typeof createAdminClient>, alert: EventAlertRow, event: OddsApiEvent, minutesUntil: number) {
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
  await supabase.from('event_alerts').delete().eq('id', alert.id);
  if (result.ok) {
    console.log(`[EventAlerts] Fired ${alert.type} alert for ${event.home_team} vs ${event.away_team} -> ${alert.email}`);
  } else {
    console.error(`[EventAlerts] Failed to fire alert ${alert.id}:`, result.error || result.status);
  }
}

// User-created "powiadom mnie gdy..." subscriptions tied to a specific event:
// X minutes before kickoff, at a specific clock time, or once a given
// outcome's odds cross a threshold at any bookmaker.
export async function checkAndSendEventAlerts() {
  const supabase = createAdminClient();
  const { data: alerts, error } = await supabase
    .from('event_alerts')
    .select('id, event_id, email, type, minutes_before, at_time, outcome_name, threshold_price');
  if (error || !alerts || alerts.length === 0) return;

  const events = readScrapedEvents();
  const eventsById = new Map(events.map(e => [e.id, e]));
  const now = Date.now();
  const windowMs = 60 * 1000;

  for (const alert of alerts as EventAlertRow[]) {
    const event = eventsById.get(alert.event_id);
    if (!event) continue; // event disappeared from the last scrape
    const minutesUntil = (new Date(event.commence_time).getTime() - now) / 60000;

    if (alert.type === 'before-kickoff' && alert.minutes_before !== null) {
      const withinWindow =
        minutesUntil <= alert.minutes_before && minutesUntil > alert.minutes_before - windowMs / 60000;
      if (withinWindow) await fireEventAlert(supabase, alert, event, minutesUntil);
      continue;
    }

    if (alert.type === 'at-time' && alert.at_time) {
      if (now >= new Date(alert.at_time).getTime()) await fireEventAlert(supabase, alert, event, minutesUntil);
      continue;
    }

    if (alert.type === 'odds-threshold' && alert.outcome_name && alert.threshold_price !== null) {
      const best = bestOddsForEvent(event).find(o => o.outcome === alert.outcome_name);
      if (best && best.price >= alert.threshold_price!) await fireEventAlert(supabase, alert, event, minutesUntil);
      continue;
    }
  }
}
