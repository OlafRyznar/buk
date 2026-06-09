"use client";

import { useState } from "react";
import { ArbitrageOpportunity, NearArbitrageOpportunity } from "@/lib/types";
import { useApp } from "@/components/AppProvider";
import ArbitrageCard from "@/components/ArbitrageCard";
import PotentialArbitrageCard from "@/components/PotentialArbitrageCard";

interface Props {
  arbitrages: ArbitrageOpportunity[];
  nearArbitrages: NearArbitrageOpportunity[];
}

export default function ArbitrageFilteredList({ arbitrages, nearArbitrages }: Props) {
  const { settings } = useApp();
  const [filterBySelected, setFilterBySelected] = useState(false);
  const [minProfit, setMinProfit] = useState(0);

  const selectedBms = settings.selectedBookmakers;

  const filtered = arbitrages.filter((arb) => {
    if (minProfit > 0 && arb.profit < minProfit) return false;
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
      <div className="glass-panel rounded-[24px] p-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <span className="shrink-0 self-center text-sm font-medium text-white/55">Filtry:</span>

          <button
            onClick={() => setFilterBySelected(!filterBySelected)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition ${
              filterBySelected
                ? "border-sky-300/25 bg-sky-300/12 text-sky-100"
                : "border-white/12 bg-white/6 text-white/55 hover:text-white"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${filterBySelected ? "bg-sky-400" : "bg-white/25"}`}
            />
            Tylko moi bukmacherzy ({selectedBms.length})
          </button>

          {[0, 0.5, 1, 2, 3].map((p) => (
            <button
              key={p}
              onClick={() => setMinProfit(p)}
              className={`shrink-0 rounded-2xl border px-3 py-2 text-xs transition ${
                minProfit === p
                  ? "border-emerald-300/25 bg-emerald-300/12 text-emerald-100"
                  : "border-white/12 bg-white/6 text-white/50 hover:text-white"
              }`}
            >
              {p === 0 ? "Wszystkie zyski" : `≥ ${p}%`}
            </button>
          ))}
        </div>

        {(filterBySelected || minProfit > 0) && (
          <button
            onClick={() => { setFilterBySelected(false); setMinProfit(0); }}
            className="mt-3 w-full rounded-2xl border border-white/12 bg-white/6 px-3 py-2 text-xs text-white/50 transition hover:text-white sm:w-auto"
          >
            Wyczyść filtry
          </button>
        )}
      </div>

      {/* Near-arbitrage radar */}
      {filteredNear.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Radar rynku</h2>
              <p className="mt-1 text-sm text-white/52">
                Rynki bliskie progu arbitrażu — obserwuj zmiany kursów.
              </p>
            </div>
            <span className="rounded-full border border-sky-200/15 bg-sky-300/10 px-3 py-1 text-xs text-sky-100 sm:self-auto">
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
          {filtered.map((arb) => (
            <ArbitrageCard key={arb.id} opportunity={arb} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-[30px] p-8 text-center sm:p-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {filterBySelected || minProfit > 0
              ? "Brak okazji pasujących do filtrów"
              : "Brak okazji arbitrażowych"}
          </h3>
          <p className="mx-auto max-w-md text-white/58">
            {filterBySelected
              ? "Zmień wybór bukmacherów w Ustawieniach lub wyłącz filtr."
              : "System monitoruje kursy — sprawdź ponownie za chwilę."}
          </p>
        </div>
      )}

      {/* Summary strip */}
      {filtered.length > 0 && (
        <div className="glass-panel rounded-[30px] p-6">
          <h2 className="text-lg font-bold text-white mb-4">Podsumowanie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-white/42">Znaleziono</p>
              <p className="text-2xl font-bold text-white">{filtered.length}</p>
            </div>
            <div>
              <p className="text-sm text-white/42">Najlepszy zysk</p>
              <p className="text-2xl font-bold text-emerald-100">
                +{filtered[0].profit}%
              </p>
            </div>
            <div>
              <p className="text-sm text-white/42">Średni zysk</p>
              <p className="text-2xl font-bold text-sky-100">
                +
                {(
                  filtered.reduce((s, a) => s + a.profit, 0) / filtered.length
                ).toFixed(2)}
                %
              </p>
            </div>
            <div>
              <p className="text-sm text-white/42">Sporty</p>
              <p className="text-2xl font-bold text-amber-100">
                {new Set(filtered.map((a) => a.event.sportKey)).size}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
