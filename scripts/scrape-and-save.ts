import fs from 'fs';
import path from 'path';
import { runScraper } from '../src/lib/scraper';
import { buildMatchFeed } from '../src/lib/match-feed';

(async () => {
  const events = await runScraper();
  const filePath = path.join(process.cwd(), 'src', 'lib', 'scraped-data.json');
  fs.writeFileSync(filePath, JSON.stringify(events, null, 2), 'utf-8');
  console.log(`SAVED ${events.length} events to ${filePath}`);

  // Public snapshot the browser reads for client-side e-mail alerts.
  const feedPath = path.join(process.cwd(), 'public', 'match-feed.json');
  fs.writeFileSync(feedPath, JSON.stringify(buildMatchFeed(events)), 'utf-8');
  console.log(`SAVED match feed to ${feedPath}`);
})();
