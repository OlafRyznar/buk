"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { EventWithOdds } from "@/lib/types";

/**
 * Hides events whose kickoff has already passed — the background scraper
 * doesn't always refresh in time, so a stale "upcoming" match can otherwise
 * linger in listings for a while after it actually started. Events the user
 * deliberately cares about (watchlisted, or with a notification set) stay
 * visible so they aren't surprised when one disappears — EventCard shows a
 * "already started" badge for those instead.
 */
export function useVisibleEvents(events: EventWithOdds[]): EventWithOdds[] {
  const { watchlist } = useApp();
  const [alertEventIds, setAlertEventIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/event-alerts")
      .then((r) => r.json())
      .then((alerts: { eventId: string }[]) => setAlertEventIds(new Set(alerts.map((a) => a.eventId))))
      .catch(() => {});
  }, []);

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setNow(Date.now());
    }, 0);
  }, []);

  return events.filter((event) => {
    if (now === null) return true;
    const started = new Date(event.commenceTime).getTime() <= now;
    if (!started) return true;
    return watchlist.includes(event.id) || alertEventIds.has(event.id);
  });
}
