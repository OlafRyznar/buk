"use client";

import { useState } from "react";
import { EventWithOdds } from "@/lib/types";
import { useVisibleEvents } from "@/hooks/useVisibleEvents";
import EventCard from "./EventCard";

export default function UpcomingEventsList({ events, limit: initialLimit = 3 }: { events: EventWithOdds[]; limit?: number }) {
  const [currentLimit, setCurrentLimit] = useState(initialLimit);
  const [activeTab, setActiveTab] = useState<"all" | "world_cup">("all");

  const visibleEvents = useVisibleEvents(events);

  // Filter based on active tab
  const filteredEvents = visibleEvents.filter((event) => {
    if (activeTab === "world_cup") {
      return event.sportKey === "soccer_fifa_world_cup";
    }
    return true;
  });

  // Sort by commence time ascending (upcoming first)
  const sortedEvents = filteredEvents
    .slice()
    .sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime());

  const visible = sortedEvents.slice(0, currentLimit);
  const hasMore = sortedEvents.length > currentLimit;

  // Check if there are any World Cup events in the list
  const hasWorldCupEvents = visibleEvents.some(
    (event) => event.sportKey === "soccer_fifa_world_cup"
  );

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex space-x-1.5">
          <button
            onClick={() => {
              setActiveTab("all");
              setCurrentLimit(initialLimit);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "all"
                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                : "border border-transparent text-white/55 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            Wszystkie
          </button>
          {hasWorldCupEvents && (
            <button
              onClick={() => {
                setActiveTab("world_cup");
                setCurrentLimit(initialLimit);
              }}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "world_cup"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "border border-transparent text-white/55 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              🏆 Mistrzostwa Świata
            </button>
          )}
        </div>
        
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
          Pokazano: {Math.min(visible.length, sortedEvents.length)} z {sortedEvents.length}
        </span>
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {visible.map((event) => (
            <EventCard key={event.id} event={event} compact />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/[0.01] py-8 text-center">
          <p className="text-xs text-white/40">
            {activeTab === "world_cup" 
              ? "Brak nadchodzących meczów Mistrzostw Świata." 
              : "Brak nadchodzących wydarzeń."}
          </p>
        </div>
      )}

      {/* Show More / Show Less Buttons */}
      <div className="flex justify-center gap-2 pt-2">
        {hasMore && (
          <button
            onClick={() => setCurrentLimit((prev) => prev + 4)}
            className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.06] hover:text-white active:scale-[0.98]"
          >
            Pokaż więcej
          </button>
        )}
        {currentLimit > initialLimit && (
          <button
            onClick={() => setCurrentLimit(initialLimit)}
            className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.06] hover:text-white active:scale-[0.98]"
          >
            Pokaż mniej
          </button>
        )}
      </div>
    </div>
  );
}
