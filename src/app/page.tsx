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

// Always read the latest scraped data — it refreshes in the background.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, arbitrages, nearArbitrages, events] = await Promise.all([
    getDashboardStats(),
    getArbitrageOpportunities(1000),
    getNearArbitrageOpportunities(),
    getAllEvents(),
  ]);

  return (
    <div className="w-full space-y-10">
      <section className="glass-panel relative overflow-hidden rounded-xl p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/[0.13] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-emerald-400/[0.07] blur-3xl"
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
          BukScan · skaner arbitrażu
        </p>
        <h1 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-4xl sm:leading-[1.15]">
          Surebety i okazje arbitrażowe{" "}
          <span className="text-gradient">w jednym miejscu</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
          Skaner kursów z {stats.totalBookmakers} bukmacherów, podgląd rynku i natychmiastowa
          kalkulacja stawek — bez zbędnego chaosu.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/arbitrage"
            className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold text-white"
          >
            Przejdź do okazji
          </Link>
          <Link
            href="/events"
            className="rounded-lg bg-white/[0.06] border border-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]"
          >
            Przeglądaj wydarzenia
          </Link>
          <Link
            href="/settings"
            className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.06]"
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

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
          <h2 className="text-lg font-bold text-white">Aktualne okazje</h2>
          <span className="text-xs text-white/40 font-medium">
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
          <p className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-white/50">
            Aktualnie brak surebetów. System dalej skanuje rynek.
          </p>
        )}

        {nearArbitrages.length > 0 && (
          <details className="mt-4 rounded-xl border border-white/8 bg-transparent p-3">
            <summary className="cursor-pointer text-xs font-semibold text-white/80 select-none">
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

    </div>
  );
}
