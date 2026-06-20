"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchUserEventAlerts, removeEventAlert, type UserEventAlert } from "@/lib/alerts-service";
import type { FeedEvent } from "@/lib/match-feed";

// Fires the n8n e-mail webhook ONLY for the alerts the user explicitly added
// on specific matches (the "Powiadom mnie" button -> event_alerts in Supabase)
// — never for every upcoming match. A static export has no server/scheduler,
// so while the app is open this polls the user's subscriptions, checks each
// one's condition against the baked /match-feed.json, sends the matched ones,
// and deletes them (one-shot) so nothing is sent twice.
const WEBHOOK_API = '/api/webhook/n8n';
const CHECK_INTERVAL_MS = 60 * 1000;

function bestPriceFor(event: FeedEvent, outcome: string): number | null {
  const row = event.odds.find((o) => o.outcome === outcome);
  return row ? row.price : null;
}

function conditionMet(alert: UserEventAlert, event: FeedEvent, now: number): boolean {
  const minutesUntil = (new Date(event.commenceTime).getTime() - now) / 60000;

  if (alert.type === "before-kickoff" && alert.minutesBefore !== undefined) {
    return minutesUntil > 0 && minutesUntil <= alert.minutesBefore;
  }
  if (alert.type === "at-time" && alert.atTime) {
    return now >= new Date(alert.atTime).getTime();
  }
  if (alert.type === "odds-threshold" && alert.outcomeName && alert.thresholdPrice !== undefined) {
    const price = bestPriceFor(event, alert.outcomeName);
    return price !== null && price >= alert.thresholdPrice;
  }
  return false;
}

export default function MatchAlertWatcher() {
  const busy = useRef(false);

  useEffect(() => {
    if (!WEBHOOK_API) return;

    const check = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id;
        if (!userId) return; // per-event alerts are tied to the logged-in user

        const alerts = await fetchUserEventAlerts(supabase, userId);
        if (alerts.length === 0) return;

        const res = await fetch("/match-feed.json", { cache: "no-store" });
        if (!res.ok) return;
        const events = (await res.json()) as FeedEvent[];
        const byId = new Map(events.map((e) => [e.id, e]));

        const now = Date.now();

        for (const alert of alerts) {
          const event = byId.get(alert.eventId);
          if (!event) continue; // match no longer in the feed
          if (!conditionMet(alert, event, now)) continue;

          const minutes = Math.round((new Date(event.commenceTime).getTime() - now) / 60000);
          const payload = {
            isTest: false,
            toEmail: alert.email,
            email: alert.email,
            eventId: event.id,
            sportTitle: event.sportTitle,
            homeTeam: event.homeTeam,
            awayTeam: event.awayTeam,
            commenceTime: event.commenceTime,
            minutesUntil: minutes,
            odds: event.odds,
            event: {
              id: event.id,
              sportTitle: event.sportTitle,
              homeTeam: event.homeTeam,
              awayTeam: event.awayTeam,
              commenceTime: event.commenceTime,
              minutesUntil: minutes,
            },
          };

          try {
            // One-shot: delete the subscription first to claim it (atomic lock across tabs/workers)
            const claimed = await removeEventAlert(supabase, alert.id);
            if (!claimed) continue;

            await fetch(WEBHOOK_API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          } catch {
            // failed to send after claiming — do not retry to avoid spamming
          }
        }
      } catch {
        // transient error — try again next tick
      } finally {
        busy.current = false;
      }
    };

    void check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
