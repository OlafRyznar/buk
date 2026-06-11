import ArbitrageFilteredList from "@/components/ArbitrageFilteredList";
import ArbitrageFormula from "@/components/ArbitrageFormula";
import { getArbitrageOpportunities, getNearArbitrageOpportunities, getAllEvents } from "@/lib/data-service";

// Always read the latest scraped data — it refreshes in the background.
export const dynamic = "force-dynamic";

export default async function ArbitragePage() {
  const [arbitrages, nearArbitrages, events] = await Promise.all([
    getArbitrageOpportunities(1000),
    getNearArbitrageOpportunities(),
    getAllEvents(),
  ]);

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Okazje Arbitrażowe</h1>
        <p className="mt-1 text-white/52">
          Surebety i rynki bliskie progu arbitrażu — w czasie rzeczywistym (demo).
        </p>
      </div>

      <div className="glass-panel rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 text-sm">Jak to działa?</h3>
            <p className="mt-1 text-xs leading-5 text-white/60">
              Arbitraż bukmacherski (surebet) powstaje gdy suma odwrotności najlepszych kursów
              na wszystkie wyniki u różnych bukmacherów jest mniejsza niż 1. Oznacza to, że
              stawiając odpowiednie kwoty u różnych bukmacherów,{" "}
              <strong className="text-white font-medium">
                gwarantujesz sobie zysk niezależnie od wyniku meczu
              </strong>
              .
            </p>
            <p className="mt-3 text-xs text-white/50">Wzór:</p>
            <ArbitrageFormula className="mt-1.5 text-base sm:text-lg" />
            <p className="mt-3 text-xs leading-5 text-white/60">
              Wszystkie zyski i stawki na tej stronie są liczone{" "}
              <strong className="text-white font-medium">po podatku</strong> od wygranych
              (domyślnie 12%, do zmiany w Ustawieniach) — z wyjątkiem bukmacherów oferujących
              grę bez podatku, np. <strong className="text-white font-medium">Betclic</strong>.
            </p>
          </div>
        </div>
      </div>

      <ArbitrageFilteredList arbitrages={arbitrages} nearArbitrages={nearArbitrages} events={events} />
    </div>
  );
}
