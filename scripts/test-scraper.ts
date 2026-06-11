import { runScraper } from '../src/lib/scraper';

(async () => {
  const events = await runScraper();

  const byBook: Record<string, number> = {};
  let multi = 0;
  for (const e of events) {
    if (e.bookmakers.length >= 2) multi++;
    for (const b of e.bookmakers) byBook[b.key] = (byBook[b.key] || 0) + 1;
  }

  console.log('\n================ SUMMARY ================');
  console.log('TOTAL EVENTS:', events.length);
  console.log('EVENTS WITH 2+ BOOKMAKERS:', multi);
  console.log('PER BOOKMAKER:', JSON.stringify(byBook, null, 2));

  const sample = events.filter((e) => e.bookmakers.length >= 2).slice(0, 3);
  console.log('\nSAMPLE MULTI-BOOK EVENTS:');
  for (const e of sample) {
    console.log(`\n  ${e.home_team} vs ${e.away_team} (${e.commence_time})`);
    for (const b of e.bookmakers) {
      const o = b.markets[0].outcomes;
      console.log(`    ${b.title}: 1=${o[0].price} X=${o[1].price} 2=${o[2].price}`);
    }
  }
})();
