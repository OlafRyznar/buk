"use client";

import { useState } from "react";

// ── ValueBet Calculator ────────────────────────────────────────────────────────

function ValueBetCalculator() {
  const [bookmakerOdds, setBookmakerOdds] = useState(2.20);
  const [myProbability, setMyProbability] = useState(50);
  const [stake, setStake] = useState(100);

  const fairOdds = 100 / myProbability;
  const expectedValue = (myProbability / 100) * bookmakerOdds - 1;
  const isValue = bookmakerOdds > fairOdds;
  const edge = ((bookmakerOdds / fairOdds) - 1) * 100;

  // Kelly Criterion recommendation
  const kellyStake = Math.max(0, (bookmakerOdds * (myProbability / 100) - 1) / (bookmakerOdds - 1)) * stake;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Kurs bukmachera', val: bookmakerOdds, set: setBookmakerOdds, step: 0.01, min: 1.01 },
          { label: 'Moje szacowane prawdopodobieństwo (%)', val: myProbability, set: setMyProbability, step: 1, min: 1, max: 99 },
          { label: 'Rozważana stawka (zł)', val: stake, set: setStake, step: 10, min: 1 },
        ].map(({ label, val, set, step, min }) => (
          <div key={label}>
            <label className="block text-xs text-white/42 mb-2">{label}</label>
            <input
              type="number"
              value={val}
              step={step}
              min={min}
              onChange={e => set(parseFloat(e.target.value) || (min ?? 1))}
              className="w-full rounded-[16px] border border-white/12 bg-white/8 px-4 py-3 text-white font-mono focus:border-white/25 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className={`rounded-xl border p-5 bg-transparent ${isValue ? 'border-emerald-500/25' : 'border-rose-500/25'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div>
            <h3 className={`font-bold text-base ${isValue ? 'text-emerald-300' : 'text-rose-300'}`}>
              {isValue ? 'Zakład ma wartość!' : 'Brak wartości (Value)'}
            </h3>
            <p className="text-xs text-white/50">
              {isValue
                ? `Kurs bukmachera (${bookmakerOdds}) jest wyższy od kursu "fair" (${fairOdds.toFixed(2)})`
                : `Bukmacher wycenia kurs "fair" na ${fairOdds.toFixed(2)} – Twój zakład jest przepłacony`}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-white/40">Oczekiwana wartość (EV)</p>
            <p className={`text-xl font-bold font-mono mt-1 ${expectedValue >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {(expectedValue * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40">Przewaga nad bukmacherem</p>
            <p className={`text-xl font-bold font-mono mt-1 ${edge >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {edge >= 0 ? '+' : ''}{edge.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40">Rekomendacja Kelly (¼ Kelly)</p>
            <p className="text-xl font-bold font-mono mt-1 text-amber-200">
              {(kellyStake * 0.25).toFixed(2)} zł
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Asian Handicap Calculator ──────────────────────────────────────────────────

function AsianHandicapCalculator() {
  const [stake, setStake] = useState(500);
  const [odds, setOdds] = useState(1.95);
  const [handicap, setHandicap] = useState<0 | 0.25 | 0.5 | 0.75 | 1>(-0.5 as 0.5);
  const [result, setResult] = useState<'win' | 'loss' | 'draw'>('win');

  // For quarter handicaps, half stake wins/half refunded or half wins/half loses
  const isQuarter = Math.abs(handicap % 0.5) === 0.25;
  
  let payout = 0;
  let description = '';

  if (!isQuarter) {
    if (result === 'win') {
      payout = stake * odds;
      description = 'Pełna wygrana – zakład wygrany';
    } else if (result === 'draw' && handicap === 0) {
      payout = stake;
      description = 'Handicap 0: zwrot stawki przy remisie';
    } else {
      payout = 0;
      description = 'Przegrana – strata stawki';
    }
  } else {
    const halfStake = stake / 2;
    if (result === 'win') {
      payout = stake * odds;
      description = 'Obie połowy wygrywają';
    } else if (result === 'draw') {
      payout = halfStake * odds + halfStake;
      description = 'Jedna połowa wygrywa, druga zwracana';
    } else {
      payout = halfStake;
      description = 'Jedna połowa przegrywa, druga zwracana';
    }
  }

  const profit = payout - stake;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs text-white/42 mb-2">Stawka (zł)</label>
          <input
            type="number"
            value={stake}
            step={10}
            min={1}
            onChange={e => setStake(parseFloat(e.target.value) || 1)}
            className="w-full rounded-[16px] border border-white/12 bg-white/8 px-4 py-3 text-white font-mono focus:border-white/25 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-white/42 mb-2">Kurs</label>
          <input
            type="number"
            value={odds}
            step={0.01}
            min={1.01}
            onChange={e => setOdds(parseFloat(e.target.value) || 1.01)}
            className="w-full rounded-[16px] border border-white/12 bg-white/8 px-4 py-3 text-white font-mono focus:border-white/25 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-white/42 mb-2">Handicap azjatycki</label>
          <select
            value={handicap}
            onChange={e => setHandicap(parseFloat(e.target.value) as 0)}
            className="w-full rounded-[16px] border border-white/12 bg-[#0e1c2e] px-4 py-3 text-white focus:border-white/25 focus:outline-none"
          >
            {[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map(h => (
              <option key={h} value={h}>{h > 0 ? `+${h}` : h}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/42 mb-2">Wynik (po uwzgl. handicapu)</label>
          <select
            value={result}
            onChange={e => setResult(e.target.value as 'win' | 'loss' | 'draw')}
            className="w-full rounded-[16px] border border-white/12 bg-[#0e1c2e] px-4 py-3 text-white focus:border-white/25 focus:outline-none"
          >
            <option value="win">Wygrana</option>
            <option value="draw">Remis / push</option>
            <option value="loss">Przegrana</option>
          </select>
        </div>
      </div>

      <div className={`rounded-xl border p-5 bg-transparent ${profit > 0 ? 'border-emerald-500/20' : profit === 0 ? 'border-white/10' : 'border-rose-500/20'}`}>
        <p className="text-sm text-white/52 mb-3">{description}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-white/40">Wypłata</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">{payout.toFixed(2)} zł</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Zysk / strata</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${profit > 0 ? 'text-emerald-300' : profit < 0 ? 'text-rose-300' : 'text-white/60'}`}>
              {profit >= 0 ? '+' : ''}{profit.toFixed(2)} zł
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40">Opis</p>
            <p className="text-sm text-white/60 mt-1">
              {isQuarter ? 'Handicap ćwiartkowy: stawka dzielona na 2 zakłady' : 'Handicap standardowy'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hedge Calculator ──────────────────────────────────────────────────────────

function HedgeCalculator() {
  const [originalStake, setOriginalStake] = useState(500);
  const [originalOdds, setOriginalOdds] = useState(3.5);
  const [hedgeOdds, setHedgeOdds] = useState(1.8);

  const potentialWin = originalStake * originalOdds;
  const hedgeStake = potentialWin / hedgeOdds;
  const profitIfOriginalWins = potentialWin - originalStake - hedgeStake;
  const profitIfHedgeWins = hedgeStake * hedgeOdds - hedgeStake - originalStake;
  const totalStake = originalStake + hedgeStake;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-sky-500/20 bg-transparent p-4">
        <p className="text-sm text-sky-100/80">
          Kalkulator kontrowania – jeśli zdążyłeś postawić tylko pierwszy zakład, a kursy potem
          się zmieniły, użyj tego narzędzia, aby obliczyć stawkę zabezpieczającą i zminimalizować
          ewentualną stratę.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Już postawiona stawka (zł)', val: originalStake, set: setOriginalStake, step: 10 },
          { label: 'Oryginalny kurs', val: originalOdds, set: setOriginalOdds, step: 0.01 },
          { label: 'Nowy kurs (kontrujący)', val: hedgeOdds, set: setHedgeOdds, step: 0.01 },
        ].map(({ label, val, set, step }) => (
          <div key={label}>
            <label className="block text-xs text-white/42 mb-2">{label}</label>
            <input
              type="number"
              value={val}
              step={step}
              min={1.01}
              onChange={e => set(parseFloat(e.target.value) || 1.01)}
              className="w-full rounded-[16px] border border-white/12 bg-white/8 px-4 py-3 text-white font-mono focus:border-white/25 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Stawka kontrująca', value: `${hedgeStake.toFixed(2)} zł`, color: 'text-sky-200' },
          { label: 'Łączna zaangażowana kwota', value: `${totalStake.toFixed(2)} zł`, color: 'text-white' },
          { label: 'Zysk jeśli wygra oryginał', value: `${profitIfOriginalWins >= 0 ? '+' : ''}${profitIfOriginalWins.toFixed(2)} zł`, color: profitIfOriginalWins >= 0 ? 'text-emerald-300' : 'text-rose-300' },
          { label: 'Zysk jeśli wygra kontr', value: `${profitIfHedgeWins >= 0 ? '+' : ''}${profitIfHedgeWins.toFixed(2)} zł`, color: profitIfHedgeWins >= 0 ? 'text-emerald-300' : 'text-rose-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/8 bg-transparent p-4">
            <p className="text-xs text-white/40">{label}</p>
            <p className={`text-xl font-bold font-mono mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Tab = 'valuebet' | 'asian' | 'hedge';

const TABS: { id: Tab; label: string; desc: string }[] = [
  { id: 'valuebet', label: 'ValueBet', desc: 'Znajdź zakłady z dodatnią wartością oczekiwaną' },
  { id: 'asian', label: 'Handicap Azjatycki', desc: 'Oblicz wypłaty dla handicapów ćwiartkowych' },
  { id: 'hedge', label: 'Kalkulator Kontrowania', desc: 'Zabezpiecz pierwszą stronę zakładu w trybie ratunkowym' },
];

const STRATEGY_GUIDES: Record<
  Tab,
  {
    intro: string;
    when: string;
    risk: string;
    steps: string[];
  }
> = {
  valuebet: {
    intro:
      'ValueBet to zakład, gdzie Twój szacunek prawdopodobieństwa jest wyższy niż wycena bukmachera.',
    when:
      'Użyj, gdy masz własny model, statystyki lub przewagę informacyjną dla danego rynku.',
    risk:
      'Nawet zakład z dodatnim EV może przegrać – wynik pojedynczego kuponu nie potwierdza ani nie obala przewagi.',
    steps: [
      'Podaj kurs bukmachera i swoje prawdopodobieństwo.',
      'Sprawdź EV i przewagę procentową.',
      'Ustal stawkę konserwatywnie, np. ułamkiem Kelly.',
    ],
  },
  asian: {
    intro:
      'Handicap azjatycki pozwala lepiej kontrolować ryzyko dzięki częściowym zwrotom stawki.',
    when:
      'Użyj, gdy chcesz zmniejszyć wariancję i unikać skrajnych scenariuszy wygrana/przegrana.',
    risk:
      'Błędna interpretacja ćwiartek handicapu może prowadzić do złej oceny wyniku.',
    steps: [
      'Wybierz handicap i możliwy wynik zakładu.',
      'Sprawdź wypłatę i końcowy profit/stratę.',
      'Porównaj kilka wariantów przed postawieniem kuponu.',
    ],
  },
  hedge: {
    intro:
      'Kontrowanie służy do ratowania pozycji, gdy pierwszy zakład już zagrałeś, a kursy się zmieniły.',
    when:
      'Użyj, gdy rynek odjechał i chcesz ograniczyć stratę albo zamknąć pozycję na plusie.',
    risk:
      'Wysoka stawka kontrująca może mocno obciążyć bankroll przy niskim kursie hedge.',
    steps: [
      'Wprowadź stawkę i kurs pierwszego zakładu.',
      'Dodaj nowy kurs na kontrę.',
      'Sprawdź oba scenariusze wyniku i wybierz bezpieczniejszy wariant.',
    ],
  },
};

export default function StrategiesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('valuebet');
  const activeConfig = TABS.find((tab) => tab.id === activeTab);
  const guide = STRATEGY_GUIDES[activeTab];

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Zaawansowane Strategie</h1>
        <p className="mt-1 text-white/52">Kalkulatory dla value-betów, handicapów azjatyckich i kontrowania.</p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-6 border-b border-white/10 pb-px overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 pb-3 text-sm font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-sky-400 font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-xl p-4 sm:p-5">
        <h2 className="text-base font-bold text-white">
          {activeConfig?.label}
        </h2>
        <p className="mt-1.5 text-xs text-white/50">{guide.intro}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/8 bg-transparent p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Kiedy użyć</p>
            <p className="mt-1.5 text-xs text-white/60 leading-5">{guide.when}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-transparent p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Na co uważać</p>
            <p className="mt-1.5 text-xs text-white/60 leading-5">{guide.risk}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-transparent p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Szybkie kroki</p>
            <ol className="mt-1.5 space-y-1 text-xs text-white/60 leading-5">
              {guide.steps.map((step, index) => (
                <li key={step}>
                  {index + 1}. {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Active calculator */}
      <div className="glass-panel rounded-xl p-4 sm:p-6">
        <h2 className="text-lg font-bold text-white mb-1">
          Kalkulator: {activeConfig?.label}
        </h2>
        <p className="mb-6 text-xs text-white/40">{activeConfig?.desc}</p>
        {activeTab === 'valuebet' && <ValueBetCalculator />}
        {activeTab === 'asian' && <AsianHandicapCalculator />}
        {activeTab === 'hedge' && <HedgeCalculator />}
      </div>

      {/* Educational note */}
      <div className="glass-panel rounded-xl p-5 border border-white/8">
        <h3 className="font-semibold text-white mb-3 text-sm">Wskazówki do zaawansowanych strategii</h3>
        <ul className="space-y-2 text-xs text-white/50 list-disc list-inside">
          <li>ValueBet wymaga dokładnej oceny prawdopodobieństwa – modele statystyczne pomagają.</li>
          <li>Handicapy azjatyckie minimalizują ryzyko dzięki częściowym zwrotom stawki.</li>
          <li>Kalkulator kontrowania jest przydatny gdy rynek zostaje zamknięty przez bukmachera.</li>
          <li>Przed kontrą porównaj kursy u kilku bukmacherów – stawka zabezpieczająca może wypaść korzystniej niż u tego samego bukmachera.</li>
        </ul>
      </div>
    </div>
  );
}
