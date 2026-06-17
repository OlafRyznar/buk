// Next.js instrumentation hook — runs once when the server starts
// (`next start` after a build, or `next dev`). Schedules the Playwright
// scraper so odds refresh themselves without clicking the sync button.
//
// Enabled automatically in production; in dev set AUTO_SCRAPE=1 to opt in.
// Interval (minutes) configurable via SCRAPE_INTERVAL_MIN, default 480 (~3x/day).

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NODE_ENV !== 'production' && process.env.AUTO_SCRAPE !== '1') return;

  const { startAutoScrape } = await import('./instrumentation-node');
  startAutoScrape();
}
