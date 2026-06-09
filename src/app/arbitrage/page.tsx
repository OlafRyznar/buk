import ArbitrageFilteredList from "@/components/ArbitrageFilteredList";
import { getArbitrageOpportunities, getNearArbitrageOpportunities } from "@/lib/data-service";


export default async function ArbitragePage() {
  const [arbitrages, nearArbitrages] = await Promise.all([
    getArbitrageOpportunities(1000),
    getNearArbitrageOpportunities(),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Okazje Arbitrażowe</h1>
        <p className="mt-1 text-white/52">
          Surebety i rynki bliskie progu arbitrażu — w czasie rzeczywistym (demo).
        </p>
      </div>

      <div className="glass-panel rounded-[30px] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/14 text-emerald-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-100">Jak to działa?</h3>
            <p className="mt-1 text-sm leading-6 text-white/62">
              Arbitraż bukmacherski (surebet) powstaje gdy suma odwrotności najlepszych kursów
              na wszystkie wyniki u różnych bukmacherów jest mniejsza niż 1. Oznacza to, że
              stawiając odpowiednie kwoty u różnych bukmacherów,{" "}
              <strong className="text-white">
                gwarantujesz sobie zysk niezależnie od wyniku meczu
              </strong>
              .
            </p>
            <p className="mt-2 text-sm text-white/62">
              Wzór:{" "}
              <code className="rounded bg-black/30 px-2 py-0.5 text-amber-100">
                1/kurs1 + 1/kurs2 + 1/kurs3 &lt; 1
              </code>
            </p>
          </div>
        </div>
      </div>

      <ArbitrageFilteredList arbitrages={arbitrages} nearArbitrages={nearArbitrages} />
    </div>
  );
}
