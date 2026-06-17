"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { effectiveOdds, roundStake, DEFAULT_TAX_FREE_KEYS } from "@/lib/arbitrage";
import { ALL_BOOKMAKERS, TAX_FREE_BOOKMAKER_KEYS } from "@/lib/store-types";
import Link from "next/link";

interface Row {
  id: string;
  outcome: string;
  odds: string;
  bookmakerKey: string;
}

const MAX_ROWS = 6;
const MIN_ROWS = 2;

let rowCounter = 0;
function makeRow(outcome = ""): Row {
  rowCounter += 1;
  return { id: `row-${rowCounter}`, outcome, odds: "", bookmakerKey: "" };
}

function parseOdds(value: string): number {
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function bookmakerName(key: string): string {
  return ALL_BOOKMAKERS.find((b) => b.key === key)?.name ?? "—";
}

export default function ManualCalculator() {
  const { settings, addJournalEntry } = useApp();

  const [eventName, setEventName] = useState("");
  const [sportTitle, setSportTitle] = useState("");
  const [stakeInput, setStakeInput] = useState("1000");
  const [rows, setRows] = useState<Row[]>([makeRow("1"), makeRow("2")]);
  const [added, setAdded] = useState(false);

  const totalStake = useMemo(() => {
    const n = parseFloat(stakeInput.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [stakeInput]);

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setAdded(false);
  };

  const addRow = () => {
    setRows((prev) => (prev.length >= MAX_ROWS ? prev : [...prev, makeRow()]));
    setAdded(false);
  };

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length <= MIN_ROWS ? prev : prev.filter((r) => r.id !== id)));
    setAdded(false);
  };

  // Live computation — mirrors the after-tax surebet math used across the app.
  const result = useMemo(() => {
    const valid = rows
      .map((r) => ({ row: r, odds: parseOdds(r.odds) }))
      .filter((x) => x.odds > 1);

    if (valid.length < 2 || totalStake <= 0) return null;

    const netOdds = valid.map((x) =>
      effectiveOdds(x.odds, x.row.bookmakerKey, settings.taxRate, DEFAULT_TAX_FREE_KEYS)
    );
    const totalImplied = netOdds.reduce((sum, o) => sum + 1 / o, 0);

    let stakes = netOdds.map((o) => (totalStake * (1 / o)) / totalImplied);
    if (settings.roundingEnabled && settings.roundingStep > 0) {
      stakes = stakes.map((s) => roundStake(s, settings.roundingStep));
    }

    const returns = stakes.map((s, i) => s * netOdds[i]);
    const actualStake = stakes.reduce((a, b) => a + b, 0);
    const guaranteedReturn = Math.min(...returns);
    const profitZl = guaranteedReturn - actualStake;
    const profitPercent = actualStake > 0 ? (guaranteedReturn / actualStake - 1) * 100 : 0;

    return {
      isArbitrage: totalImplied < 1,
      totalImplied,
      actualStake,
      guaranteedReturn,
      profitZl,
      profitPercent,
      bets: valid.map((x, i) => ({
        outcome: x.row.outcome.trim() || `Wynik ${i + 1}`,
        bookmakerKey: x.row.bookmakerKey,
        bookmaker: x.row.bookmakerKey ? bookmakerName(x.row.bookmakerKey) : "—",
        odds: x.odds,
        stake: stakes[i],
        potentialReturn: returns[i],
      })),
    };
  }, [rows, totalStake, settings.taxRate, settings.roundingEnabled, settings.roundingStep]);

  const taxFreeSelected = rows.filter((r) =>
    TAX_FREE_BOOKMAKER_KEYS.includes(r.bookmakerKey)
  );
  const taxCaption =
    settings.taxRate === 0
      ? "Bez podatku od wygranych (stawka w Ustawieniach: 0%)."
      : taxFreeSelected.length > 0
        ? `Uwzględniono ${settings.taxRate}% podatku (poza ${taxFreeSelected
            .map((r) => bookmakerName(r.bookmakerKey))
            .join(", ")} — bez podatku).`
        : `Uwzględniono ${settings.taxRate}% podatku od wygranych.`;

  const handleAdd = () => {
    if (!result) return;
    const profit = Math.round(result.profitZl * 100) / 100;
    const profitPercent = Math.round(result.profitPercent * 100) / 100;

    addJournalEntry({
      eventName: eventName.trim() || "Kalkulator ręczny",
      sportTitle: sportTitle.trim() || "Kalkulator",
      commenceTime: new Date().toISOString(),
      marketKey: "manual",
      bets: result.bets.map((b) => ({
        bookmaker: b.bookmaker,
        bookmakerKey: b.bookmakerKey,
        outcome: b.outcome,
        odds: Math.round(b.odds * 100) / 100,
        stake: Math.round(b.stake * 100) / 100,
        potentialReturn: Math.round(b.potentialReturn * 100) / 100,
        result: "pending",
      })),
      totalStake: Math.round(result.actualStake * 100) / 100,
      guaranteedReturn: Math.round(result.guaranteedReturn * 100) / 100,
      profit,
      profitPercent,
      status: "pending",
      notes: "Dodano z Kalkulatora.",
      isDemo: false,
    });
    setAdded(true);
  };

  const inputClass =
    "w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-sky-400/50 focus:outline-none transition";

  return (
    <div className="glass-panel rounded-xl border border-white/14 bg-white/5 p-5 sm:p-6">
      {/* Event meta */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-white/55">
            Nazwa wydarzenia <span className="text-white/30">(opcjonalnie)</span>
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => {
              setEventName(e.target.value);
              setAdded(false);
            }}
            placeholder="np. Real Madrid vs Barcelona"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/55">
            Łączna stawka
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={stakeInput}
              onChange={(e) => {
                setStakeInput(e.target.value);
                setAdded(false);
              }}
              className={`${inputClass} pr-10 text-right font-mono`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
              zł
            </span>
          </div>
        </div>
      </div>

      {/* Outcome rows */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Kursy</h3>
          <span className="text-xs text-white/40">
            {rows.length}/{MAX_ROWS} wyników
          </span>
        </div>

        <div className="space-y-2.5">
          {rows.map((row, idx) => {
            const odds = parseOdds(row.odds);
            const invalid = row.odds.trim() !== "" && odds <= 1;
            return (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/6 text-xs font-bold text-white/50">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={row.outcome}
                  onChange={(e) => updateRow(row.id, { outcome: e.target.value })}
                  placeholder="Wynik (np. 1, X, 2)"
                  className={`${inputClass} min-w-[120px] flex-1`}
                />
                <select
                  value={row.bookmakerKey}
                  onChange={(e) => updateRow(row.id, { bookmakerKey: e.target.value })}
                  className={`${inputClass} min-w-[140px] flex-1 cursor-pointer appearance-none`}
                >
                  <option value="" className="bg-[#11151a]">
                    Bukmacher (opcjonalnie)
                  </option>
                  {ALL_BOOKMAKERS.map((b) => (
                    <option key={b.key} value={b.key} className="bg-[#11151a]">
                      {b.name}
                    </option>
                  ))}
                </select>
                <div className="relative w-[110px] shrink-0">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min={1}
                    value={row.odds}
                    onChange={(e) => updateRow(row.id, { odds: e.target.value })}
                    placeholder="Kurs"
                    className={`${inputClass} text-right font-mono ${
                      invalid ? "border-rose-400/50 text-rose-200" : ""
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= MIN_ROWS}
                  aria-label="Usuń wynik"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_ROWS}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Dodaj wynik
        </button>
      </div>

      {/* Results */}
      <div className="mt-6 border-t border-white/8 pt-5">
        {!result ? (
          <p className="text-sm text-white/40">
            Wpisz co najmniej 2 kursy (większe niż 1) oraz łączną stawkę, aby zobaczyć wynik.
          </p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/48">
                  {result.isArbitrage ? "Gwarantowany zysk (po podatku)" : "Po podatku: brak zysku"}
                </p>
                <p
                  className={`text-3xl font-bold ${
                    result.isArbitrage ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {result.isArbitrage
                    ? `+${result.profitPercent.toFixed(2)}%`
                    : "—"}
                </p>
              </div>
              <p className="max-w-[260px] text-right text-[11px] leading-4 text-white/35">
                {taxCaption}
              </p>
            </div>

            {!result.isArbitrage && (
              <div className="mb-4 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-xs leading-5 text-rose-200">
                Suma 1/kurs (po podatku) wynosi {(result.totalImplied * 100).toFixed(2)}% — ten
                układ nie jest surebetem. Stawki poniżej wyrównują zwrot, ale bez gwarantowanego
                zysku.
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-left font-medium text-white/50">Wynik</th>
                    <th className="p-3 text-left font-medium text-white/50">Bukmacher</th>
                    <th className="p-3 text-right font-medium text-white/50">Kurs</th>
                    <th className="p-3 text-right font-medium text-white/50">Stawka</th>
                    <th className="p-3 text-right font-medium text-white/50">Wygrana</th>
                  </tr>
                </thead>
                <tbody>
                  {result.bets.map((bet, idx) => (
                    <tr key={idx} className="border-b border-white/6 last:border-0">
                      <td className="p-3 font-medium text-white">{bet.outcome}</td>
                      <td className="p-3 text-white/75">{bet.bookmaker}</td>
                      <td className="p-3 text-right font-mono text-amber-200">
                        {bet.odds.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono text-white">
                        {bet.stake.toFixed(2)} zł
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-100">
                        {bet.potentialReturn.toFixed(2)} zł
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span className="text-white/40">
                Stawka łączna:{" "}
                <span className="font-mono font-medium text-white">
                  {result.actualStake.toFixed(2)} zł
                </span>
              </span>
              <span className="text-white/40">
                Zwrot:{" "}
                <span className="font-mono font-bold text-emerald-400">
                  {result.guaranteedReturn.toFixed(2)} zł
                </span>
              </span>
              <span className="text-white/40">
                Zysk:{" "}
                <span
                  className={`font-mono font-bold ${
                    result.profitZl >= 0 ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {result.profitZl >= 0 ? "+" : ""}
                  {result.profitZl.toFixed(2)} zł
                </span>
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Dodaj do dziennika
              </button>

              {added && (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dodano do dziennika
                  <Link href="/journal" className="text-sky-400 underline-offset-2 hover:underline">
                    Zobacz →
                  </Link>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
