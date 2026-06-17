import ManualCalculator from "@/components/ManualCalculator";
import ArbitrageFormula from "@/components/ArbitrageFormula";

export const metadata = {
  title: "Kalkulator | BukScan",
};

export default function KalkulatorPage() {
  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Kalkulator arbitrażu</h1>
        <p className="mt-1 text-white/52">
          Wpisz własne kursy, a kalkulator rozłoży stawki i policzy gwarantowany zysk — po podatku.
        </p>
      </div>

      <div className="glass-panel rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sky-300 text-sm">Jak to działa?</h3>
            <p className="mt-1 text-xs leading-5 text-white/60">
              Dodaj wyniki meczu (np. 1, X, 2), wpisz kursy i wybierz bukmacherów. Kalkulator
              rozdziela łączną stawkę tak, aby zwrot z każdego wyniku był równy — gdy suma
              odwrotności kursów jest mniejsza niż 1, masz{" "}
              <strong className="text-white font-medium">gwarantowany zysk</strong> niezależnie od
              rezultatu.
            </p>
            <p className="mt-3 text-xs text-white/50">Wzór:</p>
            <ArbitrageFormula className="mt-1.5 text-base sm:text-lg" />
            <p className="mt-3 text-xs leading-5 text-white/60">
              Stawki i zysk liczone są{" "}
              <strong className="text-white font-medium">po podatku</strong> od wygranych (domyślnie
              12%, do zmiany w Ustawieniach) — z wyjątkiem bukmacherów bez podatku, np.{" "}
              <strong className="text-white font-medium">Betclic</strong>. Gotowy układ możesz
              zapisać w Dzienniku.
            </p>
          </div>
        </div>
      </div>

      <ManualCalculator />
    </div>
  );
}
