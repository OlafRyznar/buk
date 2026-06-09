"use client";

import { useState } from "react";
import { ArbitrageOpportunity } from "@/lib/types";
import { profitCategory } from "@/lib/arbitrage";
import { ALL_BOOKMAKERS } from "@/lib/store-types";
import { RedirectWarningModal } from "./RedirectWarningModal";
import Link from "next/link";

interface ArbitrageCardProps {
  opportunity: ArbitrageOpportunity;
  showDetails?: boolean;
}

export default function ArbitrageCard({
  opportunity,
  showDetails = false,
}: ArbitrageCardProps) {
  const [redirectModal, setRedirectModal] = useState<{ bookmakerName: string; url: string } | null>(null);

  const category = profitCategory(opportunity.profit);

  const categoryColors = {
    high: "border-white/14 bg-white/5",
    medium: "border-white/14 bg-white/5",
    low: "border-white/14 bg-white/5",
  };

  const profitColors = {
    high: "text-emerald-50",
    medium: "text-sky-100",
    low: "text-amber-100",
  };

  const badgeColors = {
    high: "bg-white/8 text-white border border-white/14",
    medium: "bg-white/8 text-white border border-white/14",
    low: "bg-white/8 text-white border border-white/14",
  };

  return (
    <div
      className={`glass-panel rounded-xl border ${categoryColors[category]} p-5 card-hover animate-slide-up`}
    >
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-[0.2em] text-white/52">
              {opportunity.event.sportTitle}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs ${badgeColors[category]}`}>
              {category === "high" ? "Wysoki" : category === "medium" ? "Średni" : "Niski"}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">
            {opportunity.event.homeTeam} vs {opportunity.event.awayTeam}
          </h3>
          <p className="mt-1 text-xs text-white/58">
            {new Date(opportunity.event.commenceTime).toLocaleString("pl-PL", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="w-full text-left sm:w-auto sm:text-right">
          <p className={`text-2xl font-bold ${profitColors[category]}`}>
            +{opportunity.profit}%
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-white/48">gwarantowany zysk</p>
        </div>
      </div>

      {/* Bets on mobile */}
      <div className="space-y-2 md:hidden">
        {opportunity.bets.map((bet, idx) => {
          const bmInfo = ALL_BOOKMAKERS.find(
            (b) =>
              b.key === bet.bookmakerKey?.toLowerCase().replace(/\s+/g, "") ||
              b.name.toLowerCase() === bet.bookmaker.toLowerCase()
          );

          return (
            <div key={idx} className="rounded-lg border border-white/12 bg-black/18 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{bet.outcome}</p>
                  <p className="mt-0.5 text-xs text-white/58">{bet.bookmaker}</p>
                </div>
                <p className="text-right text-xs text-white/54">Kurs: <span className="font-mono text-amber-200">{bet.odds.toFixed(2)}</span></p>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 rounded-md border border-white/10 bg-white/4 p-2">
                <div>
                  <p className="text-[11px] text-white/44">Stawka</p>
                  <p className="text-sm font-mono text-white">{bet.stake.toFixed(2)} zł</p>
                </div>
                <div>
                  <p className="text-[11px] text-white/44">Wygrana</p>
                  <p className="text-sm font-mono text-emerald-100">{bet.potentialReturn.toFixed(2)} zł</p>
                </div>
              </div>

              <button
                onClick={() =>
                  setRedirectModal({
                    bookmakerName: bet.bookmaker,
                    url: bmInfo?.url ?? "#",
                  })
                }
                className="mt-3 w-full rounded-md border border-white/18 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/16"
              >
                Obstaw ten wynik
              </button>
            </div>
          );
        })}
      </div>

      {/* Bets table on larger screens */}
      <div className="hidden overflow-x-auto rounded-lg border border-white/12 bg-black/18 md:block">
        <table className="min-w-[720px] w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-3 text-left font-medium text-white/50">Wynik</th>
              <th className="p-3 text-left font-medium text-white/50">Bukmacher</th>
              <th className="p-3 text-right font-medium text-white/50">Kurs</th>
              <th className="p-3 text-right font-medium text-white/50">Stawka</th>
              <th className="p-3 text-right font-medium text-white/50">Wygrana</th>
              <th className="p-3 text-right font-medium text-white/50"></th>
            </tr>
          </thead>
          <tbody>
            {opportunity.bets.map((bet, idx) => {
              const bmInfo = ALL_BOOKMAKERS.find(
                (b) =>
                  b.key === bet.bookmakerKey?.toLowerCase().replace(/\s+/g, "") ||
                  b.name.toLowerCase() === bet.bookmaker.toLowerCase()
              );
              return (
                <tr key={idx} className="border-b border-white/6 last:border-0">
                  <td className="p-3 text-white font-medium">{bet.outcome}</td>
                  <td className="p-3 text-white/75">{bet.bookmaker}</td>
                  <td className="p-3 text-right font-mono text-amber-200">
                    {bet.odds.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono text-white">
                    {bet.stake.toFixed(2)} zł
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-100">
                    {bet.potentialReturn.toFixed(2)} zł
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() =>
                        setRedirectModal({
                          bookmakerName: bet.bookmaker,
                          url: bmInfo?.url ?? "#",
                        })
                      }
                      className="whitespace-nowrap rounded-md border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/16"
                    >
                      Obstaw →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/12 pt-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-white/62">
            Stawka:{" "}
            <span className="text-white font-mono">
              {opportunity.stake.toFixed(2)} zł
            </span>
          </span>
          <span className="text-white/62">
            Zwrot:{" "}
            <span className="font-mono font-bold text-emerald-50">
              {opportunity.guaranteedReturn.toFixed(2)} zł
            </span>
          </span>
          <span className="text-white/62">
            Zysk:{" "}
            <span className={`font-mono font-bold ${profitColors[category]}`}>
              {(opportunity.guaranteedReturn - opportunity.stake).toFixed(2)} zł
            </span>
          </span>
        </div>
        {!showDetails && (
          <Link
            href={`/events/${opportunity.event.id}`}
            className="rounded-md border border-white/18 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/16"
          >
            Szczegóły
          </Link>
        )}
      </div>

      {/* Redirect modal */}
      {redirectModal && (
        <RedirectWarningModal
          isOpen={true}
          onClose={() => setRedirectModal(null)}
          bookmakerName={redirectModal.bookmakerName}
          url={redirectModal.url}
        />
      )}
    </div>
  );
}
