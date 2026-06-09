"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/components/AppProvider";
import { JournalEntry, JournalEntryStatus } from "@/lib/store-types";

const STATUS_LABELS: Record<JournalEntryStatus, { label: string; color: string; badge: string }> = {
  pending: { label: 'Oczekuje', color: 'text-amber-200', badge: 'bg-amber-400/15 text-amber-200 border border-amber-300/20' },
  won: { label: 'Wygrana', color: 'text-emerald-300', badge: 'bg-emerald-400/15 text-emerald-300 border border-emerald-300/20' },
  lost: { label: 'Przegrana', color: 'text-rose-300', badge: 'bg-rose-400/15 text-rose-300 border border-rose-300/20' },
  cancelled: { label: 'Anulowany', color: 'text-white/40', badge: 'bg-white/8 text-white/40 border border-white/12' },
};

function JournalEntryCard({ entry, onUpdateStatus, onDelete, onUpdateNotes }: {
  entry: JournalEntry;
  onUpdateStatus: (id: string, status: JournalEntryStatus) => void;
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(entry.notes);
  const s = STATUS_LABELS[entry.status];

  return (
    <div className="glass-panel animate-slide-up rounded-[28px] border border-white/8 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-[0.2em] text-white/40">{entry.sportTitle}</span>
            {entry.isDemo && (
              <span className="rounded-full bg-amber-300/10 px-2 py-0.5 text-xs text-amber-200/60">Demo</span>
            )}
          </div>
          <h3 className="break-words font-semibold text-white">{entry.eventName}</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {new Date(entry.createdAt).toLocaleDateString('pl-PL', { dateStyle: 'medium' })} ·{' '}
            Start: {new Date(entry.commenceTime).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        </div>
        <div className="w-full space-y-1 text-left sm:w-auto sm:text-right">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${s.badge}`}>
            {s.label}
          </span>
          <p className={`text-xl font-bold font-mono ${entry.profit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {entry.profit >= 0 ? '+' : ''}{entry.profit.toFixed(2)} zł
          </p>
          <p className="text-xs text-white/40 font-mono">
            {entry.profitPercent >= 0 ? '+' : ''}{entry.profitPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Summary row */}
      <div className="mt-4 grid gap-2 text-sm text-white/50 sm:flex sm:flex-wrap sm:gap-4">
        <span>Stawka: <span className="text-white font-mono">{entry.totalStake.toFixed(2)} zł</span></span>
        <span>Gwarantowany zwrot: <span className="text-white font-mono">{entry.guaranteedReturn.toFixed(2)} zł</span></span>
        <span>Zakłady: <span className="text-white">{entry.bets.length}</span></span>
      </div>

      {/* Expand/collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {expanded ? 'Zwiń szczegóły' : 'Rozwiń szczegóły'}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Bets on mobile */}
          <div className="space-y-2 md:hidden">
            {entry.bets.map((bet, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-black/18 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">{bet.outcome}</p>
                    <p className="text-xs text-white/58">{bet.bookmaker}</p>
                  </div>
                  <div className="text-right">
                    {bet.result === 'win' && <span className="text-emerald-400">✓</span>}
                    {bet.result === 'loss' && <span className="text-rose-400">✗</span>}
                    {bet.result === 'pending' && <span className="text-amber-300">⏳</span>}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-white/4 p-2">
                  <div>
                    <p className="text-[11px] text-white/44">Kurs</p>
                    <p className="text-sm font-mono text-amber-200">{bet.odds.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/44">Stawka</p>
                    <p className="text-sm font-mono text-white">{bet.stake.toFixed(2)} zł</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/44">Wypłata</p>
                    <p className="text-sm font-mono text-white/80">{bet.potentialReturn.toFixed(2)} zł</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bets table on desktop */}
          <div className="hidden overflow-hidden rounded-[22px] border border-white/10 bg-black/18 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-left text-xs text-white/40">Wynik</th>
                  <th className="p-3 text-left text-xs text-white/40">Bukmacher</th>
                  <th className="p-3 text-right text-xs text-white/40">Kurs</th>
                  <th className="p-3 text-right text-xs text-white/40">Stawka</th>
                  <th className="p-3 text-right text-xs text-white/40">Wypłata</th>
                  <th className="p-3 text-center text-xs text-white/40">Wynik</th>
                </tr>
              </thead>
              <tbody>
                {entry.bets.map((bet, i) => (
                  <tr key={i} className="border-b border-white/6 last:border-0">
                    <td className="p-3 text-white">{bet.outcome}</td>
                    <td className="p-3 text-white/60">{bet.bookmaker}</td>
                    <td className="p-3 text-right font-mono text-amber-200">{bet.odds.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-white">{bet.stake.toFixed(2)} zł</td>
                    <td className="p-3 text-right font-mono text-white/70">{bet.potentialReturn.toFixed(2)} zł</td>
                    <td className="p-3 text-center">
                      {bet.result === 'win' && <span className="text-emerald-400">✓</span>}
                      {bet.result === 'loss' && <span className="text-rose-400">✗</span>}
                      {bet.result === 'pending' && <span className="text-amber-300">⏳</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40">Notatki</p>
              <button
                onClick={() => {
                  if (editingNotes) { onUpdateNotes(entry.id, notes); }
                  setEditingNotes(!editingNotes);
                }}
                className="text-xs text-sky-400 hover:text-sky-300 transition"
              >
                {editingNotes ? '✓ Zapisz' : 'Edytuj'}
              </button>
            </div>
            {editingNotes ? (
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-[14px] border border-white/12 bg-white/6 px-3 py-2 text-sm text-white/80 focus:border-white/25 focus:outline-none resize-none"
                placeholder="Dodaj notatki do zakładu..."
              />
            ) : (
              <p className="text-sm text-white/50 italic">{notes || 'Brak notatek'}</p>
            )}
          </div>

          {/* Actions */}
          {entry.status === 'pending' && (
            <div className="flex flex-wrap gap-2">
              <p className="text-xs text-white/42 self-center mr-2">Oznacz jako:</p>
              {(['won', 'lost', 'cancelled'] as JournalEntryStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => onUpdateStatus(entry.id, s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition border ${STATUS_LABELS[s].badge} hover:opacity-80`}
                >
                  {STATUS_LABELS[s].label}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => onDelete(entry.id)}
              className="text-xs text-rose-400/60 hover:text-rose-400 transition"
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
  const [filter, setFilter] = useState<JournalEntryStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'profit'>('date');

  const filtered = useMemo(() => {
    let arr = [...journal];
    if (filter !== 'all') arr = arr.filter(e => e.status === filter);
    arr.sort((a, b) => {
      if (sortBy === 'profit') return b.profit - a.profit;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return arr;
  }, [journal, filter, sortBy]);

  // Stats
  const totalProfit = journal.filter(e => e.status !== 'cancelled').reduce((s, e) => s + e.profit, 0);
  const totalStake = journal.filter(e => e.status !== 'cancelled').reduce((s, e) => s + e.totalStake, 0);
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
  const wonCount = journal.filter(e => e.status === 'won').length;
  const closedCount = journal.filter(e => e.status === 'won' || e.status === 'lost').length;

  const monthlyProfits: Record<string, number> = {};
  journal.forEach(e => {
    const m = new Date(e.createdAt).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    monthlyProfits[m] = (monthlyProfits[m] || 0) + (e.status !== 'cancelled' ? e.profit : 0);
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Dziennik Zakładów</h1>
          <p className="mt-1 text-white/52">Śledź swoje rzeczywiste wyniki i ROI.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Łączny zysk netto', value: `${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)} zł`, color: totalProfit >= 0 ? 'text-emerald-300' : 'text-rose-300' },
          { label: 'ROI', value: `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%`, color: roi >= 0 ? 'text-emerald-300' : 'text-rose-300' },
          { label: 'Skuteczność', value: closedCount > 0 ? `${Math.round(wonCount / closedCount * 100)}%` : 'N/D', color: 'text-sky-300' },
          { label: 'Łączna stawka', value: `${totalStake.toFixed(2)} zł`, color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel rounded-[24px] p-5">
            <p className="text-xs text-white/40">{label}</p>
            <p className={`text-2xl font-bold font-mono mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly summary */}
      {Object.keys(monthlyProfits).length > 0 && (
        <div className="glass-panel rounded-[24px] p-5">
          <h3 className="font-semibold text-white mb-4">Wyniki miesięczne</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(monthlyProfits).map(([month, profit]) => (
              <div key={month} className="w-full min-w-0 rounded-[18px] border border-white/10 bg-white/6 px-4 py-3 text-center sm:w-auto sm:min-w-[120px]">
                <p className="text-xs text-white/40 capitalize">{month}</p>
                <p className={`text-lg font-bold font-mono mt-1 ${profit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {profit >= 0 ? '+' : ''}{profit.toFixed(2)} zł
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and sort */}
      <div className="space-y-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {(['all', 'pending', 'won', 'lost', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                filter === f
                  ? 'border border-sky-300/25 bg-sky-400/20 text-sky-100'
                  : 'border border-white/12 bg-white/6 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f === 'all' ? 'Wszystkie' : STATUS_LABELS[f].label}
              {f !== 'all' && (
                <span className="ml-1.5 text-xs text-white/40">({journal.filter(e => e.status === f).length})</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-white/40">
          <span>Sortuj:</span>
          {[{ v: 'date', l: 'Data' }, { v: 'profit', l: 'Zysk' }].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setSortBy(v as 'date' | 'profit')}
              className={`rounded-full px-3 py-1.5 text-xs transition ${sortBy === v ? 'bg-white/12 text-white' : 'hover:text-white'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-[28px] p-8 text-center sm:p-12">
          <p className="text-3xl mb-3">📒</p>
          <p className="font-semibold text-white mb-1">Brak wpisów</p>
          <p className="text-sm text-white/50">Zagraj surebet w kalkulatorze i zapisz go do dziennika.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(e => (
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
      <div className="glass-panel rounded-[22px] border border-amber-300/15 bg-amber-300/5 p-4">
        <p className="text-xs text-amber-100/70">
          💡 <strong>Pamiętaj:</strong> po wygranej nie wypłacaj zysku natychmiast.
          Daj bukmacherowi kilka dni przed kolejnym zakładem, aby limit konta nie pojawił się zbyt szybko.
        </p>
      </div>
    </div>
  );
}
