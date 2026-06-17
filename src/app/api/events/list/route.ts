import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/data-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await getAllEvents();

  const list = events
    .map((event) => {
      const h2h = event.markets.find((m) => m.marketKey === "h2h");
      if (!h2h || h2h.outcomes.length < 2 || h2h.outcomes.length > 3) return null;
      return {
        id: event.id,
        eventName: `${event.homeTeam} vs ${event.awayTeam}`,
        sportTitle: event.sportTitle,
        commenceTime: event.commenceTime,
        outcomes: h2h.outcomes.map((o) => ({
          name: o.name,
          bestOdds: o.bestOdds.odds,
          bestBookmakerKey: o.bestOdds.bookmakerKey,
        })),
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)
    .sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime())
    .slice(0, 300);

  return NextResponse.json({ events: list });
}
