import { NextResponse } from 'next/server';
import { runScraper } from '@/lib/scraper';
import { buildMatchFeed } from '@/lib/match-feed';
import fs from 'fs';
import path from 'path';

// Shared with the background scheduler (instrumentation-node.ts) so a manual
// click and the scheduler can never launch two Playwright runs at once.
const globalFlags = globalThis as unknown as {
  __bukAutoScrape?: boolean;
  __bukScraping?: boolean;
};

// Clicking "Skanuj" again within this window won't re-scrape — it just returns
// the data we already have. Protects against bot-blocks from button spamming.
const COOLDOWN_MIN = Math.max(0, Number(process.env.SCRAPE_COOLDOWN_MIN) || 2);

const FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'scraped-data.json');
const FEED_PATH = path.join(process.cwd(), 'public', 'match-feed.json');

function readFileStats(): { mtime: number | null; count: number } {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const mtime = fs.statSync(FILE_PATH).mtimeMs;
      const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
      return { mtime, count: Array.isArray(data) ? data.length : 0 };
    }
  } catch (e) {
    console.error('Error reading scraped-data.json stats:', e);
  }
  return { mtime: null, count: 0 };
}

function agoLabel(ms: number): string {
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'przed chwilą';
  if (min === 1) return '1 minutę temu';
  return `${min} min temu`;
}

export async function POST() {
  if (globalFlags.__bukScraping) {
    return NextResponse.json(
      { success: false, message: 'Synchronizacja jest już w toku.' },
      { status: 429 }
    );
  }

  // Cooldown — if we scraped very recently, don't hammer the bookmaker sites.
  const before = readFileStats();
  if (COOLDOWN_MIN > 0 && before.mtime && Date.now() - before.mtime < COOLDOWN_MIN * 60_000) {
    return NextResponse.json({
      success: true,
      skipped: true,
      count: before.count,
      timestamp: before.mtime,
      message: `Kursy są aktualne (odświeżono ${agoLabel(Date.now() - before.mtime)}).`,
    });
  }

  globalFlags.__bukScraping = true;

  try {
    const events = await runScraper();

    // Never overwrite good data with an empty/failed scrape.
    if (events.length === 0) {
      return NextResponse.json({
        success: false,
        count: before.count,
        timestamp: before.mtime,
        message: 'Nie udało się pobrać kursów — zachowano poprzednie dane.',
      });
    }

    fs.writeFileSync(FILE_PATH, JSON.stringify(events, null, 2), 'utf-8');
    // Keep the browser-readable feed in sync — MatchAlertWatcher fires e-mail
    // alerts only for events present here, so a stale feed silently drops them.
    fs.writeFileSync(FEED_PATH, JSON.stringify(buildMatchFeed(events)), 'utf-8');

    return NextResponse.json({
      success: true,
      count: events.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error during synchronization API:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Wystąpił błąd podczas synchronizacji.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  } finally {
    globalFlags.__bukScraping = false;
  }
}

export async function GET() {
  const { mtime, count } = readFileStats();
  return NextResponse.json({
    isSyncing: Boolean(globalFlags.__bukScraping),
    lastSyncTime: mtime,
    lastSyncCount: count,
    hasData: mtime !== null,
  });
}
