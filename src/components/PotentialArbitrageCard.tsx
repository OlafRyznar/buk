"use client";

import Link from "next/link";
import { NearArbitrageOpportunity } from "@/lib/types";
import { effectiveOdds, DEFAULT_TAX_FREE_KEYS } from "@/lib/arbitrage";
import { TAX_FREE_BOOKMAKER_KEYS } from "@/lib/store-types";
import { useApp } from "@/components/AppProvider";
import TeamFlag from "./TeamFlag";

interface PotentialArbitrageCardProps {
  opportunity: NearArbitrageOpportunity;
}

const marketLabels: Record<string, string> = {
  h2h: "1X2 / Moneyline",
  spreads: "Handicap",
  totals: "Totale",
};

function getWatchTone(requiredOddsChangePercent: number) {
  if (requiredOddsChangePercent <= 2) {
    return {
      badge: "Prawie live",
      badgeClass: "bg-white/8 text-white border border-white/14",
      accentClass: "text-emerald-100",
    };
  }

  if (requiredOddsChangePercent <= 5) {
    return {
      badge: "Na radarze",
      badgeClass: "bg-white/8 text-white border border-white/14",
      accentClass: "text-sky-100",
    };
  }

  return {
    badge: "Do obserwacji",
    badgeClass: "bg-white/8 text-white border border-white/14",
    accentClass: "text-amber-100",
  };
}

const BASE_STAKE = 1000;

export default function PotentialArbitrageCard({
  opportunity,
}: PotentialArbitrageCardProps) {
  const { settings } = useApp();
  const tone = getWatchTone(opportunity.requiredOddsChangePercent);

  // Stake split for the moment the watched odds reach the surebet threshold:
  // the target outcome is priced at targetOdds, the rest stays as quoted now.
  // Odds are converted to net (after-tax) values per the user's tax settings.
  const scenario = opportunity.outcomes.map((o) => {
    const isTarget =
      o.outcome === opportunity.targetOutcome && o.bookmaker === opportunity.bookmaker;
    const grossOdds = isTarget ? opportunity.targetOdds : o.odds;
    const netOdds = effectiveOdds(grossOdds, o.bookmakerKey, settings.taxRate, DEFAULT_TAX_FREE_KEYS);
    return { ...o, odds: netOdds, isTarget };
  });
  const invSum = scenario.reduce((sum, o) => sum + 1 / o.odds, 0);
  const stakes = scenario.map((o) => ({
    ...o,
    stake: (BASE_STAKE * (1 / o.odds)) / invSum,
    share: ((1 / o.odds) / invSum) * 100,
  }));
  const payout = BASE_STAKE / invSum;

  const taxFreeOutcomes = opportunity.outcomes.filter((o) =>
    TAX_FREE_BOOKMAKER_KEYS.includes(o.bookmakerKey?.toLowerCase().replace(/\s+/g, "") ?? "")
  );
  const taxCaption =
    settings.taxRate === 0
      ? "Bez podatku od wygranych (stawka w Ustawieniach: 0%)."
      : taxFreeOutcomes.length === opportunity.outcomes.length
        ? "Wszystkie kursy u bukmacherów bez podatku od wygranych."
        : `Kursy i podział stawki uwzględniają ${settings.taxRate}% podatku od wygranych${
            taxFreeOutcomes.length > 0
              ? ` (poza ${taxFreeOutcomes.map((o) => o.bookmaker).join(", ")} — bez podatku)`
              : ""
          }.`;

  return (
    <div className="glass-panel card-hover animate-slide-up rounded-xl p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/52">
            <span>{opportunity.event.sportTitle}</span>
            <span className="h-1 w-1 rounded-full bg-white/25" />
            <span>{marketLabels[opportunity.marketKey] || opportunity.marketKey}</span>
          </div>
          <div>
            <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-semibold text-white sm:text-xl">
              <TeamFlag team={opportunity.event.homeTeam} />
              {opportunity.event.homeTeam}
              <span className="text-white/38">vs</span>
              <TeamFlag team={opportunity.event.awayTeam} />
              {opportunity.event.awayTeam}
            </h3>
            <p className="mt-2 text-sm text-white/65">
              Start{" "}
              {new Date(opportunity.event.commenceTime).toLocaleString("pl-PL", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone.badgeClass}`}>
            {tone.badge}
          </span>
          <div className="text-left sm:text-right">
            <p className={`text-2xl font-semibold sm:text-3xl ${tone.accentClass}`}>
              +{opportunity.requiredOddsChangePercent}%
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-white/38">
              ruch kursu do surebeta
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] pt-2">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Sygnał</p>
            <p className="mt-2 text-xs leading-5 text-white/60">
              Event nie jest jeszcze surebetem. Jeśli kurs na wynik{" "}
              <span className="font-semibold text-white">{opportunity.targetOutcome}</span> u{" "}
              <span className="font-semibold text-white">{opportunity.bookmaker}</span> wzrośnie z{" "}
              <span className="font-mono font-medium text-white">{opportunity.currentOdds.toFixed(2)}</span> do{" "}
              <span className="font-mono font-bold text-sky-400">{opportunity.targetOdds.toFixed(2)}</span>, układ
              przejdzie pod próg surebeta.
            </p>
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
              Podział stawki przy {BASE_STAKE.toLocaleString("pl-PL")} zł
              <span className="ml-1.5 normal-case font-medium tracking-normal text-white/25">
                (gdy kurs dojdzie do progu)
              </span>
            </p>
            <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
              {stakes.map((outcome) => (
                <div
                  key={`${opportunity.id}-${outcome.outcome}-${outcome.bookmaker}`}
                  className={`flex items-center justify-between gap-2 border-b border-white/8 px-3 py-2 text-xs last:border-0 ${
                    outcome.isTarget ? "bg-sky-400/[0.07]" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium text-white">{outcome.outcome}</span>
                    <span className="hidden truncate text-white/40 sm:inline">
                      {outcome.bookmaker}
                    </span>
                    <span
                      className={`font-mono ${
                        outcome.isTarget ? "font-bold text-sky-300" : "text-white/70"
                      }`}
                    >
                      {outcome.isTarget && <span className="mr-0.5">↑</span>}
                      {outcome.odds.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-2">
                    <span className="font-mono text-sm font-bold text-white tabular-nums">
                      {Math.round(outcome.stake).toLocaleString("pl-PL")} zł
                    </span>
                    <span className="font-mono text-[10px] text-white/35 tabular-nums">
                      {outcome.share.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-white/40">
              Zwrot z każdego wyniku ≈{" "}
              <span className="font-mono font-semibold text-white/70">
                {Math.round(payout).toLocaleString("pl-PL")} zł
              </span>
              {" "}— stawki skalują się proporcjonalnie do budżetu.
            </p>
            <p className="mt-1 text-[11px] text-white/30">{taxCaption}</p>
          </div>
        </div>

        <div className="space-y-4 lg:pl-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Jak blisko</p>
          <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-col lg:space-y-4 lg:gap-0">
            <div>
              <p className="text-xs text-white/40">Nad progiem</p>
              <p className="text-xl font-bold font-mono text-white mt-0.5">
                {opportunity.distanceFromArbitrage.toFixed(2)} pp
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40">Implied probability</p>
              <p className="text-xl font-bold font-mono text-white/80 mt-0.5">
                {(opportunity.totalImpliedProbability * 100).toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="pt-2">
            <Link
              href={`/events/${opportunity.event.id}`}
              className="inline-flex w-full justify-center rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.08] sm:w-auto"
            >
              Zobacz pełny market
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}