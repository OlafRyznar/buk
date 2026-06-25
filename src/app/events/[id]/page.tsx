import { getEventById } from "@/lib/data-service";
import { findArbitrageForEvent, impliedProbability } from "@/lib/arbitrage";
import { ALL_BOOKMAKERS } from "@/lib/store-types";
import ArbitrageCard from "@/components/ArbitrageCard";
import TeamFlag from "@/components/TeamFlag";
import WatchlistButton from "@/components/WatchlistButton";
import EventAlertButton from "@/components/EventAlertButton";
import AddToJournalButton from "@/components/AddToJournalButton";
import BookmakerLink from "@/components/BookmakerLink";
import Link from "next/link";
import { notFound } from "next/navigation";

// Events change with every background scrape, so render on demand instead of
// freezing the build-time list of IDs.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const arbitrages = findArbitrageForEvent(event, 1000);
  const h2hMarket = event.markets.find((m) => m.marketKey === "h2h");
  interface BookmakerRow {
    odds: Record<string, number>;
    bookmakerKey: string;
    url: string;
  }
  const bookmakerRows = h2hMarket
    ? (() => {
        const bookmakers = new Map<string, BookmakerRow>();
        for (const outcome of h2hMarket.outcomes) {
          for (const bm of outcome.bookmakers) {
            if (!bookmakers.has(bm.bookmaker)) {
              const bmInfo = ALL_BOOKMAKERS.find((b) => b.key === bm.bookmakerKey);
              bookmakers.set(bm.bookmaker, {
                odds: {},
                bookmakerKey: bm.bookmakerKey,
                url: bm.eventUrl ?? bmInfo?.url ?? "#",
              });
            }
            const row = bookmakers.get(bm.bookmaker)!;
            row.odds[outcome.name] = bm.odds;
            // Prefer a direct match link over the bookmaker homepage as soon
            // as one outcome's row provides it.
            if (bm.eventUrl) row.url = bm.eventUrl;
          }
        }

        return Array.from(bookmakers.entries());
      })()
    : [];

  return (
    <div className="w-full space-y-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-white/55">
        <Link href="/events" className="transition-colors hover:text-white">
          Wydarzenia
        </Link>
        <span>/</span>
        <span className="text-white">{event.homeTeam} vs {event.awayTeam}</span>
      </div>

      {/* Event header */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
                {event.sportTitle}
              </span>
              <WatchlistButton eventId={event.id} />
              {h2hMarket && (
                <EventAlertButton
                  eventId={event.id}
                  eventName={`${event.homeTeam} vs ${event.awayTeam}`}
                  sportTitle={event.sportTitle}
                  outcomes={h2hMarket.outcomes.map(o => o.name)}
                />
              )}
              {h2hMarket && (
                <AddToJournalButton
                  eventName={`${event.homeTeam} vs ${event.awayTeam}`}
                  sportTitle={event.sportTitle}
                  commenceTime={event.commenceTime}
                  marketKey="h2h"
                  outcomes={h2hMarket.outcomes.map((o) => ({
                    name: o.name,
                    odds: o.bestOdds.odds,
                    bookmaker: o.bestOdds.bookmaker,
                    bookmakerKey: o.bestOdds.bookmakerKey,
                  }))}
                />
              )}
            </div>
            <h1 className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-bold text-white sm:text-3xl">
              <TeamFlag team={event.homeTeam} size={30} />
              {event.homeTeam}
              <span className="text-white/42">vs</span>
              <TeamFlag team={event.awayTeam} size={30} />
              {event.awayTeam}
            </h1>
            <p className="mt-2 text-white/68">
              {new Date(event.commenceTime).toLocaleString("pl-PL", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
          </div>
          {arbitrages.length > 0 && (
            <div className="text-right">
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/14 px-3 py-1 text-sm font-medium text-emerald-50 animate-pulse-green">
                ARBITRAŻ DOSTĘPNY
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Arbitrage opportunities */}
      {arbitrages.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">
            Okazje arbitrażowe
          </h2>
          <div className="space-y-4">
            {arbitrages.map((arb) => (
              <ArbitrageCard key={arb.id} opportunity={arb} showDetails />
            ))}
          </div>
        </section>
      )}

      {/* Full odds comparison */}
      {h2hMarket && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">
            Porównanie kursów (1x2)
          </h2>
          <div className="glass-panel overflow-hidden rounded-xl">
            <div className="space-y-3 p-4 md:hidden">
              {bookmakerRows.map(([name, row]) => (
                <div key={name} className="py-3 border-b border-white/5 last:border-0">
                  <div className="mb-2">
                    <BookmakerLink
                      name={name}
                      url={row.url}
                      bookmakerKey={row.bookmakerKey}
                      className="text-xs font-bold text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {h2hMarket.outcomes.map((o) => {
                      const oddVal = row.odds[o.name];
                      const isMax = o.bestOdds.bookmaker === name;
                      return (
                        <div key={o.name} className="flex items-center justify-between py-1.5 text-xs text-white/50">
                          <span>{o.name}</span>
                          {oddVal ? (
                            <span className={`font-mono text-xs ${isMax ? 'font-bold text-emerald-400' : 'text-white/80'}`}>
                              {oddVal.toFixed(2)}
                            </span>
                          ) : (
                            <span className="opacity-30">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-white/5 mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Najlepsze kursy</p>
                <div className="mt-2 space-y-2">
                  {h2hMarket.outcomes.map((o) => (
                    <div key={o.name} className="flex items-center justify-between py-1.5 text-xs text-white/50">
                      <span>{o.name}</span>
                      <span className="text-right">
                        <span className="font-mono font-bold text-emerald-400">{o.bestOdds.odds.toFixed(2)}</span>
                        <span className="ml-2 text-[10px] text-white/30">{o.bestOdds.bookmaker}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Prawdopodobieństwa implikowane</p>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {h2hMarket.outcomes.map((o) => (
                    <div key={o.name} className="flex items-center justify-between py-1.5 text-xs text-white/50">
                      <span>{o.name}</span>
                      <span className="font-mono text-amber-400 font-bold">{impliedProbability(o.bestOdds.odds)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[760px] w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider text-white/40">Bukmacher</th>
                    {h2hMarket.outcomes.map((o) => (
                      <th key={o.name} className="p-4 text-center font-semibold text-xs uppercase tracking-wider text-white/40">
                        {o.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookmakerRows.map(([name, row]) => (
                    <tr key={name} className="border-b border-white/5 transition-colors hover:bg-white/[0.02] last:border-0">
                      <td className="p-4">
                        <BookmakerLink
                          name={name}
                          url={row.url}
                          bookmakerKey={row.bookmakerKey}
                          className="text-white font-medium text-sm"
                        />
                      </td>
                      {h2hMarket.outcomes.map((o) => {
                        const isMax = o.bestOdds.bookmaker === name;
                        const oddVal = row.odds[o.name];
                        return (
                          <td key={o.name} className="p-4 text-center">
                            {oddVal ? (
                              <span
                                className={`font-mono text-sm ${
                                  isMax ? "font-bold text-emerald-400" : "text-white/60"
                                }`}
                              >
                                {oddVal.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-white/30">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  <tr className="border-t border-emerald-500/20 bg-emerald-500/[0.02]">
                    <td className="p-4">
                      <span className="font-bold text-emerald-400 text-sm">Najlepszy kurs</span>
                    </td>
                    {h2hMarket.outcomes.map((o) => (
                      <td key={o.name} className="p-4 text-center">
                        <div>
                          <span className="font-mono text-sm font-bold text-emerald-400">
                            {o.bestOdds.odds.toFixed(2)}
                          </span>
                          <p className="mt-0.5 text-[10px] text-white/30">
                            {o.bestOdds.bookmaker}
                          </p>
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-white/[0.01]">
                    <td className="p-4">
                      <span className="font-medium text-white/40 text-xs uppercase tracking-wider">Prawd. implikowane</span>
                    </td>
                    {h2hMarket.outcomes.map((o) => (
                      <td key={o.name} className="p-4 text-center">
                        <span className="font-mono text-xs text-amber-400 font-semibold">
                          {impliedProbability(o.bestOdds.odds)}%
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/events"
          className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:text-white"
        >
          &larr; Wszystkie wydarzenia
        </Link>
        <Link
          href="/arbitrage"
          className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:text-white"
        >
          Okazje arbitrażowe &rarr;
        </Link>
      </div>
    </div>
  );
}
