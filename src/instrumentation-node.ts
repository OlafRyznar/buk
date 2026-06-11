// Node-only part of the instrumentation hook — scheduled background scraping.
// Loaded dynamically from instrumentation.ts only in the nodejs runtime.
import fs from 'fs';
import path from 'path';

const globalFlags = globalThis as unknown as { __bukAutoScrape?: boolean };

export function startAutoScrape() {
  if (globalFlags.__bukAutoScrape) return; // only one scheduler per process
  globalFlags.__bukAutoScrape = true;

  const intervalMin = Math.max(5, Number(process.env.SCRAPE_INTERVAL_MIN) || 20);
  const intervalMs = intervalMin * 60 * 1000;
  const filePath = path.join(process.cwd(), 'src', 'lib', 'scraped-data.json');

  let running = false;

  const scrapeAndSave = async () => {
    if (running) return;
    running = true;
    try {
      const { runScraper } = await import('./lib/scraper');
      const events = await runScraper();
      if (events.length > 0) {
        fs.writeFileSync(filePath, JSON.stringify(events, null, 2), 'utf-8');
        console.log(`[AutoScrape] Saved ${events.length} events (next run in ${intervalMin} min).`);
      } else {
        console.warn('[AutoScrape] Scraper returned 0 events — keeping previous data.');
      }
    } catch (err) {
      console.error('[AutoScrape] Failed:', err);
    } finally {
      running = false;
    }
  };

  // First run shortly after boot, but only when the existing data is stale —
  // a deploy right after a manual scrape shouldn't rescan immediately.
  setTimeout(() => {
    try {
      const stale =
        !fs.existsSync(filePath) || Date.now() - fs.statSync(filePath).mtimeMs > intervalMs;
      if (stale) void scrapeAndSave();
    } catch {
      void scrapeAndSave();
    }
  }, 15 * 1000);

  setInterval(scrapeAndSave, intervalMs);
  console.log(`[AutoScrape] Scheduled: every ${intervalMin} min.`);
}
