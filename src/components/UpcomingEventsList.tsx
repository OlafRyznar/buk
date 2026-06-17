"use client";

import { EventWithOdds } from "@/lib/types";
import { useVisibleEvents } from "@/hooks/useVisibleEvents";
import EventCard from "./EventCard";

export default function UpcomingEventsList({ events, limit = 3 }: { events: EventWithOdds[]; limit?: number }) {
  const visible = useVisibleEvents(events)
    .slice()
    .sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime())
    .slice(0, limit);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {visible.map((event) => (
        <EventCard key={event.id} event={event} compact />
      ))}
    </div>
  );
}
