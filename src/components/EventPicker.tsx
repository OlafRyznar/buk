"use client";

import { useEffect, useMemo, useState } from "react";

export interface PickerOutcome {
  name: string;
  bestOdds: number;
  bestBookmakerKey: string;
}

export interface PickerEvent {
  id: string;
  eventName: string;
  sportTitle: string;
  commenceTime: string;
  outcomes: PickerOutcome[];
}

export default function EventPicker({ onPick }: { onPick: (event: PickerEvent) => void }) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<PickerEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open || events.length > 0) return;
    setLoading(true);
    fetch("/api/events/list")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [open, events.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events.slice(0, 30);
    return events
      .filter((e) => e.eventName.toLowerCase().includes(q) || e.sportTitle.toLowerCase().includes(q))
      .slice(0, 30);
  }, [events, query]);

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="text-sm font-semibold text-white">
          Wczytaj z wydarzenia <span className="text-white/35">(opcjonalnie — automatycznie ustawi typ rynku)</span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 space-y-2.5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj meczu lub ligi..."
            className="w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-sky-400/50 focus:outline-none"
          />

          {loading ? (
            <p className="px-1 text-xs text-white/40">Wczytywanie wydarzeń...</p>
          ) : filtered.length === 0 ? (
            <p className="px-1 text-xs text-white/40">Brak wydarzeń do pokazania.</p>
          ) : (
            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {filtered.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {
                    onPick(ev);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-left transition hover:border-sky-400/30 hover:bg-sky-400/[0.06]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{ev.eventName}</p>
                    <p className="text-[11px] text-white/40">
                      {ev.sportTitle} ·{" "}
                      {new Date(ev.commenceTime).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/60">
                    {ev.outcomes.length === 3 ? "1X2" : "1—2"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
