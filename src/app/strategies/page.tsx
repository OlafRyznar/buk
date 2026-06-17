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

// ── Hedge Calculator ──────────────────────────────────────────────────────────
// "Kontrowanie": you already backed a team pre-match (or earlier in-play).
// Now you can also back another live outcome (typically the draw) to lock in
// a win on two of the three possible results. The third result — the one
// neither bet covers — is a real loss, not just a footnote, so it gets its
// own clearly-marked scenario instead of being left out of the math.

function HedgeCalculator() {
  const [hasThirdOutcome, setHasThirdOutcome] = useState(true);
  const [originalLabel, setOriginalLabel] = useState('Mój zespół wygrywa');
  const [originalStake, setOriginalStake] = useState(500);
  const [originalOdds, setOriginalOdds] = useState(3.5);
  const [hedgeLabel, setHedgeLabel] = useState('Remis');
  const [hedgeOdds, setHedgeOdds] = useState(1.8);
  const [thirdLabel, setThirdLabel] = useState('Rywal wygrywa');
  const [autoStake, setAutoStake] = useState(true);
  const [manualHedgeStake, setManualHedgeStake] = useState(280);

  const potentialWin = originalStake * originalOdds;
  const autoHedgeStake = potentialWin / hedgeOdds;
  const hedgeStake = autoStake ? autoHedgeStake : manualHedgeStake;
  const profitIfOriginalWins = potentialWin - originalStake - hedgeStake;
  const profitIfHedgeWins = hedgeStake * hedgeOdds - hedgeStake - originalStake;
  const lossIfThirdHappens = -(originalStake + hedgeStake);
  const totalStake = originalStake + hedgeStake;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-sky-500/20 bg-transparent p-4">
        <p className="text-sm text-sky-100/80">
          Już postawiłeś na jeden wynik. Teraz dokładasz zakład na inny wynik (np. remis) po
          aktualnym kursie live, żeby wygrać w obu przypadkach. Jeśli mecz ma trzeci możliwy
          wynik, którego nie obstawiasz w żadnym z dwóch zakładów — kalkulator pokazuje, ile
          stracisz, jeśli właśnie on się wydarzy.
        </p>
      </div>

      <div className="flex gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-1 w-fit">
        {[
          { v: true, l: '3 wyniki (z remisem)' },
          { v: false, l: '2 wyniki (bez remisu)' },
        ].map(({ v, l }) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => setHasThirdOutcome(v)}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
              hasThirdOutcome === v ? 'bg-sky-400/15 text-sky-200' : 'text-white/55 hover:text-white'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Zakład już postawiony</p>
          <div>
            <label className="block text-xs text-white/42 mb-1.5">Wynik</label>
            <input
              type="text"
              value={originalLabel}
              onChange={e => setOriginalLabel(e.target.value)}
              className="w-full rounded-[14px] border border-white/12 bg-white/8 px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/42 mb-1.5">Stawka (zł)</label>
              <input
                type="number"
                value={originalStake}
                step={10}
                min={1}
                onChange={e => setOriginalStake(parseFloat(e.target.value) || 1)}
                className="w-full rounded-[14px] border border-white/12 bg-white/8 px-3 py-2 text-sm text-white font-mono focus:border-white/25 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/42 mb-1.5">Kurs</label>
              <input
                type="number"
                value={originalOdds}
                step={0.01}
                min={1.01}
                onChange={e => setOriginalOdds(parseFloat(e.target.value) || 1.01)}
                className="w-full rounded-[14px] border border-white/12 bg-white/8 px-3 py-2 text-sm text-white font-mono focus:border-white/25 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-sky-500/15 bg-sky-500/[0.03] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-300">Kontra (live)</p>
          <div>
            <label className="block text-xs text-white/42 mb-1.5">Wynik</label>
            <input
              type="text"
              value={hedgeLabel}
              onChange={e => setHedgeLabel(e.target.value)}
              className="w-full rounded-[14px] border border-white/12 bg-white/8 px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-white/42 mb-1.5">Aktualny kurs live</label>
            <input
              type="number"
              value={hedgeOdds}
              step={0.01}
              min={1.01}
              onChange={e => setHedgeOdds(parseFloat(e.target.value) || 1.01)}
              className="w-full rounded-[14px] border border-white/12 bg-white/8 px-3 py-2 text-sm text-white font-mono focus:border-white/25 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs text-white/42">Stawka kontrująca</label>
              <div className="flex gap-1 rounded-md border border-white/10 bg-white/[0.03] p-0.5 text-[11px]">
                {[
                  { v: true, l: 'Auto' },
                  { v: false, l: 'Własna' },
                ].map(({ v, l }) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setAutoStake(v)}
                    className={`rounded px-2 py-0.5 transition ${
                      autoStake === v ? 'bg-sky-400/20 text-sky-200' : 'text-white/45 hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {autoStake ? (
              <div className="w-full rounded-[14px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm font-mono text-sky-200">
                {autoHedgeStake.toFixed(2)} zł
                <span className="ml-1.5 text-[11px] font-sans text-white/35">(wyrównuje zysk z oryginałem)</span>
              </div>
            ) : (
              <input
                type="number"
                value={manualHedgeStake}
                step={10}
                min={1}
                onChange={e => setManualHedgeStake(parseFloat(e.target.value) || 1)}
                className="w-full rounded-[14px] border border-white/12 bg-white/8 px-3 py-2 text-sm text-white font-mono focus:border-white/25 focus:outline-none"
              />
            )}
          </div>
        </div>
      </div>

      {hasThirdOutcome && (
        <div>
          <label className="block text-xs text-white/42 mb-1.5">Trzeci, nieobstawiony wynik</label>
          <input
            type="text"
            value={thirdLabel}
            onChange={e => setThirdLabel(e.target.value)}
            className="w-full max-w-sm rounded-[14px] border border-white/12 bg-white/8 px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
          />
        </div>
      )}

      <div className={`grid gap-3 sm:grid-cols-2 ${hasThirdOutcome ? 'lg:grid-cols-3' : ''}`}>
        <div className="rounded-xl border border-emerald-500/20 bg-transparent p-4">
          <p className="text-xs text-white/40">Jeśli: {originalLabel || 'oryginał'}</p>
          <p className={`mt-2 text-xl font-bold font-mono ${profitIfOriginalWins >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {profitIfOriginalWins >= 0 ? '+' : ''}{profitIfOriginalWins.toFixed(2)} zł
          </p>
        </div>
        <div className="rounded-xl border border-sky-500/20 bg-transparent p-4">
          <p className="text-xs text-white/40">Jeśli: {hedgeLabel || 'kontra'}</p>
          <p className={`mt-2 text-xl font-bold font-mono ${profitIfHedgeWins >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {profitIfHedgeWins >= 0 ? '+' : ''}{profitIfHedgeWins.toFixed(2)} zł
          </p>
        </div>
        {hasThirdOutcome && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4">
            <p className="text-xs text-rose-200/70">⚠ Jeśli: {thirdLabel || 'trzeci wynik'} (nieobstawiony)</p>
            <p className="mt-2 text-xl font-bold font-mono text-rose-300">
              {lossIfThirdHappens.toFixed(2)} zł
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-white/40">
        Łącznie zaangażowane: <span className="font-mono text-white/70">{totalStake.toFixed(2)} zł</span>
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Tab = 'valuebet' | 'hedge';

const TABS: { id: Tab; label: string; desc: string }[] = [
  { id: 'valuebet', label: 'ValueBet', desc: 'Znajdź zakłady z dodatnią wartością oczekiwaną' },
  { id: 'hedge', label: 'Kalkulator Kontrowania', desc: 'Dograj drugi zakład live i zobacz wszystkie scenariusze' },
];

const STRATEGY_GUIDES: Record<Tab, { intro: string }> = {
  valuebet: {
    intro:
      'ValueBet to zakład, gdzie Twój szacunek prawdopodobieństwa jest wyższy niż wycena bukmachera.',
  },
  hedge: {
    intro:
      'Kontrowanie polega na dograniu drugiego zakładu na inny wynik, gdy pierwszy już zagrałeś — żeby wygrać niezależnie od tego, który z obu trafi.',
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
        <p className="mt-1 text-white/52">Kalkulatory dla value-betów i kontrowania w trakcie meczu.</p>
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
      </div>

      {/* Active calculator */}
      <div className="glass-panel rounded-xl p-4 sm:p-6">
        <h2 className="text-lg font-bold text-white mb-1">
          Kalkulator: {activeConfig?.label}
        </h2>
        <p className="mb-6 text-xs text-white/40">{activeConfig?.desc}</p>
        {activeTab === 'valuebet' && <ValueBetCalculator />}
        {activeTab === 'hedge' && <HedgeCalculator />}
      </div>
    </div>
  );
}
