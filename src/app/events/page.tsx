import EventsLeagueExplorer from "@/components/EventsLeagueExplorer";
import { getAllEvents } from "@/lib/data-service";


export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Wydarzenia</h1>
        <p className="mt-1 text-white/64">
          Wszystkie monitorowane wydarzenia sportowe z kursami bukmacherów.
        </p>
      </div>

      <EventsLeagueExplorer events={events} />

      {events.length === 0 && (
        <div className="glass-panel rounded-3xl p-8 text-center sm:p-12">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Brak wydarzeń
          </h3>
          <p className="text-white/68">
            Nie znaleziono żadnych nadchodzących wydarzeń sportowych.
          </p>
        </div>
      )}
    </div>
  );
}
