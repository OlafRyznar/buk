import Link from "next/link";
import { NearArbitrageOpportunity } from "@/lib/types";

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

export default function PotentialArbitrageCard({
  opportunity,
}: PotentialArbitrageCardProps) {
  const tone = getWatchTone(opportunity.requiredOddsChangePercent);

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
            <h3 className="text-lg font-semibold text-white sm:text-xl">
              {opportunity.event.homeTeam} <span className="text-white/38">vs</span>{" "}
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

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-white/12 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/44">Sygnał</p>
          <p className="mt-3 text-sm leading-6 text-white/78">
            Event nie jest jeszcze surebetem. Jeśli kurs na wynik{" "}
            <span className="font-semibold text-white">{opportunity.targetOutcome}</span> u{" "}
            <span className="font-semibold text-white">{opportunity.bookmaker}</span> wzrośnie z{" "}
            <span className="font-mono text-white">{opportunity.currentOdds.toFixed(2)}</span> do{" "}
            <span className="font-mono text-white">{opportunity.targetOdds.toFixed(2)}</span>, układ
            przejdzie pod próg surebeta.
          </p>

          <div className="mt-4 space-y-2 sm:hidden">
            {opportunity.outcomes.map((outcome) => (
              <div
                key={`${opportunity.id}-${outcome.outcome}`}
                className="flex items-center justify-between rounded-lg border border-white/12 bg-black/20 px-3 py-2 text-xs text-white/76"
              >
                <span className="font-medium text-white">{outcome.outcome}</span>
                <span className="text-white/72">{outcome.bookmaker}</span>
                <span className="font-mono text-white">{outcome.odds.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
            {opportunity.outcomes.map((outcome) => (
              <div
                key={`${opportunity.id}-${outcome.outcome}`}
                className="rounded-full border border-white/12 bg-black/20 px-3 py-2 text-xs text-white/76"
              >
                <span className="font-medium text-white">{outcome.outcome}</span>
                <span className="mx-2 text-white/25">•</span>
                <span>{outcome.bookmaker}</span>
                <span className="mx-2 text-white/25">•</span>
                <span className="font-mono text-white">{outcome.odds.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/12 bg-black/18 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/44">Jak blisko</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-white/56">Nad progiem</p>
              <p className="text-2xl font-semibold text-white">
                {opportunity.distanceFromArbitrage.toFixed(2)} pp
              </p>
            </div>
            <div>
              <p className="text-sm text-white/56">Suma implied probability</p>
              <p className="text-xl font-mono text-white/90">
                {(opportunity.totalImpliedProbability * 100).toFixed(2)}%
              </p>
            </div>
            <Link
              href={`/events/${opportunity.event.id}`}
              className="inline-flex w-full justify-center rounded-md border border-white/18 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/16 sm:w-auto"
            >
              Zobacz pełny market
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}