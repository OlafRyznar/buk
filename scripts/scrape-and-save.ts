import fs from 'fs';
import path from 'path';
import { runScraper } from '../src/lib/scraper';

(async () => {
  const events = await runScraper();
  const filePath = path.join(process.cwd(), 'src', 'lib', 'scraped-data.json');
  fs.writeFileSync(filePath, JSON.stringify(events, null, 2), 'utf-8');
  console.log(`SAVED ${events.length} events to ${filePath}`);
})();
