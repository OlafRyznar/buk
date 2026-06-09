import StatCard from "@/components/StatCard";
import ArbitrageCard from "@/components/ArbitrageCard";
import EventCard from "@/components/EventCard";
import PotentialArbitrageCard from "@/components/PotentialArbitrageCard";
import Link from "next/link";
import {
  getDashboardStats,
  getArbitrageOpportunities,
  getAllEvents,
  getNearArbitrageOpportunities,
} from "@/lib/data-service";


export default async function DashboardPage() {
  const [stats, arbitrages, nearArbitrages, events] = await Promise.all([
    getDashboardStats(),
    getArbitrageOpportunities(1000),
    getNearArbitrageOpportunities(),
    getAllEvents(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="glass-panel rounded-2xl p-6 sm:p-7">
        <p className="feature-pill">Aplikacja Arbitrażu Bukmacherskiego</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-semibold text-white sm:text-4xl">
          Prosty panel do arbitrażu: najważniejsze informacje na pierwszym ekranie.
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/70">
          Bez przeładowania i bez chaosu. Otrzymujesz czytelny podgląd rynku, szybki dostęp do kalkulatora,
          radar okazji oraz konkretne moduły analityczne.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/arbitrage"
            className="rounded-lg border border-white/20 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
          >
            Przejdź do okazji
          </Link>
          <Link
            href="/calculator"
            className="rounded-lg border border-sky-400/35 bg-sky-400/14 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
          >
            Otwórz kalkulator
          </Link>
          <Link
            href="/settings"
            className="rounded-lg border border-white/16 bg-transparent px-4 py-2 text-sm font-medium text-white/84 transition hover:bg-white/8"
          >
            Ustawienia
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Szybki podgląd</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monitorowane wydarzenia"
          value={stats.totalEvents}
          subtitle={`z ${stats.totalBookmakers} bukmacherów`}
          color="blue"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Okazje arbitrażowe"
          value={stats.totalArbitrages}
          subtitle="aktualnie dostępnych"
          color="emerald"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          title="Watchlista"
          value={stats.totalNearArbitrages}
          subtitle={
            stats.closestToArbitrage > 0
              ? `${stats.closestToArbitrage.toFixed(2)} pp od progu`
              : "brak wydarzeń blisko progu"
          }
          color="amber"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h8m0 0v8m0-8L9 15l-4-4-3 3" />
            </svg>
          }
        />
        <StatCard
          title="Średni profit"
          value={stats.averageProfit > 0 ? `+${stats.averageProfit}%` : "—"}
          subtitle="dla aktywnych okazji"
          color="red"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-white">Aktualne okazje</h2>
          <span className="rounded-md border border-white/14 bg-white/6 px-2.5 py-1 text-xs text-white/76">
            {arbitrages.length} surebetów live
          </span>
        </div>

        {arbitrages.length > 0 ? (
          <div className="space-y-3">
            {arbitrages.slice(0, 2).map((arb) => (
              <ArbitrageCard key={arb.id} opportunity={arb} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-white/12 bg-white/6 p-4 text-sm text-white/68">
            Aktualnie brak surebetów. System dalej skanuje rynek.
          </p>
        )}

        {nearArbitrages.length > 0 && (
          <details className="mt-4 rounded-lg border border-white/12 bg-white/6 p-3">
            <summary className="cursor-pointer text-sm font-medium text-white">
              Pokaż watchlistę blisko progu ({nearArbitrages.length})
            </summary>
            <div className="mt-3">
              <PotentialArbitrageCard opportunity={nearArbitrages[0]} />
            </div>
          </details>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">Nadchodzące wydarzenia</h2>
          <Link
            href="/events"
            className="text-sm text-sky-300 transition hover:text-sky-200"
          >
            Zobacz wszystkie →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {events.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} compact />
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white">Jak to działa w 3 krokach</h2>
        <ol className="mt-4 space-y-3">
          {[
            "Porównujesz kursy z wielu bukmacherów w jednym miejscu.",
            "System wykrywa układy z marżą poniżej 100%.",
            "Kalkulator dzieli stawki i pokazuje gwarantowany wynik.",
          ].map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm text-white/74">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/8 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

    </div>
  );
}
