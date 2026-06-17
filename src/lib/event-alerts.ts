// Server-side storage for per-event alert subscriptions ("powiadom mnie gdy...").
// Checked every minute by the scheduler in instrumentation-node.ts alongside
// the generic "before kickoff" match alerts.
import fs from 'fs';
import path from 'path';

export type EventAlertType = 'before-kickoff' | 'at-time' | 'odds-threshold';

export interface EventAlert {
  id: string;
  eventId: string;
  eventName: string;
  sportTitle: string;
  email: string;
  type: EventAlertType;
  createdAt: string;
  minutesBefore?: number; // type: before-kickoff
  atTime?: string; // type: at-time (ISO)
  outcomeName?: string; // type: odds-threshold
  thresholdPrice?: number; // type: odds-threshold
}

const PATH_ = path.join(process.cwd(), 'src', 'lib', 'event-alerts.json');

export function readEventAlerts(): EventAlert[] {
  try {
    if (fs.existsSync(PATH_)) {
      return JSON.parse(fs.readFileSync(PATH_, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading event-alerts.json:', e);
  }
  return [];
}

export function writeEventAlerts(alerts: EventAlert[]) {
  fs.writeFileSync(PATH_, JSON.stringify(alerts, null, 2), 'utf-8');
}

export function addEventAlert(alert: Omit<EventAlert, 'id' | 'createdAt'>): EventAlert {
  const full: EventAlert = { ...alert, id: `ea-${Date.now()}-${Math.round(Math.random() * 1e4)}`, createdAt: new Date().toISOString() };
  const alerts = readEventAlerts();
  alerts.push(full);
  writeEventAlerts(alerts);
  return full;
}

export function removeEventAlert(id: string) {
  writeEventAlerts(readEventAlerts().filter(a => a.id !== id));
}
