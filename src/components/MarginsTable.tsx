"use client";

import { useMemo, useState } from "react";
import { BookmakerMarginStats } from "@/lib/data-service";
import BookmakerIcon from "./BookmakerIcon";

type MarketFilter = "all" | "soccer" | "worldCup" | "basketball";

const MARKET_META: Record<MarketFilter, { label: string; icon: string }> = {
  all: { label: "Wszystkie rynki", icon: "∑" },
  soccer: { label: "Piłka nożna", icon: "⚽" },
  worldCup: { label: "Mistrzostwa Świata", icon: "🏆" },
  basketball: { label: "Koszykówka", icon: "🏀" },
};

function marginTone(value: number) {
  if (value < 3) return { bar: "bg-emerald-400", text: "text-emerald-300" };
  if (value < 5) return { bar: "bg-sky-400", text: "text-sky-300" };
  if (value < 6.5) return { bar: "bg-amber-400", text: "text-amber-300" };
  return { bar: "bg-rose-400", text: "text-rose-300" };
}

function MarginBar({ value, count }: { value: number; count?: number }) {
  const pct = Math.min((value / 10) * 100, 100);
  const tone = marginTone(value);
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10 sm:w-20">
        <div
          className={`h-full rounded-full transition-all duration-500 ${tone.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-mono text-sm font-semibold tabular-nums ${tone.text}`}>
        {value.toFixed(2)}%
      </span>
      {typeof count === "number" && (
        <span className="font-mono text-[10px] text-white/35 tabular-nums">×{count}</span>
      )}
    </div>
  );
}

export default function MarginsTable({ stats }: { stats: BookmakerMarginStats[] }) {
  const [market, setMarket] = useState<MarketFilter>("all");

  const rows = useMemo(() => {
    const list = stats
      .map((s) => {
        const stat =
          market === "all"
            ? { margin: s.avgMargin, count: s.eventCount }
            : s[market];
        return stat ? { ...s, activeMargin: stat.margin, activeCount: stat.count } : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    return list.sort((a, b) => a.activeMargin - b.activeMargin);
  }, [stats, market]);

  if (stats.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-10 text-center">
        <p className="text-base font-semibold text-white">Brak danych o marżach</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
          Marże liczone są z realnie zeskanowanych kursów. Kliknij{" "}
          <span className="font-semibold text-sky-300">„Skanuj kursy"</span> w panelu bocznym,
          aby pobrać aktualne dane od bukmacherów.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {(Object.keys(MARKET_META) as MarketFilter[]).map((m) => (
          <button
            key={m}
            onClick={() => setMarket(m)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              market === m
                ? "border border-sky-300/30 bg-sky-400/15 text-sky-100 shadow-[0_0_18px_-6px_rgba(56,189,248,0.45)]"
                : "border border-white/12 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="mr-1.5">{MARKET_META[m].icon}</span>
            {MARKET_META[m].label}
          </button>
        ))}
      </div>

      {/* Podium — three lowest margins for the selected market */}
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.slice(0, 3).map((bm, idx) => {
          const tone = marginTone(bm.activeMargin);
          return (
            <div
              key={bm.key}
              className={`glass-panel card-hover relative overflow-hidden rounded-xl p-4 ${
                idx === 0 ? "ring-1 ring-emerald-400/25" : ""
              }`}
            >
              <div className="absolute right-3 top-3 font-mono text-[40px] font-bold leading-none text-white/[0.06]">
                {idx + 1}
              </div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                {idx === 0 ? "Najniższa marża" : `Miejsce ${idx + 1}`}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <BookmakerIcon bookmakerKey={bm.key} size={20} />
                <p className="truncate text-base font-semibold text-white">{bm.title}</p>
              </div>
              <p className={`mt-2 font-mono text-2xl font-bold tabular-nums ${tone.text}`}>
                {bm.activeMargin.toFixed(2)}%
              </p>
              <p className="mt-1 text-xs text-white/45">
                z {bm.activeCount} {bm.activeCount === 1 ? "rynku" : "rynków"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile cards */}
      <div className="glass-panel overflow-hidden rounded-xl md:hidden">
        <div className="divide-y divide-white/8 p-1">
          {rows.map((bm, idx) => (
            <div key={bm.key} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="font-mono text-xs text-white/30">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <BookmakerIcon bookmakerKey={bm.key} size={16} />
                  <p className="truncate text-sm font-semibold text-white">{bm.title}</p>
                </div>
                <MarginBar value={bm.activeMargin} />
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/50">
                {bm.soccer && (
                  <span>
                    ⚽ <span className="font-mono tabular-nums">{bm.soccer.margin.toFixed(2)}%</span>
                  </span>
                )}
                {bm.worldCup && (
                  <span>
                    🏆 <span className="font-mono tabular-nums">{bm.worldCup.margin.toFixed(2)}%</span>
                  </span>
                )}
                {bm.basketball && (
                  <span>
                    🏀{" "}
                    <span className="font-mono tabular-nums">{bm.basketball.margin.toFixed(2)}%</span>
                  </span>
                )}
                <span className="text-white/35">
                  zakres{" "}
                  <span className="font-mono tabular-nums">
                    {bm.minMargin.toFixed(1)}–{bm.maxMargin.toFixed(1)}%
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="glass-panel hidden overflow-hidden rounded-xl md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-[0.14em] text-white/40">
              <th className="px-4 py-3.5 font-medium">#</th>
              <th className="px-4 py-3.5 font-medium">Bukmacher</th>
              <th className="px-4 py-3.5 font-medium">
                Marża {market === "all" ? "średnia" : `· ${MARKET_META[market].label}`}
              </th>
              <th className="px-4 py-3.5 font-medium">⚽ Piłka</th>
              <th className="px-4 py-3.5 font-medium">🏆 MŚ 2026</th>
              <th className="px-4 py-3.5 font-medium">🏀 Kosz</th>
              <th className="px-4 py-3.5 font-medium">Zakres</th>
              <th className="px-4 py-3.5 font-medium">Próbka</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((bm, idx) => (
              <tr
                key={bm.key}
                className="border-b border-white/6 transition last:border-0 hover:bg-white/[0.04]"
              >
                <td className="px-4 py-3.5 font-mono text-white/30 tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <BookmakerIcon bookmakerKey={bm.key} size={18} />
                    <span className="font-semibold text-white">{bm.title}</span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      PL
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <MarginBar value={bm.activeMargin} />
                </td>
                <td className="px-4 py-3.5">
                  {bm.soccer ? (
                    <MarginBar value={bm.soccer.margin} count={bm.soccer.count} />
                  ) : (
                    <span className="text-white/25">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {bm.worldCup ? (
                    <MarginBar value={bm.worldCup.margin} count={bm.worldCup.count} />
                  ) : (
                    <span className="text-white/25">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {bm.basketball ? (
                    <MarginBar value={bm.basketball.margin} count={bm.basketball.count} />
                  ) : (
                    <span className="text-white/25">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-white/45 tabular-nums">
                  {bm.minMargin.toFixed(1)}–{bm.maxMargin.toFixed(1)}%
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-white/45 tabular-nums">
                  {bm.eventCount} rynków
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
