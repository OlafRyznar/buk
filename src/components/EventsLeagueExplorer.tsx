"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EventWithOdds } from "@/lib/types";

interface EventsLeagueExplorerProps {
  events: EventWithOdds[];
}

const PREVIEW_LIMIT = 12;

function formatStart(value: string) {
  return new Date(value).toLocaleString("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function extractOddsLine(event: EventWithOdds) {
  const h2h = event.markets.find((market) => market.marketKey === "h2h");
  if (!h2h) return "Brak kursów 1X2";

  const quick = h2h.outcomes
    .slice(0, 3)
    .map((outcome) => `${outcome.name}: ${outcome.bestOdds.odds.toFixed(2)}`)
    .join("  |  ");

  return quick || "Brak kursów 1X2";
}

export default function EventsLeagueExplorer({ events }: EventsLeagueExplorerProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, EventWithOdds[]>();

    for (const event of events) {
      if (!map.has(event.sportTitle)) {
        map.set(event.sportTitle, []);
      }
      map.get(event.sportTitle)?.push(event);
    }

    const entries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "pl"));

    return entries.map(([sportTitle, sportEvents]) => ({
      sportTitle,
      sportEvents: [...sportEvents].sort(
        (a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime()
      ),
      count: sportEvents.length,
      hasLive: sportTitle.toLowerCase().includes("live"),
      nextStart: sportEvents[0]?.commenceTime,
    }));
  }, [events]);

  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const filteredEvents = useMemo(() => {
    if (selectedSport === "all") {
      return [...events].sort(
        (a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime()
      );
    }

    return (
      grouped.find((group) => group.sportTitle === selectedSport)?.sportEvents ?? []
    );
  }, [events, grouped, selectedSport]);

  const visibleEvents = showAll ? filteredEvents : filteredEvents.slice(0, PREVIEW_LIMIT);

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Ligi monitorowane teraz</h2>
            <p className="mt-1 text-sm text-white/62">
              Kliknij ligę, aby zobaczyć jej mecze bez przewijania przez całą stronę.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedSport("all");
              setShowAll(false);
            }}
            className={`w-full rounded-md border px-3 py-1.5 text-xs font-medium transition sm:w-auto ${
              selectedSport === "all"
                ? "border-sky-400/35 bg-sky-400/14 text-sky-100"
                : "border-white/16 bg-white/8 text-white/74 hover:bg-white/12"
            }`}
          >
            Wszystkie ligi
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {grouped.map((group) => (
            <button
              type="button"
              key={group.sportTitle}
              onClick={() => {
                setSelectedSport(group.sportTitle);
                setShowAll(false);
              }}
              className={`rounded-lg border p-3 text-left transition ${
                selectedSport === group.sportTitle
                  ? "border-sky-400/35 bg-sky-400/14"
                  : "border-white/12 bg-white/6 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">{group.sportTitle}</p>
                <span className="rounded-md border border-white/16 bg-white/8 px-2 py-0.5 text-xs text-white/74">
                  {group.count}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/54">
                {group.nextStart ? `Najbliższy start: ${formatStart(group.nextStart)}` : "Brak terminu"}
              </p>
              {group.hasLive && (
                <p className="mt-1 text-xs font-medium text-emerald-300">LIVE</p>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {selectedSport === "all" ? "Nadchodzące mecze ze wszystkich lig" : `Mecze: ${selectedSport}`}
            </h3>
            <p className="mt-1 text-sm text-white/62">Łącznie: {filteredEvents.length} wydarzeń.</p>
          </div>
          {filteredEvents.length > PREVIEW_LIMIT && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="rounded-md border border-white/16 bg-white/8 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/12"
            >
              {showAll ? "Pokaż mniej" : `Pokaż wszystkie (${filteredEvents.length})`}
            </button>
          )}
        </div>

        {visibleEvents.length === 0 ? (
          <p className="mt-4 rounded-lg border border-white/12 bg-white/6 p-4 text-sm text-white/68">
            Brak wydarzeń dla wybranej ligi.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-white/12">
            <div className="divide-y divide-white/10">
              {visibleEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block bg-white/4 px-4 py-3 transition hover:bg-white/10"
                >
                  <div className="grid gap-2 md:grid-cols-[1.1fr_1fr_0.9fr] md:items-center">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {event.homeTeam} vs {event.awayTeam}
                      </p>
                      <p className="text-xs text-white/54">{event.sportTitle}</p>
                    </div>
                      <p className="break-words text-xs text-white/58">{extractOddsLine(event)}</p>
                    <div className="text-left md:text-right">
                      <p className="text-xs text-white/54">Start</p>
                      <p className="text-sm text-white/84">{formatStart(event.commenceTime)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
