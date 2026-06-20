import EventsLeagueExplorer from "@/components/EventsLeagueExplorer";
import EventsViewTabs from "@/components/EventsViewTabs";
import WorldCupGroupCard from "@/components/WorldCupGroupCard";
import { getAllEvents } from "@/lib/data-service";
import { WORLD_CUP_GROUPS, groupLetterForMatch } from "@/lib/world-cup-groups";
import { EventWithOdds } from "@/lib/types";

// Always read the latest scraped data — it refreshes in the background.
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getAllEvents();
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const byGroup = new Map<string, { upcoming: EventWithOdds[]; finished: EventWithOdds[] }>();
  for (const group of WORLD_CUP_GROUPS) {
    byGroup.set(group.letter, { upcoming: [], finished: [] });
  }
  for (const event of events) {
    const letter = groupLetterForMatch(event.homeTeam, event.awayTeam);
    if (!letter) continue;
    const bucket = byGroup.get(letter);
    if (!bucket) continue;
    const isPast = new Date(event.commenceTime).getTime() < now;
    (isPast ? bucket.finished : bucket.upcoming).push(event);
  }
  for (const bucket of byGroup.values()) {
    bucket.upcoming.sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime());
    bucket.finished.sort((a, b) => new Date(b.commenceTime).getTime() - new Date(a.commenceTime).getTime());
  }

  const groupsView = (
    <div key="groups-view" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {WORLD_CUP_GROUPS.map((group) => {
        const bucket = byGroup.get(group.letter)!;
        return (
          <WorldCupGroupCard key={group.letter} group={group} upcoming={bucket.upcoming} finished={bucket.finished} />
        );
      })}
    </div>
  );

  const leagueView = (
    <div key="leagues-view">
      <EventsLeagueExplorer events={events} />
      {events.length === 0 && (
        <div className="glass-panel rounded-xl p-8 text-center sm:p-12">
          <h3 className="text-base font-bold text-white mb-1">Brak wydarzeń</h3>
          <p className="text-xs text-white/50">Nie znaleziono żadnych nadchodzących wydarzeń sportowych.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Wydarzenia</h1>
        <p className="mt-1 text-xs text-white/50">
          Wszystkie monitorowane wydarzenia sportowe z kursami bukmacherów.
        </p>
      </div>

      <EventsViewTabs leagueView={leagueView} groupsView={groupsView} />
    </div>
  );
}
