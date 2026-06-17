// Server-side storage for the e-mail alert settings + which events we already
// notified about. Kept separate from the client's localStorage settings
// because the alert scheduler (instrumentation-node.ts) runs without a
// browser and needs this even when nobody has the app open.
import fs from 'fs';
import path from 'path';

export interface NotifySettings {
  email: string;
  enabled: boolean;
  minutesBefore: number;
}

const DEFAULT_NOTIFY_SETTINGS: NotifySettings = {
  email: '',
  enabled: false,
  minutesBefore: 30,
};

const SETTINGS_PATH = path.join(process.cwd(), 'src', 'lib', 'notify-settings.json');
const NOTIFIED_PATH = path.join(process.cwd(), 'src', 'lib', 'notified-events.json');

export function readNotifySettings(): NotifySettings {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return { ...DEFAULT_NOTIFY_SETTINGS, ...JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8')) };
    }
  } catch (e) {
    console.error('Error reading notify-settings.json:', e);
  }
  return DEFAULT_NOTIFY_SETTINGS;
}

export function writeNotifySettings(settings: NotifySettings) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

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
