"use client";

import { useState } from "react";
import { EventWithOdds } from "@/lib/types";
import { impliedProbability } from "@/lib/arbitrage";
import { ALL_BOOKMAKERS } from "@/lib/store-types";
import { RedirectWarningModal } from "./RedirectWarningModal";
import BookmakerIcon from "./BookmakerIcon";
import TeamFlag from "./TeamFlag";
import WatchlistButton from "./WatchlistButton";
import Link from "next/link";

interface EventCardProps {
  event: EventWithOdds;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const h2hMarket = event.markets.find((m) => m.marketKey === "h2h");
  const [redirectModal, setRedirectModal] = useState<{ bookmakerName: string; url: string } | null>(null);
  const started = new Date(event.commenceTime).getTime() <= Date.now();

  return (
    <div className="glass-panel card-hover animate-slide-up rounded-xl p-4 sm:p-5">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/56">
          {event.sportTitle}
        </span>
        <div className="flex items-center gap-2">
          {started ? (
            <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-2.5 py-1 text-xs font-medium text-rose-300">
              Mecz już się rozpoczął
            </span>
          ) : (
            <span className="text-xs text-white/55">
              {new Date(event.commenceTime).toLocaleString("pl-PL", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          )}
          <WatchlistButton eventId={event.id} />
        </div>
      </div>

      {/* Teams */}
      <h3 className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold text-white sm:text-lg">
        <TeamFlag team={event.homeTeam} />
        {event.homeTeam}
        <span className="text-white/42">vs</span>
        <TeamFlag team={event.awayTeam} />
        {event.awayTeam}
      </h3>

      {/* Odds comparison */}
      {h2hMarket && (
        <div className="space-y-3">
          {h2hMarket.outcomes.map((outcome) => {
            const shown = outcome.bookmakers.slice(0, compact ? 3 : undefined);
            const [best, ...rest] = shown;
            const bestInfo = ALL_BOOKMAKERS.find(
              (b) =>
                b.key === best?.bookmakerKey?.toLowerCase().replace(/\s+/g, "") ||
                b.name.toLowerCase() === best?.bookmaker.toLowerCase()
            );
            return (
              <div key={outcome.name} className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{outcome.name}</span>
                  <span className="text-[11px] text-white/40">
                    P: {impliedProbability(outcome.bestOdds.odds)}%
                  </span>
                </div>

                {best && (
                  <button
                    onClick={() =>
                      setRedirectModal({
                        bookmakerName: best.bookmaker,
                        url: best.eventUrl ?? bestInfo?.url ?? "#",
                      })
                    }
                    className="mt-2 flex w-full items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-left transition hover:bg-emerald-500/20 active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                      <BookmakerIcon bookmakerKey={best.bookmakerKey} size={18} />
                      {best.bookmaker}
                      <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-300">
                        najlepszy
                      </span>
                    </span>
                    <span className="font-mono text-base font-bold text-emerald-300">
                      {best.odds.toFixed(2)}
                    </span>
                  </button>
                )}

                {rest.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {rest.map((bm, idx) => {
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
                              url: bm.eventUrl ?? bmInfo?.url ?? "#",
                            })
                          }
                          className="flex items-center gap-1.5 rounded-md border border-white/12 bg-transparent px-2.5 py-1.5 text-xs text-white/70 transition hover:bg-white/5"
                        >
                          <BookmakerIcon bookmakerKey={bm.bookmakerKey} size={14} />
                          {bm.bookmaker}
                          <span className="font-mono font-semibold text-white/85">{bm.odds.toFixed(2)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
