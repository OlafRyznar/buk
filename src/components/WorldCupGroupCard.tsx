import Link from "next/link";
import { EventWithOdds } from "@/lib/types";
import { WorldCupGroup } from "@/lib/world-cup-groups";
import TeamFlag from "./TeamFlag";

interface WorldCupGroupCardProps {
  group: WorldCupGroup;
  upcoming: EventWithOdds[];
  finished: EventWithOdds[];
}

function formatStart(value: string) {
  return new Date(value).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
}

function MatchRow({ event }: { event: EventWithOdds }) {
  const h2h = event.markets.find((m) => m.marketKey === "h2h");
  return (
    <Link
      href={`/events/${event.id}`}
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-xs transition hover:bg-white/[0.05]"
    >
      <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-medium text-white">
        <TeamFlag team={event.homeTeam} size={16} />
        {event.homeTeam}
        <span className="text-white/40">vs</span>
        <TeamFlag team={event.awayTeam} size={16} />
        {event.awayTeam}
      </span>
      <span className="flex items-center gap-3 text-white/45">
        {h2h && (
          <span className="font-mono">
            {h2h.outcomes.map((o) => o.bestOdds.odds.toFixed(2)).join(" / ")}
          </span>
        )}
        <span>{formatStart(event.commenceTime)}</span>
      </span>
    </Link>
  );
}

export default function WorldCupGroupCard({ group, upcoming, finished }: WorldCupGroupCardProps) {
  const sorted = [...group.standings].sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff);

  return (
    <div className="glass-panel rounded-xl border border-white/10 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/15 text-sm font-bold text-amber-300">
          {group.letter}
        </span>
        <h3 className="text-sm font-semibold text-white">Grupa {group.letter}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-xs">
          <thead>
            <tr className="text-white/40">
              <th className="py-1 pr-2 text-left font-medium">Zespół</th>
              <th className="px-1 text-center font-medium">M</th>
              <th className="px-1 text-center font-medium">W</th>
              <th className="px-1 text-center font-medium">R</th>
              <th className="px-1 text-center font-medium">P</th>
              <th className="px-1 text-center font-medium">+/-</th>
              <th className="pl-1 text-center font-medium">Pkt</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, idx) => (
              <tr key={s.team} className={`border-t border-white/6 ${idx < 2 ? "text-white" : "text-white/55"}`}>
                <td className="flex items-center gap-1.5 py-1.5 pr-2 font-medium">
                  <TeamFlag team={s.team} size={14} />
                  <span className="truncate">{s.team}</span>
                </td>
                <td className="px-1 text-center font-mono">{s.played}</td>
                <td className="px-1 text-center font-mono">{s.won}</td>
                <td className="px-1 text-center font-mono">{s.drawn}</td>
                <td className="px-1 text-center font-mono">{s.lost}</td>
                <td className="px-1 text-center font-mono">
                  {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                </td>
                <td className="pl-1 text-center font-mono font-bold">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(upcoming.length > 0 || finished.length > 0) && (
        <div className="mt-4 space-y-2 border-t border-white/8 pt-3">
          {upcoming.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Nadchodzące mecze
              </p>
              {upcoming.map((e) => (
                <MatchRow key={e.id} event={e} />
              ))}
            </div>
          )}

          {finished.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer select-none py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                Zakończone mecze ({finished.length})
              </summary>
              <div className="mt-1.5 space-y-1.5">
                {finished.map((e) => (
                  <MatchRow key={e.id} event={e} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
