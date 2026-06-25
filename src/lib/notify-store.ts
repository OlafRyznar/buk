// Local dedup bookkeeping for the alert worker (which events/ids it already
// fired for) plus the n8n webhook sender. Notify settings and event alerts
// themselves live in Supabase now (notify_settings / event_alerts tables) so
// the frontend can write them directly without a server — see
// src/lib/alerts-service.ts (browser) and scripts/alerts-worker.ts (VPS).
import fs from 'fs';
import path from 'path';

const NOTIFIED_PATH = path.join(process.cwd(), 'src', 'lib', 'notified-events.json');

export function readNotifiedIds(): string[] {
  try {
    if (fs.existsSync(NOTIFIED_PATH)) {
      return JSON.parse(fs.readFileSync(NOTIFIED_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading notified-events.json:', e);
  }
  return [];
}

export function markNotified(id: string) {
  const ids = readNotifiedIds();
  if (ids.includes(id)) return;
  ids.push(id);
  // Keep the file from growing forever — only the last 500 ids matter.
  const trimmed = ids.slice(-500);
  fs.writeFileSync(NOTIFIED_PATH, JSON.stringify(trimmed, null, 2), 'utf-8');
}

const NOTIFIED_EVENT_ALERTS_PATH = path.join(process.cwd(), 'src', 'lib', 'notified-event-alerts.json');

export function readNotifiedEventAlertIds(): string[] {
  try {
    if (fs.existsSync(NOTIFIED_EVENT_ALERTS_PATH)) {
      return JSON.parse(fs.readFileSync(NOTIFIED_EVENT_ALERTS_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading notified-event-alerts.json:', e);
  }
  return [];
}

export function markEventAlertNotified(alertId: string) {
  const ids = readNotifiedEventAlertIds();
  if (ids.includes(alertId)) return;
  ids.push(alertId);
  // Keep only the last 500 alert IDs
  const trimmed = ids.slice(-500);
  fs.writeFileSync(NOTIFIED_EVENT_ALERTS_PATH, JSON.stringify(trimmed, null, 2), 'utf-8');
}

export interface OddsRow {
  bookmaker: string;
  bookmakerKey: string;
  url: string;
  outcome: string;
  price: number;
}

export interface MatchAlertPayload {
  isTest: boolean;
  email: string;
  event: {
    id: string;
    sportTitle: string;
    homeTeam: string;
    awayTeam: string;
    commenceTime: string;
    minutesUntil: number;
  };
  odds: OddsRow[];
}

export async function sendToN8n(payload: MatchAlertPayload): Promise<{ ok: boolean; status?: number; error?: string }> {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) {
    return { ok: false, error: 'N8N_WEBHOOK_URL nie jest skonfigurowany w .env' };
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
