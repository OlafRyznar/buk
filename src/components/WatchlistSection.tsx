"use client";

import { EventWithOdds } from "@/lib/types";
import { useApp } from "@/components/AppProvider";
import EventCard from "./EventCard";

interface WatchlistSectionProps {
  events: EventWithOdds[];
}

export default function WatchlistSection({ events }: WatchlistSectionProps) {
  const { watchlist } = useApp();
  const watchedEvents = events.filter((event) => watchlist.includes(event.id));

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Watchlista</h2>
          <p className="mt-1 text-xs text-white/50">
            Wydarzenia oznaczone gwiazdką ☆ — Twoje typy do obserwacji.
          </p>
        </div>
        {watchedEvents.length > 0 && (
          <span className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 text-xs font-medium text-amber-300 sm:self-auto">
            {watchedEvents.length} obserwowanych
          </span>
        )}
      </div>

      {watchedEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {watchedEvents.map((event) => (
            <EventCard key={event.id} event={event} compact />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-xl p-8 text-center sm:p-12">
          <h3 className="text-base font-bold text-white mb-1">Watchlista jest pusta</h3>
          <p className="mx-auto max-w-md text-xs text-white/50">
            Kliknij ☆ przy meczu na liście wydarzeń, aby dodać go do watchlisty.
          </p>
        </div>
      )}
    </section>
  );
}
