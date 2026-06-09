import { getEventById, getAllEvents } from "@/lib/data-service";
import { findArbitrageForEvent, impliedProbability } from "@/lib/arbitrage";
import { BOOKMAKER_LOGOS } from "@/lib/types";
import ArbitrageCard from "@/components/ArbitrageCard";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((e) => ({ id: e.id }));
}

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
  const bookmakerRows = h2hMarket
    ? (() => {
        const bookmakers = new Map<string, Record<string, number>>();
        for (const outcome of h2hMarket.outcomes) {
          for (const bm of outcome.bookmakers) {
            if (!bookmakers.has(bm.bookmaker)) {
              bookmakers.set(bm.bookmaker, {});
            }
            bookmakers.get(bm.bookmaker)![outcome.name] = bm.odds;
          }
        }

        return Array.from(bookmakers.entries());
      })()
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
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
            <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
              {event.sportTitle}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              {event.homeTeam} <span className="text-white/42">vs</span> {event.awayTeam}
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
          <div className="glass-panel overflow-hidden rounded-3xl border border-white/12">
            <div className="space-y-3 p-4 md:hidden">
              {bookmakerRows.map(([name, odds]) => (
                <div key={name} className="rounded-xl border border-white/12 bg-black/20 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span>{BOOKMAKER_LOGOS[name.toLowerCase().replace(/\s/g, '')] || '📊'}</span>
                    <span className="text-sm font-medium text-white">{name}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {h2hMarket.outcomes.map((o) => {
                      const oddVal = odds[o.name];
                      const isMax = o.bestOdds.bookmaker === name;
                      return (
                        <div key={o.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/4 px-3 py-2">
                          <span className="text-xs text-white/64">{o.name}</span>
                          {oddVal ? (
                            <span className={`font-mono text-sm ${isMax ? 'font-semibold text-emerald-300' : 'text-white/84'}`}>
                              {oddVal.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-xs text-white/35">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/6 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Najlepsze kursy</p>
                <div className="mt-2 space-y-2">
                  {h2hMarket.outcomes.map((o) => (
                    <div key={o.name} className="flex items-center justify-between rounded-lg border border-white/12 bg-white/4 px-3 py-2">
                      <span className="text-xs text-white/70">{o.name}</span>
                      <span className="text-right">
                        <span className="font-mono text-sm font-semibold text-emerald-300">{o.bestOdds.odds.toFixed(2)}</span>
                        <span className="ml-2 text-[11px] text-white/52">{o.bestOdds.bookmaker}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-amber-400/20 bg-amber-500/6 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-200/85">Prawdopodobieństwa implikowane</p>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {h2hMarket.outcomes.map((o) => (
                    <div key={o.name} className="flex items-center justify-between rounded-lg border border-white/12 bg-white/4 px-3 py-2">
                      <span className="text-xs text-white/70">{o.name}</span>
                      <span className="font-mono text-sm text-amber-300">{impliedProbability(o.bestOdds.odds)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[760px] w-full">
                <thead>
                  <tr className="border-b border-white/12 bg-black/20">
                    <th className="p-4 text-left font-medium text-white/55">Bukmacher</th>
                    {h2hMarket.outcomes.map((o) => (
                      <th key={o.name} className="p-4 text-center font-medium text-white/55">
                        {o.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookmakerRows.map(([name, odds]) => (
                    <tr key={name} className="border-b border-white/8 transition-colors hover:bg-white/6 last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{BOOKMAKER_LOGOS[name.toLowerCase().replace(/\s/g, '')] || '📊'}</span>
                          <span className="text-white font-medium">{name}</span>
                        </div>
                      </td>
                      {h2hMarket.outcomes.map((o) => {
                        const isMax = o.bestOdds.bookmaker === name;
                        const oddVal = odds[o.name];
                        return (
                          <td key={o.name} className="p-4 text-center">
                            {oddVal ? (
                              <span
                                className={`font-mono text-lg ${
                                  isMax ? "font-bold text-emerald-300" : "text-white/70"
                                }`}
                              >
                                {oddVal.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-white/35">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  <tr className="border-t-2 border-emerald-500/30 bg-emerald-500/5">
                    <td className="p-4">
                      <span className="font-bold text-emerald-300">Najlepszy kurs</span>
                    </td>
                    {h2hMarket.outcomes.map((o) => (
                      <td key={o.name} className="p-4 text-center">
                        <div>
                          <span className="font-mono text-lg font-bold text-emerald-300">
                            {o.bestOdds.odds.toFixed(2)}
                          </span>
                          <p className="mt-1 text-xs text-white/48">
                            {o.bestOdds.bookmaker}
                          </p>
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-black/25">
                    <td className="p-4">
                      <span className="font-medium text-white/72">Prawd. implikowane</span>
                    </td>
                    {h2hMarket.outcomes.map((o) => (
                      <td key={o.name} className="p-4 text-center">
                        <span className="font-mono text-amber-400">
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
          className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm text-white/80 transition-colors hover:text-white"
        >
          &larr; Wszystkie wydarzenia
        </Link>
        <Link
          href="/arbitrage"
          className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm text-white/80 transition-colors hover:text-white"
        >
          Okazje arbitrażowe &rarr;
        </Link>
      </div>
    </div>
  );
}
