import ArbitrageCalculator from "@/components/ArbitrageCalculator";

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Kalkulator Arbitrażu</h1>
        <p className="mt-1 text-white/64">
          Wprowadź kursy z różnych bukmacherów i sprawdź, czy istnieje okazja arbitrażowa.
        </p>
      </div>

      <ArbitrageCalculator />

      {/* Educational content */}
      <div className="glass-panel space-y-4 rounded-3xl p-4 sm:p-6">
        <h2 className="text-xl font-bold text-white">Przykładowe scenariusze</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/12 bg-white/7 p-4">
            <h3 className="mb-2 font-semibold text-emerald-100">Arbitraż 2-drogowy (NBA, tenis)</h3>
            <p className="mb-3 text-sm text-white/70">
              Bukmacher A: Gracz 1 kurs 2.15<br/>
              Bukmacher B: Gracz 2 kurs 2.05
            </p>
            <p className="text-xs text-white/62">
              1/2.15 + 1/2.05 = 0.465 + 0.488 = <span className="text-emerald-200">0.953 &lt; 1</span>
            </p>
            <p className="mt-1 text-xs text-emerald-200">Zysk: ~4.9%</p>
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/7 p-4">
            <h3 className="mb-2 font-semibold text-emerald-100">Arbitraż 3-drogowy (piłka nożna)</h3>
            <p className="mb-3 text-sm text-white/70">
              Buk A: 1 kurs 2.25<br/>
              Buk B: X kurs 3.75<br/>
              Buk C: 2 kurs 3.60
            </p>
            <p className="text-xs text-white/62">
              1/2.25 + 1/3.75 + 1/3.60 = 0.444 + 0.267 + 0.278 = <span className="text-emerald-200">0.989 &lt; 1</span>
            </p>
            <p className="mt-1 text-xs text-emerald-200">Zysk: ~1.1%</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-sky-300/30 bg-sky-300/12 p-4 sm:p-5">
        <h3 className="mb-2 font-semibold text-sky-100">Wskazówki</h3>
        <ul className="list-inside list-disc space-y-2 text-sm text-white/74">
          <li>Arbitraże najczęściej pojawiają się przy kursach bliskich 2.00.</li>
          <li>Im więcej bukmacherów porównujesz, tym większa szansa na okazję.</li>
          <li>Kursy zmieniają się szybko, dlatego działaj natychmiast po wykryciu sygnału.</li>
          <li>Uwzględniaj limity stawek oraz dostępne saldo u każdego bukmachera.</li>
          <li>Pamiętaj o prowizjach i kosztach wypłat przy liczeniu netto.</li>
        </ul>
      </div>
    </div>
  );
}
