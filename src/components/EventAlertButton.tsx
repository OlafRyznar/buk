"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { createClient } from "@/lib/supabase/client";
import { fetchEventAlerts, addEventAlert, removeEventAlert, EventAlertRow, EventAlertType as AlertType } from "@/lib/alerts-service";

type EventAlert = EventAlertRow;

interface EventAlertButtonProps {
  eventId: string;
  eventName: string;
  sportTitle: string;
  outcomes: string[]; // e.g. ["Real Madrid", "Draw", "Barcelona"]
}

function describeAlert(a: EventAlert): string {
  if (a.type === "before-kickoff") return `🔔 ${a.minutesBefore} min przed startem`;
  if (a.type === "at-time") {
    return `🔔 O ${new Date(a.atTime!).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}`;
  }
  return `🔔 Gdy kurs "${a.outcomeName}" ≥ ${a.thresholdPrice?.toFixed(2)}`;
}

export default function EventAlertButton({ eventId, eventName, sportTitle, outcomes }: EventAlertButtonProps) {
  const { settings } = useApp();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<EventAlert[]>([]);
  const [type, setType] = useState<AlertType>("before-kickoff");
  const [minutesBefore, setMinutesBefore] = useState(30);
  const [atTime, setAtTime] = useState("");
  const [outcomeName, setOutcomeName] = useState(outcomes[0] || "");
  const [thresholdPrice, setThresholdPrice] = useState(2);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const loadAlerts = () => {
    const supabase = createClient();
    fetchEventAlerts(supabase, eventId).then(setAlerts).catch(() => {});
  };

  useEffect(() => {
    if (open) loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = async () => {
    if (!userId || !settings.notificationEmail) return;
    setStatus("saving");
    setErrorMsg("");

    const supabase = createClient();
    // datetime-local input (no timezone) → convert to ISO string
    // new Date("YYYY-MM-DDTHH:MM:SS") interprets as LOCAL time
    // .toISOString() converts to UTC automatically
    let isoAtTime: string | undefined;
    if (type === "at-time" && atTime) {
      isoAtTime = new Date(`${atTime}:00`).toISOString();
    }

    const ok = await addEventAlert(supabase, userId, settings.notificationEmail, {
      eventId,
      eventName,
      sportTitle,
      type,
      minutesBefore: type === "before-kickoff" ? minutesBefore : undefined,
      atTime: type === "at-time" ? isoAtTime : undefined,
      outcomeName: type === "odds-threshold" ? outcomeName : undefined,
      thresholdPrice: type === "odds-threshold" ? thresholdPrice : undefined,
    });

    if (ok) {
      setStatus("idle");
      loadAlerts();
    } else {
      setStatus("error");
      setErrorMsg("Nie udało się zapisać alertu.");
    }
  };

  const remove = async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    const supabase = createClient();
    await removeEventAlert(supabase, id);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
        title="Powiadomienia dla tego wydarzenia"
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition ${
          alerts.length > 0
            ? "border-sky-400/40 bg-sky-400/15 text-sky-200"
            : "border-amber-300/25 bg-amber-300/[0.06] text-amber-200/80 hover:border-amber-300/40 hover:bg-amber-300/[0.1] hover:text-amber-100"
        }`}
      >
        <svg className="h-4 w-4" fill={alerts.length > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <span className="hidden sm:inline">
          {alerts.length > 0 ? `${alerts.length} alert${alerts.length > 1 ? "y" : ""}` : "Powiadom mnie"}
        </span>
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="animate-slide-up absolute right-0 top-full z-30 mt-2 w-[22rem] overflow-hidden rounded-2xl border border-white/12 bg-[#0e1015] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <span aria-hidden>🔔</span> Powiadomienia o meczu
            </p>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-white/40 transition hover:bg-white/8 hover:text-white"
              aria-label="Zamknij"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4">
          {!settings.notificationEmail ? (
            <p className="text-xs text-white/60">
              Wczytywanie konta… jeśli to się nie zmieni, zaloguj się ponownie albo sprawdź{" "}
              <Link href="/account" className="text-sky-400 hover:text-sky-300 font-semibold">
                Konto → Powiadomienia
              </Link>.
            </p>
          ) : (
            <>
              <p className="text-xs font-semibold text-white/80 mb-3">Powiadom mnie, gdy...</p>

              <div className="flex gap-1 rounded-lg bg-white/5 p-1 mb-3">
                {([
                  ["before-kickoff", "Przed startem"],
                  ["at-time", "O godzinie"],
                  ["odds-threshold", "Kurs ≥"],
                ] as [AlertType, string][]).map(([t, label]) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${
                      type === t ? "bg-sky-500/20 text-sky-300" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {type === "before-kickoff" && (
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    min={1}
                    value={minutesBefore}
                    onChange={e => setMinutesBefore(parseInt(e.target.value) || 0)}
                    className="w-20 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white focus:outline-none"
                  />
                  <span className="text-xs text-white/50">minut przed meczem</span>
                </div>
              )}

              {type === "at-time" && (
                <div className="mb-3">
                  <input
                    type="datetime-local"
                    value={atTime}
                    onChange={e => setAtTime(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white focus:outline-none"
                  />
                </div>
              )}

              {type === "odds-threshold" && (
                <div className="flex items-center gap-2 mb-3">
                  <select
                    value={outcomeName}
                    onChange={e => setOutcomeName(e.target.value)}
                    className="flex-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white focus:outline-none"
                  >
                    {outcomes.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span className="text-xs text-white/50">≥</span>
                  <input
                    type="number"
                    step={0.01}
                    min={1.01}
                    value={thresholdPrice}
                    onChange={e => setThresholdPrice(parseFloat(e.target.value) || 0)}
                    className="w-20 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white focus:outline-none"
                  />
                </div>
              )}

              <button
                onClick={save}
                disabled={status === "saving"}
                className="w-full rounded-lg bg-sky-500/15 border border-sky-500/25 px-3 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/25 disabled:opacity-50"
              >
                {status === "saving" ? "Zapisywanie…" : "+ Dodaj powiadomienie"}
              </button>
              {status === "error" && <p className="mt-2 text-[11px] text-rose-400">{errorMsg}</p>}

              {alerts.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                  {alerts.map(a => (
                    <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5">
                      <span className="text-[11px] text-white/70">{describeAlert(a)}</span>
                      <button onClick={() => remove(a.id)} className="text-white/30 hover:text-rose-400 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
