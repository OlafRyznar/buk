"use client";

import { useState } from "react";
import { calculateArbitrageStakes } from "@/lib/arbitrage";
import { useApp } from "@/components/AppProvider";
import Link from "next/link";

type CalcMode = "standard" | "hedge";

const OUTCOME_LABELS = ["Wynik 1 (Gospodarz)", "Remis", "Wynik 3 (Gość)"];

function getTomorrowIsoString() {
  return new Date(Date.now() + 86400000).toISOString();
}

interface ArbitrageCalculatorProps {
  prefillEventName?: string;
  prefillOdds?: number[];
  prefillBookmakers?: string[];
}

export default function ArbitrageCalculator({
  prefillEventName,
  prefillOdds,
  prefillBookmakers,
}: ArbitrageCalculatorProps) {
  const { settings, addJournalEntry, deductVirtualBalance, bookmakerBalances } = useApp();

  const [mode, setMode] = useState<CalcMode>("standard");
  const [numOutcomes, setNumOutcomes] = useState(prefillOdds?.length ?? 2);
  const [odds, setOdds] = useState<number[]>(
    prefillOdds ?? [2.1, 2.1, 0]
  );
  const [bookmakers, setBookmakers] = useState<string[]>(
    prefillBookmakers ?? ["", "", ""]
  );
  const [stake, setStake] = useState(1000);
  const [eventName, setEventName] = useState(prefillEventName ?? "");
  const [showNetOdds, setShowNetOdds] = useState(false);
  const [savedToJournal, setSavedToJournal] = useState(false);
  const [playedDemo, setPlayedDemo] = useState(false);

  // Hedge mode
  const [hedgeOriginalStake, setHedgeOriginalStake] = useState(500);
  const [hedgeOriginalOdds, setHedgeOriginalOdds] = useState(3.5);
  const [hedgeNewOdds, setHedgeNewOdds] = useState(1.8);

  // Apply tax to get net odds
  const effectiveOdds = odds.slice(0, numOutcomes).map((o) => {
    if (!showNetOdds || o <= 1) return o;
    const tax = settings.taxRate / 100;
    return 1 + (o - 1) * (1 - tax);
  });

  const result = calculateArbitrageStakes(
    effectiveOdds.filter((o) => o > 1),
    stake
  );

  // Rounding
  const roundedStakes =
    result.isArbitrage && settings.roundingEnabled
      ? result.stakes.map(
          (s) => Math.round(s / settings.roundingStep) * settings.roundingStep
        )
      : result.stakes;

  const totalRoundedStake = roundedStakes.reduce((s, v) => s + v, 0);

  const guaranteedProfit = result.isArbitrage
    ? settings.roundingEnabled
      ? roundedStakes[0] * effectiveOdds[0] - totalRoundedStake
      : result.stakes[0] * effectiveOdds[0] - stake
    : 0;

  const totalImplied = effectiveOdds.reduce(
    (s, o) => (o > 1 ? s + 100 / o : s),
    0
  );

  const handleOddsChange = (idx: number, val: string) => {
    const newOdds = [...odds];
    newOdds[idx] = parseFloat(val) || 1.01;
    setOdds(newOdds);
  };

  const handleBookmakerChange = (idx: number, val: string) => {
    const newBm = [...bookmakers];
    newBm[idx] = val;
    setBookmakers(newBm);
  };

  const handleOutcomeCount = (n: number) => {
    setNumOutcomes(n);
    if (n > odds.length) {
      setOdds([...odds, ...Array(n - odds.length).fill(2.0)]);
    } else {
      setOdds([...odds.slice(0, n), ...Array(3 - n).fill(0)]);
    }
  };

  // Balance warnings
  const balanceWarnings = bookmakers
    .slice(0, numOutcomes)
    .map((bm, i) => {
      if (!bm || !result.isArbitrage) return null;
      const bal = bookmakerBalances.find(
        (b) =>
          b.bookmakerName.toLowerCase() === bm.toLowerCase() ||
          b.bookmakerKey.toLowerCase() === bm.toLowerCase().replace(/\s+/g, "")
      );
      if (!bal) return null;
      const stakeForBet = settings.roundingEnabled ? roundedStakes[i] : result.stakes[i];
      if (stakeForBet > bal.balance) {
        return `Niewystarczające saldo u ${bm}: ${bal.balance.toFixed(2)} zł < ${stakeForBet.toFixed(2)} zł`;
      }
      return null;
    })
    .filter(Boolean) as string[];

  const saveToJournal = () => {
    if (!result.isArbitrage) return;
    addJournalEntry({
      eventName: eventName || "Zdarzenie z kalkulatora",
      sportTitle: "Własny",
      commenceTime: getTomorrowIsoString(),
      marketKey: "h2h",
      bets: odds.slice(0, numOutcomes).map((o, i) => ({
        bookmaker: bookmakers[i] || `Bukmacher ${i + 1}`,
        bookmakerKey:
          bookmakers[i]?.toLowerCase().replace(/\s+/g, "") || `bm${i}`,
        outcome: OUTCOME_LABELS[i] ?? `Wynik ${i + 1}`,
        odds: o,
        stake: settings.roundingEnabled ? roundedStakes[i] : result.stakes[i],
        potentialReturn:
          (settings.roundingEnabled ? roundedStakes[i] : result.stakes[i]) * o,
        result: "pending" as const,
      })),
      totalStake: settings.roundingEnabled ? totalRoundedStake : stake,
      guaranteedReturn: settings.roundingEnabled
        ? roundedStakes[0] * effectiveOdds[0]
        : result.stakes[0] * effectiveOdds[0],
      profit: guaranteedProfit,
      profitPercent: result.profit,
      status: "pending",
      notes: "",
      isDemo: true,
    });
    setSavedToJournal(true);
    setTimeout(() => setSavedToJournal(false), 3000);
  };

  const playDemo = () => {
    if (!result.isArbitrage) return;
    const totalS = settings.roundingEnabled ? totalRoundedStake : stake;
    if (totalS > settings.virtualBalance) {
      alert(
        `Niewystarczające saldo demo: potrzeba ${totalS.toFixed(2)} zł, masz ${settings.virtualBalance.toFixed(2)} zł`
      );
      return;
    }
    deductVirtualBalance(totalS);
    saveToJournal();
    setPlayedDemo(true);
    setTimeout(() => setPlayedDemo(false), 3000);
  };

  // Hedge mode calculations
  const hedgePotentialWin = hedgeOriginalStake * hedgeOriginalOdds;
  const hedgeStakeNeeded = hedgeNewOdds > 1 ? hedgePotentialWin / hedgeNewOdds : 0;
  const hedgeProfitIfOrig =
    hedgePotentialWin - hedgeOriginalStake - hedgeStakeNeeded;
  const hedgeProfitIfNew =
    hedgeStakeNeeded * hedgeNewOdds - hedgeStakeNeeded - hedgeOriginalStake;

  return (
    <div className="glass-panel space-y-6 rounded-[28px] p-4 sm:p-6">
      {/* Header + mode toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-white flex-1">
          {mode === "standard"
            ? "🧮 Kalkulator Arbitrażu"
            : "🛡️ Tryb Ratunkowy (Kontrowanie)"}
        </h2>
        <button
          onClick={() => setMode(mode === "standard" ? "hedge" : "standard")}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-medium transition sm:w-auto ${
            mode === "hedge"
              ? "border-amber-300/25 bg-amber-300/10 text-amber-200"
              : "border-white/15 bg-white/8 text-white/60 hover:text-white"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          {mode === "standard" ? "Tryb Ratunkowy" : "Powrót do Standardowego"}
        </button>
      </div>

      {mode === "hedge" ? (
        /* ── Hedge / Rescue mode ─────────────────────────────────────────── */
        <div className="space-y-4">
          <div className="rounded-[22px] border border-amber-300/20 bg-amber-300/8 p-4 text-sm text-amber-100/80">
            Zdążyłeś postawić tylko jeden zakład? Wpisz oryginalną stawkę i
            kurs, a następnie nowy (zmieniony) kurs kontry — kalkulator wskaże
            optymalną stawkę minimalizującą stratę lub zapewniającą zysk.
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                {
                  l: "Postawiona stawka (zł)",
                  v: hedgeOriginalStake,
                  s: setHedgeOriginalStake,
                  step: 10,
                },
                {
                  l: "Oryginalny kurs",
                  v: hedgeOriginalOdds,
                  s: setHedgeOriginalOdds,
                  step: 0.01,
                },
                {
                  l: "Nowy kurs (kontry)",
                  v: hedgeNewOdds,
                  s: setHedgeNewOdds,
                  step: 0.01,
                },
              ] as const
            ).map(({ l, v, s, step }) => (
              <div key={l}>
                <label className="block text-xs text-white/42 mb-2">{l}</label>
                <input
                  type="number"
                  value={v}
                  step={step}
                  min={1.01}
                  onChange={(e) => s(parseFloat(e.target.value) || 1.01)}
                  className="w-full rounded-[16px] border border-white/12 bg-white/8 px-4 py-3 text-white font-mono focus:border-white/25 focus:outline-none"
                />
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                l: "Stawka kontrująca",
                v: `${hedgeStakeNeeded.toFixed(2)} zł`,
                c: "text-sky-200",
              },
              {
                l: "Łącznie zaangażowane",
                v: `${(hedgeOriginalStake + hedgeStakeNeeded).toFixed(2)} zł`,
                c: "text-white",
              },
              {
                l: "Jeśli wygra oryginał",
                v: `${hedgeProfitIfOrig >= 0 ? "+" : ""}${hedgeProfitIfOrig.toFixed(2)} zł`,
                c: hedgeProfitIfOrig >= 0 ? "text-emerald-300" : "text-rose-300",
              },
              {
                l: "Jeśli wygra kontra",
                v: `${hedgeProfitIfNew >= 0 ? "+" : ""}${hedgeProfitIfNew.toFixed(2)} zł`,
                c:
                  hedgeProfitIfNew >= 0 ? "text-emerald-300" : "text-rose-300",
              },
            ].map(({ l, v, c }) => (
              <div
                key={l}
                className="rounded-[20px] border border-white/10 bg-white/6 p-4"
              >
                <p className="text-xs text-white/40">{l}</p>
                <p className={`text-xl font-bold font-mono mt-2 ${c}`}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Standard mode ───────────────────────────────────────────────── */
        <>
          {/* Event name + stake */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-white/42 mb-2">
                Nazwa zdarzenia (opcja)
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="np. Arsenal vs Chelsea"
                className="w-full rounded-[16px] border border-white/12 bg-white/8 px-4 py-3 text-white placeholder-white/25 focus:border-white/25 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/42 mb-2">
                Całkowita stawka (zł)
              </label>
              <input
                type="number"
                value={stake}
                min={1}
                onChange={(e) => setStake(parseFloat(e.target.value) || 100)}
                className="w-full rounded-[16px] border border-white/12 bg-white/8 px-4 py-3 text-white font-mono focus:border-white/25 focus:outline-none"
              />
            </div>
          </div>

          {/* Config row */}
          <div className="flex flex-wrap items-center gap-2">
            {[2, 3].map((n) => (
              <button
                key={n}
                onClick={() => handleOutcomeCount(n)}
                className={`rounded-2xl border px-4 py-2 text-sm transition ${
                  numOutcomes === n
                    ? "border-sky-300/25 bg-sky-300/15 text-sky-100"
                    : "border-white/12 bg-white/6 text-white/55 hover:text-white hover:bg-white/10"
                }`}
              >
                {n} wyniki
              </button>
            ))}
            <button
              onClick={() => setShowNetOdds(!showNetOdds)}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm transition sm:w-auto ${
                showNetOdds
                  ? "border-amber-300/25 bg-amber-300/10 text-amber-200"
                  : "border-white/12 bg-white/6 text-white/55 hover:text-white hover:bg-white/10"
              }`}
            >
              🇵🇱 Netto ({settings.taxRate}% podatek)
            </button>
            {settings.roundingEnabled && (
              <span className="w-full rounded-2xl border border-white/12 bg-white/6 px-3 py-2 text-xs text-white/50 sm:w-auto">
                Zaokrąglenie: {settings.roundingStep} zł
              </span>
            )}
          </div>

          {/* Odds + bookmaker inputs */}
          <div className="space-y-3">
            {odds.slice(0, numOutcomes).map((odd, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/4 p-3 md:rounded-none md:border-0 md:bg-transparent md:p-0">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                  <label className="text-sm text-white/50 md:w-44 md:shrink-0">
                  {OUTCOME_LABELS[idx] ?? `Wynik ${idx + 1}`}
                  </label>
                  <div className="grid flex-1 grid-cols-[92px_minmax(0,1fr)_auto] items-center gap-2">
                    <input
                      type="number"
                      value={odd}
                      step="0.01"
                      min="1.01"
                      onChange={(e) => handleOddsChange(idx, e.target.value)}
                      className="w-full rounded-[16px] border border-white/12 bg-white/8 px-3 py-2.5 text-right font-mono text-white focus:border-white/25 focus:outline-none"
                      placeholder="2.00"
                    />
                    <input
                      type="text"
                      value={bookmakers[idx]}
                      onChange={(e) => handleBookmakerChange(idx, e.target.value)}
                      placeholder={`Bukmacher ${idx + 1}`}
                      className="min-w-0 rounded-[16px] border border-white/12 bg-white/8 px-3 py-2.5 text-sm text-white placeholder-white/25 focus:border-white/25 focus:outline-none"
                    />
                    <span className="w-12 text-right font-mono text-xs text-white/35">
                      {odd > 1 ? `${(100 / odd).toFixed(1)}%` : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Implied probability bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/42">
                Suma prawdopodobieństw implikowanych
                {showNetOdds ? " (netto)" : ""}
              </span>
              <span
                className={`font-mono font-bold text-sm ${
                  result.isArbitrage ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {totalImplied.toFixed(2)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  result.isArbitrage
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    : "bg-gradient-to-r from-rose-500 to-rose-400"
                }`}
                style={{ width: `${Math.min(totalImplied, 120)}%` }}
              />
            </div>
            <p className="text-xs text-white/35 mt-1">
              {result.isArbitrage
                ? "✅ Poniżej 100% = ARBITRAŻ DOSTĘPNY"
                : `❌ Powyżej 100% = brak arbitrażu (różnica: ${(totalImplied - 100).toFixed(2)}%)`}
            </p>
          </div>

          {/* Balance warnings */}
          {balanceWarnings.length > 0 && (
            <div className="rounded-[18px] border border-rose-300/20 bg-rose-300/6 p-4 space-y-1">
              {balanceWarnings.map((w, i) => (
                <p key={i} className="text-xs text-rose-200">
                  ⚠️ {w}
                </p>
              ))}
              <Link
                href="/settings"
                className="text-xs text-rose-300 hover:underline"
              >
                Zaktualizuj saldo →
              </Link>
            </div>
          )}

          {/* Results */}
          {result.isArbitrage ? (
            <div className="rounded-[24px] border border-emerald-300/25 bg-emerald-300/6 p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-lg text-emerald-200">
                  🎯 Surebet! Zysk: {result.profit}%
                </h3>
                <div className="w-full text-left sm:w-auto sm:text-right">
                  <p className="text-xs text-white/40">Wirtualne saldo</p>
                  <p className="text-sm font-mono text-amber-200">
                    {settings.virtualBalance.toLocaleString("pl-PL")} zł
                  </p>
                </div>
              </div>

              {/* Stakes on mobile */}
              <div className="space-y-2 md:hidden">
                {result.stakes.map((s, idx) => {
                  const roundedS = settings.roundingEnabled ? roundedStakes[idx] : s;
                  return (
                    <div key={idx} className="rounded-xl border border-white/12 bg-black/18 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {OUTCOME_LABELS[idx] ?? `Wynik ${idx + 1}`}
                          </p>
                          <p className="text-xs text-white/52">{bookmakers[idx] || "—"}</p>
                        </div>
                        <p className="text-right text-xs text-white/56">
                          Kurs {showNetOdds ? "netto" : ""}: <span className="font-mono text-amber-200">{effectiveOdds[idx].toFixed(2)}</span>
                        </p>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 rounded-md border border-white/10 bg-white/4 p-2">
                        <div>
                          <p className="text-[11px] text-white/42">Stawka</p>
                          <p
                            className={`text-sm font-mono ${
                              settings.roundingEnabled && roundedS !== s ? "text-amber-100" : "text-white"
                            }`}
                          >
                            {roundedS.toFixed(2)} zł
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-white/42">Wygrana</p>
                          <p className="text-sm font-mono text-emerald-300">
                            {(roundedS * effectiveOdds[idx]).toFixed(2)} zł
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stakes table on larger screens */}
              <div className="hidden overflow-hidden rounded-[20px] border border-white/10 bg-black/20 md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-3 text-left text-xs text-white/40">Wynik</th>
                      <th className="p-3 text-left text-xs text-white/40">Bukmacher</th>
                      <th className="p-3 text-right text-xs text-white/40">
                        Kurs{showNetOdds ? " (netto)" : ""}
                      </th>
                      <th className="p-3 text-right text-xs text-white/40">
                        Stawka
                        {settings.roundingEnabled ? " (zaokr.)" : ""}
                      </th>
                      <th className="p-3 text-right text-xs text-white/40">Wygrana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.stakes.map((s, idx) => {
                      const roundedS = settings.roundingEnabled ? roundedStakes[idx] : s;
                      return (
                        <tr key={idx} className="border-b border-white/6 last:border-0">
                          <td className="p-3 text-white">{OUTCOME_LABELS[idx] ?? `Wynik ${idx + 1}`}</td>
                          <td className="p-3 text-xs text-white/60">{bookmakers[idx] || "—"}</td>
                          <td className="p-3 text-right font-mono text-amber-200">{effectiveOdds[idx].toFixed(2)}</td>
                          <td
                            className={`p-3 text-right font-mono ${
                              settings.roundingEnabled && roundedS !== s ? "text-amber-100" : "text-white"
                            }`}
                          >
                            {roundedS.toFixed(2)} zł
                          </td>
                          <td className="p-3 text-right font-mono text-emerald-300">
                            {(roundedS * effectiveOdds[idx]).toFixed(2)} zł
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex flex-wrap gap-4 items-center justify-between pt-2 border-t border-white/10">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-white/50">
                    Łączna stawka:{" "}
                    <span className="font-mono text-white">
                      {(
                        settings.roundingEnabled ? totalRoundedStake : stake
                      ).toFixed(2)}{" "}
                      zł
                    </span>
                  </span>
                  <span className="text-white/50">
                    Gwarantowany zysk:{" "}
                    <span className="font-bold font-mono text-emerald-300">
                      +{guaranteedProfit.toFixed(2)} zł
                    </span>
                  </span>
                </div>
              </div>

              {/* Decoy bet tip */}
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-white/50">
                  💡 <strong className="text-white/65">Puste zdarzenie:</strong>{" "}
                  Aby wyglądać jak gracz rekreacyjny, rozważ dodanie do kuponu
                  neutralnego zdarzenia z kursem ~1.02 (np. pewny faworyt).
                  Zwiększa łączny kurs kuponu bez ryzyka straty zysku.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={playDemo}
                  disabled={playedDemo}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition sm:w-auto ${
                    playedDemo
                      ? "bg-emerald-500/20 text-emerald-300 cursor-default"
                      : "bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95"
                  }`}
                >
                  {playedDemo ? "✓ Zagrano!" : "🎮 Zagraj (demo)"}
                </button>
                <button
                  onClick={saveToJournal}
                  disabled={savedToJournal}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-medium transition sm:w-auto ${
                    savedToJournal
                      ? "border-emerald-300/20 bg-emerald-300/8 text-emerald-300 cursor-default"
                      : "border-white/15 bg-white/8 text-white/70 hover:text-white hover:bg-white/14"
                  }`}
                >
                  {savedToJournal ? "✓ Zapisano!" : "📒 Zapisz do Dziennika"}
                </button>
                <Link
                  href="/journal"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-5 py-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  Dziennik →
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-rose-300/20 bg-rose-300/5 p-5 text-center">
              <p className="font-semibold text-rose-200 mb-1">
                Brak arbitrażu przy tych kursach
              </p>
              <p className="text-sm text-white/50">
                Suma prawdopodobieństw: {totalImplied.toFixed(2)}% — potrzeba
                poniżej 100%. Spróbuj znaleźć wyższe kursy u różnych
                bukmacherów.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
