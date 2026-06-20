"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { createClient } from "@/lib/supabase/client";

export interface JournalOutcome {
  name: string;
  odds: number;
  bookmaker: string;
  bookmakerKey: string;
}

interface AddToJournalButtonProps {
  eventName: string;
  sportTitle: string;
  commenceTime: string;
  marketKey: string;
  outcomes: JournalOutcome[];
}

export default function AddToJournalButton({
  eventName,
  sportTitle,
  commenceTime,
  marketKey,
  outcomes,
}: AddToJournalButtonProps) {
  const { addJournalEntry } = useApp();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [outcomeIdx, setOutcomeIdx] = useState(0);
  const [stake, setStake] = useState("100");
  const [odds, setOdds] = useState(outcomes[0]?.odds?.toString() ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  const selectOutcome = (idx: number) => {
    setOutcomeIdx(idx);
    setOdds(outcomes[idx]?.odds?.toString() ?? "");
  };

  const stakeNum = parseFloat(stake.replace(",", "."));
  const oddsNum = parseFloat(odds.replace(",", "."));
  const valid = stakeNum > 0 && oddsNum > 1 && outcomes[outcomeIdx];
  const potentialReturn = valid ? Math.round(stakeNum * oddsNum * 100) / 100 : 0;

  const save = () => {
    if (!valid) return;
    const o = outcomes[outcomeIdx];
    addJournalEntry({
      eventName,
      sportTitle,
      commenceTime,
      marketKey,
      bets: [
        {
          bookmaker: o.bookmaker,
          bookmakerKey: o.bookmakerKey,
          outcome: o.name,
          odds: oddsNum,
          stake: Math.round(stakeNum * 100) / 100,
          potentialReturn,
          result: "pending",
        },
      ],
      totalStake: Math.round(stakeNum * 100) / 100,
      guaranteedReturn: potentialReturn,
      profit: 0,
      profitPercent: 0,
      status: "pending",
      notes: "",
    });
    setSaved(true);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          setSaved(false);
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-sky-400/12 px-3 py-1 text-xs font-medium text-sky-100 transition hover:bg-sky-400/20"
      >
        <span aria-hidden>＋</span> Dodaj do dziennika
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-[min(92vw,320px)] rounded-2xl border border-white/12 bg-[#0d1117] p-4 shadow-2xl">
          {loggedIn === false ? (
            <div className="space-y-3 text-center">
              <p className="text-sm text-white/70">Zaloguj się, aby zapisywać zakłady w dzienniku.</p>
              <Link
                href="/login"
                className="inline-block rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Zaloguj się
              </Link>
            </div>
          ) : saved ? (
            <div className="space-y-3 text-center">
              <p className="text-sm font-semibold text-emerald-300">Zapisano w dzienniku ✓</p>
              <p className="text-xs text-white/50">
                Wynik (wygrana/przegrana) rozliczysz później w zakładce Konto → Historia zakładów.
              </p>
              <div className="flex justify-center gap-2">
                <Link
                  href="/account"
                  className="rounded-lg border border-white/12 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:text-white"
                >
                  Otwórz dziennik
                </Link>
                <button
                  onClick={() => setSaved(false)}
                  className="rounded-lg border border-white/12 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:text-white"
                >
                  Dodaj kolejny
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white">Zapisz zakład</p>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Na co stawiasz</label>
                <div className="mt-1.5 grid gap-1.5">
                  {outcomes.map((o, i) => (
                    <button
                      key={o.name}
                      onClick={() => selectOutcome(i)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition ${
                        i === outcomeIdx
                          ? "border-sky-400/60 bg-sky-400/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20"
                      }`}
                    >
                      <span className="truncate">{o.name}</span>
                      <span className="ml-2 shrink-0 font-mono text-amber-200">@{o.odds.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Stawka (zł)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    min={0}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Kurs</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={odds}
                    onChange={(e) => setOdds(e.target.value)}
                    min={1}
                    step="0.01"
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400/50 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-xs text-white/45">
                Potencjalny zwrot:{" "}
                <span className="font-mono font-semibold text-white/80">{potentialReturn.toFixed(2)} zł</span>
              </p>

              <button
                onClick={save}
                disabled={!valid}
                className="w-full rounded-xl bg-sky-500 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-40"
              >
                Zapisz do dziennika
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
