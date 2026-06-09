"use client";

import { useState } from "react";
import { EventWithOdds, BOOKMAKER_LOGOS } from "@/lib/types";
import { impliedProbability } from "@/lib/arbitrage";
import { ALL_BOOKMAKERS } from "@/lib/store-types";
import { RedirectWarningModal } from "./RedirectWarningModal";
import Link from "next/link";

interface EventCardProps {
  event: EventWithOdds;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const h2hMarket = event.markets.find((m) => m.marketKey === "h2h");
  const [redirectModal, setRedirectModal] = useState<{ bookmakerName: string; url: string } | null>(null);

  return (
    <div className="glass-panel card-hover animate-slide-up rounded-xl p-4 sm:p-5">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/56">
          {event.sportTitle}
        </span>
        <span className="text-xs text-white/55">
          {new Date(event.commenceTime).toLocaleString("pl-PL", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      </div>

      {/* Teams */}
      <h3 className="mb-4 text-base font-semibold text-white sm:text-lg">
        {event.homeTeam}{" "}
        <span className="text-white/42">vs</span>{" "}
        {event.awayTeam}
      </h3>

      {/* Odds comparison */}
      {h2hMarket && (
        <div className="space-y-3">
          {h2hMarket.outcomes.map((outcome) => (
            <div key={outcome.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">{outcome.name}</span>
                <span className="text-xs text-white/46">
                  P: {impliedProbability(outcome.bestOdds.odds)}%
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {outcome.bookmakers.slice(0, compact ? 3 : undefined).map((bm, idx) => {
                  const bmInfo = ALL_BOOKMAKERS.find(
                    (b) =>
                      b.key === bm.bookmakerKey?.toLowerCase().replace(/\s+/g, "") ||
                      b.name.toLowerCase() === bm.bookmaker.toLowerCase()
                  );
                  return (
                  <button
                    key={idx}
                    onClick={() =>
                      setRedirectModal({
                        bookmakerName: bm.bookmaker,
                        url: bmInfo?.url ?? "#",
                      })
                    }
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-mono transition hover:opacity-80 active:scale-95 ${
                      idx === 0
                        ? "border border-emerald-300/30 bg-emerald-300/16 text-emerald-50"
                        : "border border-white/12 bg-black/20 text-white/74"
                    }`}
                  >
                    {BOOKMAKER_LOGOS[bm.bookmakerKey] || "📊"}{" "}
                    {bm.bookmaker}: {bm.odds.toFixed(2)}
                  </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link */}
      <div className="mt-4 border-t border-white/12 pt-4">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex w-full justify-center rounded-md border border-white/18 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/16 sm:w-auto"
        >
          Zobacz wszystkie kursy
        </Link>
      </div>

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
