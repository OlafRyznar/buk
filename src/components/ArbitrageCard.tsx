"use client";

import { useState } from "react";
import { ArbitrageOpportunity } from "@/lib/types";
import { profitCategory, recomputeStakesWithTax, DEFAULT_TAX_FREE_KEYS } from "@/lib/arbitrage";
import { ALL_BOOKMAKERS, TAX_FREE_BOOKMAKER_KEYS } from "@/lib/store-types";
import { useApp } from "@/components/AppProvider";
import { RedirectWarningModal } from "./RedirectWarningModal";
import TeamFlag from "./TeamFlag";
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
  const { settings } = useApp();

  const recomputed = recomputeStakesWithTax(
    opportunity.bets,
    opportunity.stake,
    settings.taxRate,
    DEFAULT_TAX_FREE_KEYS
  );

  const category = profitCategory(recomputed.profit);

  const taxFreeBets = opportunity.bets.filter((bet) =>
    TAX_FREE_BOOKMAKER_KEYS.includes(bet.bookmakerKey?.toLowerCase().replace(/\s+/g, "") ?? "")
  );
  const taxCaption =
    settings.taxRate === 0
      ? "Bez podatku od wygranych (stawka w Ustawieniach: 0%)."
      : taxFreeBets.length === opportunity.bets.length
        ? "Wszystkie kursy u bukmacherów bez podatku od wygranych."
        : taxFreeBets.length === 0
          ? `Uwzględniono ${settings.taxRate}% podatku od wygranych.`
          : `Uwzględniono ${settings.taxRate}% podatku od wygranych (poza ${taxFreeBets
              .map((bet) => bet.bookmaker)
              .join(", ")} — bez podatku).`;

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
          <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-semibold text-white">
            <TeamFlag team={opportunity.event.homeTeam} />
            {opportunity.event.homeTeam}
            <span className="text-white/40">vs</span>
            <TeamFlag team={opportunity.event.awayTeam} />
            {opportunity.event.awayTeam}
          </h3>
          <p className="mt-1 text-xs text-white/58">
            {new Date(opportunity.event.commenceTime).toLocaleString("pl-PL", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="w-full text-left sm:w-auto sm:text-right">
          <p className={`text-2xl font-bold ${recomputed.isArbitrage ? profitColors[category] : "text-rose-300"}`}>
            {recomputed.isArbitrage ? `+${recomputed.profit}%` : "—"}
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-white/48">
            {recomputed.isArbitrage ? "gwarantowany zysk (po podatku)" : "po podatku: brak zysku"}
          </p>
          <p className="mt-1 max-w-[220px] text-[10px] leading-4 text-white/35 sm:ml-auto">
            {taxCaption}
          </p>
        </div>
      </div>

      {!recomputed.isArbitrage && (
        <div className="mb-4 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-xs leading-5 text-rose-200">
          Po {settings.taxRate}% podatku suma 1/kurs (netto) wynosi{" "}
          {(recomputed.totalImpliedProbability * 100).toFixed(2)}% — ten układ przestał być
          surebetem. Stawki poniżej wyrównują zwrot, ale bez gwarantowanego zysku.
        </div>
      )}

      {/* Bets on mobile - Compact Apple-style list rows */}
      <div className="space-y-1.5 md:hidden">
        {recomputed.bets.map((bet, idx) => {
          const bmInfo = ALL_BOOKMAKERS.find(
            (b) =>
              b.key === bet.bookmakerKey?.toLowerCase().replace(/\s+/g, "") ||
              b.name.toLowerCase() === bet.bookmaker.toLowerCase()
          );

          return (
            <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.03] last:border-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-white">{bet.outcome}</span>
                  <span className="text-[10px] text-white/40">{bet.bookmaker}</span>
                </div>
                <div className="mt-0.5 text-xs text-white/50">
                  Stawka: <span className="font-mono text-white/70 font-medium">{bet.stake.toFixed(0)} zł</span> · Wygrana: <span className="font-mono text-emerald-400 font-medium">{bet.potentialReturn.toFixed(0)} zł</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-amber-300 font-bold text-xs bg-white/[0.04] px-2 py-1 rounded">@{bet.odds.toFixed(2)}</span>
                <button
                  onClick={() =>
                    setRedirectModal({
                      bookmakerName: bet.bookmaker,
                      url: bmInfo?.url ?? "#",
                    })
                  }
                  className="rounded-lg bg-white/5 border border-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  Obstaw
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bets table on larger screens */}
      <div className="hidden overflow-x-auto md:block mt-4">
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
            {recomputed.bets.map((bet, idx) => {
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
                      className="whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
                    >
                      Obstaw
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-white/40">
            Stawka:{" "}
            <span className="text-white font-mono font-medium">
              {opportunity.stake.toFixed(2)} zł
            </span>
          </span>
          <span className="text-white/40">
            Zwrot:{" "}
            <span className="font-mono font-bold text-emerald-400">
              {recomputed.guaranteedReturn.toFixed(2)} zł
            </span>
          </span>
          <span className="text-white/40">
            Zysk:{" "}
            <span
              className={`font-mono font-bold ${
                recomputed.isArbitrage ? profitColors[category] : "text-rose-300"
              }`}
            >
              {(recomputed.guaranteedReturn - opportunity.stake).toFixed(2)} zł
            </span>
          </span>
        </div>
        {!showDetails && (
          <Link
            href={`/events/${opportunity.event.id}`}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
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
