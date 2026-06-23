// Standalone background worker for the VPS — runs independently of the
// static (FTP-hosted) frontend. Periodically scrapes odds and checks
// notify_settings / event_alerts in Supabase, sending matches to n8n.
//
// Usage on the VPS: pm2 start ecosystem.alerts.config.cjs
// Required env (.env on the VPS): NEXT_PUBLIC_SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY (Project Settings -> API -> service_role, NOT
// the publishable key), N8N_WEBHOOK_URL. Optional: SCRAPE_INTERVAL_MIN (default 480).
import fs from 'fs';
import path from 'path';
import { runScraper } from '../src/lib/scraper';
import { checkAndSendMatchAlerts, checkAndSendEventAlerts } from '../src/lib/match-alerts';

const SCRAPED_DATA_PATH = path.join(process.cwd(), 'src', 'lib', 'scraped-data.json');

async function scrapeAndSave() {
  try {
    const events = await runScraper();
    if (events.length > 0) {
      fs.writeFileSync(SCRAPED_DATA_PATH, JSON.stringify(events, null, 2), 'utf-8');
      console.log(`[AlertsWorker] Scraped and saved ${events.length} events.`);
    } else {
      console.warn('[AlertsWorker] Scraper returned 0 events — keeping previous data.');
    }
  } catch (err) {
    console.error('[AlertsWorker] Scrape failed:', err);
  }
}

async function tick() {
  try {
    await checkAndSendMatchAlerts();
    await checkAndSendEventAlerts();
  } catch (err) {
    console.error('[AlertsWorker] Alert check failed:', err);
  }
}

async function main() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[AlertsWorker] SUPABASE_SERVICE_ROLE_KEY is not set — exiting.');
    process.exit(1);
  }

  const intervalMin = Math.max(30, Number(process.env.SCRAPE_INTERVAL_MIN) || 480);
  console.log(`[AlertsWorker] Starting. Scraping every ${intervalMin} min, checking alerts every 1 min.`);

  await scrapeAndSave();
  setInterval(scrapeAndSave, intervalMin * 60 * 1000);
  setInterval(tick, 60 * 1000);
}

main();
