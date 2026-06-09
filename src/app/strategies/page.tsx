"use client";

import { useState } from "react";

// ── Middle Bet (Widełki) Calculator ───────────────────────────────────────────

function MiddleCalculator() {
  const [stake, setStake] = useState(1000);
  const [oddsLow, setOddsLow] = useState(1.85);  // bet on -1.5 handicap low
  const [oddsHigh, setOddsHigh] = useState(2.10); // bet on +1.5 handicap high
  const [oddsMiddle, setOddsMiddle] = useState(0); // optional: exact score wins both

  // Stakes for equal distribution:
  const totalOddsInverse = 1 / oddsLow + 1 / oddsHigh;
  const stakeLow = stake * (1 / oddsLow) / totalOddsInverse;
  const stakeHigh = stake - stakeLow;

  const midWin = oddsMiddle > 1 ? stakeLow * oddsLow + stakeHigh * oddsHigh : 0;

  const lossIfOnlyLow = stakeHigh; // lose stake on high
  const lossIfOnlyHigh = stakeLow; // lose stake on low
  const maxLoss = Math.max(lossIfOnlyLow, lossIfOnlyHigh);
  const middleProfit = midWin - stake;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[28px] border border-amber-300/15 bg-amber-300/4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm leading-6 text-amber-100/80">
            <strong className="text-amber-100">Uwaga: Strategia Middle / Widełki</strong> wiąże się
            z ryzykiem straty. W przeciwieństwie do surebetu, za&quot;trafienie w środek&quot; jest niepewne –
            możesz wygrać na obu zakładach, ale możesz też stracić jeden z nich. Używaj tej strategii
            świadomie i z ograniczoną kwotą.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Całkowity budżet (zł)', val: stake, set: setStake, step: 50, min: 10 },
          { label: 'Kurs niższy (np. -1.5)', val: oddsLow, set: setOddsLow, step: 0.01, min: 1.01 },
          { label: 'Kurs wyższy (np. +1.5)', val: oddsHigh, set: setOddsHigh, step: 0.01, min: 1.01 },
        ].map(({ label, val, set, step, min }) => (
          <div key={label}>
            <label className="block text-xs text-white/42 mb-2">{label}</label>
            <input
              type="number"
              value={val}
              step={step}
              min={min}
              onChange={e => set(parseFloat(e.target.value) || min)}
              className="w-full rounded-[16px] border border-white/12 bg-white/8 px-4 py-3 text-white font-mono focus:border-white/25 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs text-white/42 mb-2">Kurs jeśli wynik środkowy (opcja) – zostaw 0 jeśli nie dotyczy</label>
        <input
          type="number"
          value={oddsMiddle}
          step={0.01}
          min={0}
          onChange={e => setOddsMiddle(parseFloat(e.target.value) || 0)}
          className="w-full sm:w-48 rounded-[16px] border border-white/12 bg-white/8 px-4 py-3 text-white font-mono focus:border-white/25 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Stawka na kurs niższy', value: `${stakeLow.toFixed(2)} zł`, sub: `@ ${oddsLow}`, color: 'text-sky-200' },
          { label: 'Stawka na kurs wyższy', value: `${stakeHigh.toFixed(2)} zł`, sub: `@ ${oddsHigh}`, color: 'text-sky-200' },
          { label: 'Maks. strata', value: `-${maxLoss.toFixed(2)} zł`, sub: 'Gdy przegrasz jeden zakład', color: 'text-rose-300' },
          { label: 'Zysk przy "middle"', value: oddsMiddle > 1 ? `+${middleProfit.toFixed(2)} zł` : 'N/D', sub: 'Gdy wygrasz oba zakłady', color: 'text-emerald-300' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-[22px] border border-white/10 bg-white/6 p-4">
            <p className="text-xs text-white/40">{label}</p>
            <p className={`mt-2 text-xl font-bold font-mono ${color}`}>{value}</p>
            <p className="mt-1 text-xs text-white/36">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

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

      <div className={`rounded-[24px] border p-5 ${isValue ? 'border-emerald-300/25 bg-emerald-300/6' : 'border-rose-300/25 bg-rose-300/6'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`text-2xl`}>{isValue ? '✅' : '❌'}</div>
          <div>
            <h3 className={`font-bold text-lg ${isValue ? 'text-emerald-200' : 'text-rose-200'}`}>
              {isValue ? 'Zakład ma wartość!' : 'Brak wartości (Value)'}
            </h3>
            <p className="text-sm text-white/52">
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

      <div className={`rounded-[24px] border p-5 ${profit > 0 ? 'border-emerald-300/25 bg-emerald-300/6' : profit === 0 ? 'border-white/15 bg-white/6' : 'border-rose-300/25 bg-rose-300/6'}`}>
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
      <div className="glass-panel rounded-[28px] border border-sky-300/15 bg-sky-300/4 p-4">
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
          <div key={label} className="rounded-[22px] border border-white/10 bg-white/6 p-4">
            <p className="text-xs text-white/40">{label}</p>
            <p className={`text-xl font-bold font-mono mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Tab = 'middle' | 'valuebet' | 'asian' | 'hedge';

const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: 'middle', label: 'Widełki (Middle)', icon: '⚖️', desc: 'Zysk gdy dwie linie handicapu obie wygrywają' },
  { id: 'valuebet', label: 'ValueBet', icon: '📊', desc: 'Znajdź zakłady z dodatnią wartością oczekiwaną' },
  { id: 'asian', label: 'Handicap Azjatycki', icon: '🀄', desc: 'Oblicz wypłaty dla handicapów ćwiartkowych' },
  { id: 'hedge', label: 'Kalkulator Kontrowania', icon: '🛡️', desc: 'Zabezpiecz pierwszą stronę zakładu w trybie ratunkowym' },
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
  middle: {
    intro:
      'Widełki to strategia, w której grasz dwa różne handicapy i liczysz na wynik mieszczący się pomiędzy nimi.',
    when:
      'Użyj, gdy widzisz duże przesunięcia linii lub różne interpretacje meczu u bukmacherów.',
    risk:
      'To nie jest pewny zysk. Możesz wygrać dużo, ale możesz też stracić część stawki.',
    steps: [
      'Wpisz budżet oraz oba kursy.',
      'Sprawdź podział stawek i maksymalną stratę.',
      'Podejmij decyzję tylko jeśli ryzyko jest akceptowalne.',
    ],
  },
  valuebet: {
    intro:
      'ValueBet to zakład, gdzie Twój szacunek prawdopodobieństwa jest wyższy niż wycena bukmachera.',
    when:
      'Użyj, gdy masz własny model, statystyki lub przewagę informacyjną dla danego rynku.',
    risk:
      'Nawet dobry valuebet może przegrać krótkoterminowo. Liczy się seria i dyscyplina.',
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
  const [activeTab, setActiveTab] = useState<Tab>('middle');
  const activeConfig = TABS.find((tab) => tab.id === activeTab);
  const guide = STRATEGY_GUIDES[activeTab];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Zaawansowane Strategie</h1>
        <p className="mt-1 text-white/52">Kalkulatory dla middle-betów, value-betów, handicapów azjatyckich i kontrowania.</p>
      </div>

      {/* Tab selector */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg border p-3 text-left transition ${
              activeTab === tab.id
                ? 'border-sky-400/35 bg-sky-400/14'
                : 'border-white/12 bg-white/5 hover:bg-white/8'
            }`}
          >
            <p className="mb-1 text-base">{tab.icon}</p>
            <p className={`text-sm font-semibold ${activeTab === tab.id ? 'text-sky-100' : 'text-white'}`}>{tab.label}</p>
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-xl border border-white/12 p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-white">
          {activeConfig?.icon} {activeConfig?.label}
        </h2>
        <p className="mt-2 text-sm text-white/72">{guide.intro}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-white/12 bg-white/6 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Kiedy użyć</p>
            <p className="mt-2 text-sm text-white/74">{guide.when}</p>
          </div>
          <div className="rounded-lg border border-white/12 bg-white/6 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Na co uważać</p>
            <p className="mt-2 text-sm text-white/74">{guide.risk}</p>
          </div>
          <div className="rounded-lg border border-white/12 bg-white/6 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Szybkie kroki</p>
            <ol className="mt-2 space-y-1 text-sm text-white/74">
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
      <div className="glass-panel rounded-[28px] p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Kalkulator: {activeConfig?.label}
        </h2>
        <p className="mb-6 text-sm text-white/58">{activeConfig?.desc}</p>
        {activeTab === 'middle' && <MiddleCalculator />}
        {activeTab === 'valuebet' && <ValueBetCalculator />}
        {activeTab === 'asian' && <AsianHandicapCalculator />}
        {activeTab === 'hedge' && <HedgeCalculator />}
      </div>

      {/* Educational note */}
      <div className="glass-panel rounded-[24px] p-5 border border-white/8">
        <h3 className="font-semibold text-white mb-3">📖 Wskazówki do zaawansowanych strategii</h3>
        <ul className="space-y-2 text-sm text-white/60 list-disc list-inside">
          <li>Middle betting wymaga cierpliwości i śledzenia ruchów na liniach handicapów.</li>
          <li>ValueBet wymaga dokładnej oceny prawdopodobieństwa – modele statystyczne pomagają.</li>
          <li>Handicapy azjatyckie minimalizują ryzyko dzięki częściowym zwrotom stawki.</li>
          <li>Kalkulator kontrowania jest przydatny gdy rynek zostaje zamknięty przez bukmachera.</li>
          <li>W trudnych sytuacjach zachowaj spokój – sprawdź alternatywnych bukmacherów przed kontrą.</li>
        </ul>
      </div>
    </div>
  );
}
