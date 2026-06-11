import EventsLeagueExplorer from "@/components/EventsLeagueExplorer";
import { getAllEvents } from "@/lib/data-service";

// Always read the latest scraped data — it refreshes in the background.
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Wydarzenia</h1>
        <p className="mt-1 text-xs text-white/50">
          Wszystkie monitorowane wydarzenia sportowe z kursami bukmacherów.
        </p>
      </div>

      <EventsLeagueExplorer events={events} />

      {events.length === 0 && (
        <div className="glass-panel rounded-xl p-8 text-center sm:p-12">
          <h3 className="text-base font-bold text-white mb-1">
            Brak wydarzeń
          </h3>
          <p className="text-xs text-white/50">
            Nie znaleziono żadnych nadchodzących wydarzeń sportowych.
          </p>
        </div>
      )}
    </div>
  );
}
