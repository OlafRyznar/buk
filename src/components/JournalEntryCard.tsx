"use client";

import { useState } from "react";
import { JournalEntry, JournalEntryStatus } from "@/lib/store-types";

export const STATUS_META: Record<
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

export function JournalEntryCard({
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
