"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/components/AppProvider";
import { JournalEntry, JournalEntryStatus } from "@/lib/store-types";

const STATUS_META: Record<
  JournalEntryStatus,
  { label: string; dot: string; badge: string; accent: string }
> = {
  pending: {
    label: "Oczekuje",
    dot: "bg-amber-400",
    badge: "bg-amber-400/12 text-amber-200 border border-amber-300/20",
    accent: "before:bg-amber-400/70",
  },
  won: {
    label: "Wygrana",
    dot: "bg-emerald-400",
    badge: "bg-emerald-400/12 text-emerald-300 border border-emerald-300/20",
    accent: "before:bg-emerald-400/70",
  },
  lost: {
    label: "Przegrana",
    dot: "bg-rose-400",
    badge: "bg-rose-400/12 text-rose-300 border border-rose-300/20",
    accent: "before:bg-rose-400/70",
  },
  cancelled: {
    label: "Anulowany",
    dot: "bg-white/30",
    badge: "bg-white/8 text-white/40 border border-white/12",
    accent: "before:bg-white/20",
  },
};

const RESULT_ICON: Record<string, { char: string; cls: string }> = {
  win: { char: "✓", cls: "text-emerald-400" },
  loss: { char: "✗", cls: "text-rose-400" },
  pending: { char: "•", cls: "text-amber-300" },
};

function JournalEntryCard({
  entry,
  onUpdateStatus,
  onDelete,
  onUpdateNotes,
}: {
  entry: JournalEntry;
  onUpdateStatus: (id: string, status: JournalEntryStatus) => void;
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(entry.notes);
  const meta = STATUS_META[entry.status];

  return (
    <div
      className={`glass-panel animate-slide-up relative overflow-hidden rounded-xl p-4 pl-5 sm:p-5 sm:pl-6 before:absolute before:inset-y-0 before:left-0 before:w-[3px] ${meta.accent}`}
    >
      {/* Top row: event + profit */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${meta.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/35">
              {entry.sportTitle}
            </span>
            {entry.isDemo && (
              <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] text-white/35">
                demo
              </span>
            )}
          </div>
          <h3 className="break-words text-base font-semibold text-white">{entry.eventName}</h3>
          <p className="mt-1 text-xs text-white/40">
            Dodano {new Date(entry.createdAt).toLocaleDateString("pl-PL", { dateStyle: "medium" })}
            {" · "}start{" "}
            {new Date(entry.commenceTime).toLocaleString("pl-PL", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p
            className={`font-mono text-2xl font-bold tabular-nums ${
              entry.profit >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {entry.profit >= 0 ? "+" : ""}
            {entry.profit.toFixed(2)} zł
          </p>
          <p className="font-mono text-xs text-white/40 tabular-nums">
            {entry.profitPercent >= 0 ? "+" : ""}
            {entry.profitPercent.toFixed(2)}% · stawka {entry.totalStake.toFixed(0)} zł
          </p>
        </div>
      </div>

      {/* Quick status actions for pending entries — no digging in details */}
      {entry.status === "pending" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/8 pt-3">
          <span className="text-xs text-white/40">Rozlicz:</span>
          {(["won", "lost", "cancelled"] as JournalEntryStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => onUpdateStatus(entry.id, s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition hover:opacity-80 ${STATUS_META[s].badge}`}
            >
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
      )}

      {/* Expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white/70"
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {expanded ? "Zwiń" : `Zakłady (${entry.bets.length}), notatki`}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Bets */}
          <div className="overflow-hidden rounded-lg border border-white/10">
            {entry.bets.map((bet, i) => {
              const icon = RESULT_ICON[bet.result] ?? RESULT_ICON.pending;
              return (
                <div
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-white/8 px-3 py-2 text-xs last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`w-3 text-center ${icon.cls}`}>{icon.char}</span>
                    <span className="truncate font-medium text-white">{bet.outcome}</span>
                    <span className="truncate text-white/40">{bet.bookmaker}</span>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-3 font-mono tabular-nums">
                    <span className="text-amber-200">@{bet.odds.toFixed(2)}</span>
                    <span className="text-white">{bet.stake.toFixed(2)} zł</span>
                    <span className="text-white/45">→ {bet.potentialReturn.toFixed(2)} zł</span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-white/45">
            Gwarantowany zwrot:{" "}
            <span className="font-mono font-semibold text-white/80">
              {entry.guaranteedReturn.toFixed(2)} zł
            </span>
          </p>

          {/* Notes */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-white/40">Notatki</p>
              <button
                onClick={() => {
                  if (editingNotes) onUpdateNotes(entry.id, notes);
                  setEditingNotes(!editingNotes);
                }}
                className="text-xs text-sky-400 transition hover:text-sky-300"
              >
                {editingNotes ? "✓ Zapisz" : "Edytuj"}
              </button>
            </div>
            {editingNotes ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-sky-400/40 focus:outline-none"
                placeholder="Dodaj notatki do zakładu..."
              />
            ) : (
              <p className="text-sm italic text-white/50">{notes || "Brak notatek"}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => onDelete(entry.id)}
              className="text-xs text-rose-400/60 transition hover:text-rose-400"
            >
              Usuń wpis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const { journal, updateJournalEntry, deleteJournalEntry } = useApp();
  const [filter, setFilter] = useState<JournalEntryStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "profit">("date");

  const filtered = useMemo(() => {
    let arr = [...journal];
    if (filter !== "all") arr = arr.filter((e) => e.status === filter);
    arr.sort((a, b) => {
      if (sortBy === "profit") return b.profit - a.profit;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return arr;
  }, [journal, filter, sortBy]);

  const settled = journal.filter((e) => e.status !== "cancelled");
  const totalProfit = settled.reduce((s, e) => s + e.profit, 0);
  const totalStake = settled.reduce((s, e) => s + e.totalStake, 0);
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
  const wonCount = journal.filter((e) => e.status === "won").length;
  const closedCount = journal.filter((e) => e.status === "won" || e.status === "lost").length;
  const pendingCount = journal.filter((e) => e.status === "pending").length;
  const winRate = closedCount > 0 ? (wonCount / closedCount) * 100 : null;

  const monthlyProfits: Record<string, number> = {};
  journal.forEach((e) => {
    const m = new Date(e.createdAt).toLocaleDateString("pl-PL", {
      month: "long",
      year: "numeric",
    });
    monthlyProfits[m] = (monthlyProfits[m] || 0) + (e.status !== "cancelled" ? e.profit : 0);
  });

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Dziennik zakładów</h1>
        <p className="mt-1.5 text-sm text-white/55">
          Twoje surebety: wygrane, przegrane i oczekujące — z realnym ROI.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs text-white/40">Łączny zysk netto</p>
          <p
            className={`mt-2 font-mono text-2xl font-bold tabular-nums ${
              totalProfit >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {totalProfit >= 0 ? "+" : ""}
            {totalProfit.toFixed(2)} zł
          </p>
          <p className="mt-1 text-xs text-white/35">obrót {totalStake.toFixed(0)} zł</p>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs text-white/40">ROI</p>
          <p
            className={`mt-2 font-mono text-2xl font-bold tabular-nums ${
              roi >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {roi >= 0 ? "+" : ""}
            {roi.toFixed(2)}%
          </p>
          <p className="mt-1 text-xs text-white/35">zysk / łączna stawka</p>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs text-white/40">Skuteczność</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-sky-300">
            {winRate !== null ? `${Math.round(winRate)}%` : "—"}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-500"
              style={{ width: `${winRate ?? 0}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-white/35">
            {wonCount} z {closedCount} rozliczonych
          </p>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs text-white/40">Oczekujące</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-amber-300">
            {pendingCount}
          </p>
          <p className="mt-1 text-xs text-white/35">
            {pendingCount > 0 ? "do rozliczenia po meczach" : "wszystko rozliczone"}
          </p>
        </div>
      </div>

      {/* Monthly summary */}
      {Object.keys(monthlyProfits).length > 0 && (
        <div className="glass-panel rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Wyniki miesięczne</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(monthlyProfits).map(([month, profit]) => (
              <div
                key={month}
                className="w-full min-w-0 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-center sm:w-auto sm:min-w-[130px]"
              >
                <p className="text-xs capitalize text-white/40">{month}</p>
                <p
                  className={`mt-1 font-mono text-lg font-bold tabular-nums ${
                    profit >= 0 ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {profit >= 0 ? "+" : ""}
                  {profit.toFixed(2)} zł
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {(["all", "pending", "won", "lost", "cancelled"] as const).map((f) => {
            const count = f === "all" ? journal.length : journal.filter((e) => e.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition ${
                  filter === f
                    ? "border border-sky-300/25 bg-sky-400/15 text-sky-100"
                    : "border border-white/12 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {f !== "all" && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[f].dot}`} />}
                {f === "all" ? "Wszystkie" : STATUS_META[f].label}
                <span className="font-mono text-xs text-white/35 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-0.5 text-xs">
          {[
            { v: "date" as const, l: "Data" },
            { v: "profit" as const, l: "Zysk" },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setSortBy(v)}
              className={`rounded-full px-3 py-1 transition ${
                sortBy === v ? "bg-white/12 text-white" : "text-white/45 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-xl p-8 text-center sm:p-12">
          <p className="text-base font-semibold text-white">Brak wpisów</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
            Znajdź surebet w zakładce{" "}
            <span className="font-semibold text-sky-300">Arbitraż</span> i zapisz go do dziennika,
            aby śledzić wyniki.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <JournalEntryCard
              key={e.id}
              entry={e}
              onUpdateStatus={(id, status) => updateJournalEntry(id, { status })}
              onDelete={deleteJournalEntry}
              onUpdateNotes={(id, notes) => updateJournalEntry(id, { notes })}
            />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
        <p className="text-xs leading-5 text-amber-100/70">
          <strong className="text-amber-100">Pamiętaj:</strong> po wygranej nie wypłacaj zysku
          natychmiast. Daj bukmacherowi kilka dni przed kolejnym zakładem, aby limit konta nie
          pojawił się zbyt szybko.
        </p>
      </div>
    </div>
  );
}
