"use client";

import { useState } from "react";
import { ArbitrageOpportunity, NearArbitrageOpportunity, EventWithOdds } from "@/lib/types";
import { useApp } from "@/components/AppProvider";
import { recomputeStakesWithTax, DEFAULT_TAX_FREE_KEYS } from "@/lib/arbitrage";
import ArbitrageCard from "@/components/ArbitrageCard";
import PotentialArbitrageCard from "@/components/PotentialArbitrageCard";
import WatchlistSection from "@/components/WatchlistSection";

interface Props {
  arbitrages: ArbitrageOpportunity[];
  nearArbitrages: NearArbitrageOpportunity[];
  events: EventWithOdds[];
}

export default function ArbitrageFilteredList({ arbitrages, nearArbitrages, events }: Props) {
  const { settings } = useApp();
  const [filterBySelected, setFilterBySelected] = useState(false);
  const [minProfit, setMinProfit] = useState(0);

  const selectedBms = settings.selectedBookmakers;

  // Recompute net (after-tax) profit per the user's tax settings, and drop
  // anything that's no longer a surebet once tax is taken into account.
  const taxAdjusted = arbitrages
    .map((arb) => ({
      arb,
      recomputed: recomputeStakesWithTax(arb.bets, arb.stake, settings.taxRate, DEFAULT_TAX_FREE_KEYS),
    }))
    .filter(({ recomputed }) => recomputed.isArbitrage);

  const filtered = taxAdjusted.filter(({ arb, recomputed }) => {
    if (minProfit > 0 && recomputed.profit < minProfit) return false;
    if (filterBySelected && selectedBms.length > 0) {
      const arbBmKeys = arb.bets.map((b) => b.bookmakerKey?.toLowerCase() ?? "");
      return arbBmKeys.every((k) => selectedBms.includes(k));
    }
    return true;
  });

  const filteredNear = nearArbitrages.filter((near) => {
    if (filterBySelected && selectedBms.length > 0) {
      return selectedBms.includes(near.bookmakerKey?.toLowerCase() ?? "");
    }
    return true;
  });

  return (
    <>
      {/* Filter bar */}
      <div className="glass-panel rounded-xl p-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <span className="shrink-0 self-center text-xs font-semibold text-white/40 uppercase tracking-wider mr-2">Filtry:</span>

          <button
            onClick={() => setFilterBySelected(!filterBySelected)}
            className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              filterBySelected
                ? "border-sky-500/20 bg-sky-500/5 text-sky-400"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${filterBySelected ? "bg-sky-400" : "bg-white/20"}`}
            />
            Tylko moi bukmacherzy ({selectedBms.length})
          </button>

          {[0, 0.5, 1, 2, 3].map((p) => (
            <button
              key={p}
              onClick={() => setMinProfit(p)}
              className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                minProfit === p
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
              }`}
            >
              {p === 0 ? "Wszystkie zyski" : `≥ ${p}%`}
            </button>
          ))}
        </div>

        {(filterBySelected || minProfit > 0) && (
          <button
            onClick={() => { setFilterBySelected(false); setMinProfit(0); }}
            className="mt-3 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/50 transition hover:text-white sm:w-auto"
          >
            Wyczyść filtry
          </button>
        )}
      </div>

      {/* Watchlist: manually starred events + near-arbitrage radar */}
      <WatchlistSection events={events} />

      {/* Near-arbitrage radar */}
      {filteredNear.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Radar rynku</h2>
              <p className="mt-1 text-xs text-white/50">
                Rynki bliskie progu arbitrażu — obserwuj zmiany kursów.
              </p>
            </div>
            <span className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-2 py-0.5 text-xs text-sky-400 sm:self-auto font-medium">
              {filteredNear.length} obserwowanych
            </span>
          </div>
          <div className="space-y-4">
            {filteredNear.slice(0, 6).map((opp) => (
              <PotentialArbitrageCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        </section>
      )}

      {/* Arbitrage list */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(({ arb }) => (
            <ArbitrageCard key={arb.id} opportunity={arb} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-xl p-8 text-center sm:p-12">
          <h3 className="text-base font-bold text-white mb-1">
            {filterBySelected || minProfit > 0
              ? "Brak okazji pasujących do filtrów"
              : taxAdjusted.length === 0 && arbitrages.length > 0
                ? "Brak okazji po uwzględnieniu podatku"
                : "Brak okazji arbitrażowych"}
          </h3>
          <p className="mx-auto max-w-md text-xs text-white/50">
            {filterBySelected
              ? "Zmień wybór bukmacherów w Ustawieniach lub wyłącz filtr."
              : taxAdjusted.length === 0 && arbitrages.length > 0
                ? "Przy aktualnej stawce podatku w Ustawieniach żadna okazja nie daje już gwarantowanego zysku."
                : "System monitoruje kursy — sprawdź ponownie za chwilę."}
          </p>
        </div>
      )}

      {/* Summary strip */}
      {filtered.length > 0 && (
        <div className="glass-panel rounded-xl p-6">
          <h2 className="text-base font-bold text-white mb-4">Podsumowanie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-white/42">Znaleziono</p>
              <p className="text-2xl font-bold text-white">{filtered.length}</p>
            </div>
            <div>
              <p className="text-sm text-white/42">Najlepszy zysk</p>
              <p className="text-2xl font-bold text-emerald-100">
                +{filtered[0].recomputed.profit}%
              </p>
            </div>
            <div>
              <p className="text-sm text-white/42">Średni zysk</p>
              <p className="text-2xl font-bold text-sky-100">
                +
                {(
                  filtered.reduce((s, { recomputed }) => s + recomputed.profit, 0) / filtered.length
                ).toFixed(2)}
                %
              </p>
            </div>
            <div>
              <p className="text-sm text-white/42">Sporty</p>
              <p className="text-2xl font-bold text-amber-100">
                {new Set(filtered.map(({ arb }) => arb.event.sportKey)).size}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
