import { WORLD_CUP_BRACKET, THIRD_PLACE_MATCH, type BracketMatch, type BracketSlot } from "@/lib/world-cup-bracket";
import TeamFlag from "./TeamFlag";

function fmtDate(date: string) {
  // "2026-06-28" -> "28.06"
  const [, mm, dd] = date.split("-");
  return `${dd}.${mm}`;
}

function SlotRow({ slot }: { slot: BracketSlot }) {
  // A confirmed team (has a flag) reads brighter than a coded placeholder.
  const known = Boolean(slot.flag);
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-black/20 px-1.5 py-1">
      {slot.flag ? (
        <TeamFlag team={slot.flag} size={14} />
      ) : (
        <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] border border-white/15" />
      )}
      <span className={`font-mono text-[11px] font-semibold ${known ? "text-white" : "text-white/55"}`}>
        {slot.label}
      </span>
    </div>
  );
}

function MatchCard({ match, accent }: { match: BracketMatch; accent: "sky" | "amber" }) {
  const ring = accent === "amber" ? "border-amber-300/35" : "border-white/10";
  const glow =
    accent === "amber"
      ? "bg-gradient-to-br from-amber-400/[0.12] to-amber-500/[0.04] shadow-[0_0_30px_-8px_rgba(251,191,36,0.4)]"
      : "bg-white/[0.03]";
  const badge =
    accent === "amber" ? "bg-amber-400/20 text-amber-200" : "bg-sky-400/15 text-sky-200/90";

  return (
    <div className={`relative w-[150px] rounded-xl border ${ring} ${glow} px-2.5 py-2 backdrop-blur-sm`}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${badge}`}>
          {match.id}
        </span>
        <span className="font-mono text-[10px] text-white/45">
          {fmtDate(match.date)} • {match.time}
        </span>
      </div>
      <div className="space-y-1">
        <SlotRow slot={match.slots[0]} />
        <SlotRow slot={match.slots[1]} />
      </div>
    </div>
  );
}

/**
 * Single match cell with elbow connectors drawn via absolutely-positioned
 * lines. `isFirst`/`isLast` toggle the incoming/outgoing stubs; `even:`/`odd:`
 * pick whether the vertical half-line goes down (top of a pair) or up (bottom).
 */
function MatchCell({
  match,
  roundIndex,
  indexInRound,
  isLastRound,
  accent,
}: {
  match: BracketMatch;
  roundIndex: number;
  indexInRound: number;
  isLastRound: boolean;
  accent: "sky" | "amber";
}) {
  const isTopOfPair = indexInRound % 2 === 0;
  return (
    <div className="relative flex flex-1 items-center px-4">
      {/* incoming horizontal stub (all rounds except the first) */}
      {roundIndex > 0 && (
        <span className="absolute left-0 top-1/2 h-px w-4 -translate-x-full bg-white/15" />
      )}
      {/* outgoing horizontal stub + vertical half-line into the next round */}
      {!isLastRound && (
        <>
          <span className="absolute right-0 top-1/2 h-px w-4 translate-x-full bg-white/15" />
          {/* top of a pair: line drops down to the boundary; bottom: rises up */}
          {isTopOfPair ? (
            <span className="absolute right-0 top-1/2 h-1/2 w-px translate-x-4 bg-white/15" />
          ) : (
            <span className="absolute right-0 bottom-1/2 h-1/2 w-px translate-x-4 bg-white/15" />
          )}
        </>
      )}
      <MatchCard match={match} accent={accent} />
    </div>
  );
}

export default function WorldCupBracket() {
  return (
    <div className="glass-panel mt-6 rounded-2xl border border-white/10 p-4 sm:p-6">
      <div className="mb-1 flex items-center gap-2">
        <span aria-hidden className="text-lg">🏆</span>
        <h3 className="text-base font-bold text-white">Drabinka pucharowa</h3>
      </div>
      <p className="mb-5 text-xs text-white/45">
        Faza pucharowa MŚ 2026 — pary zostaną ustalone po fazie grupowej.
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[940px] items-stretch">
          {WORLD_CUP_BRACKET.map((round, ri) => {
            const isLastRound = ri === WORLD_CUP_BRACKET.length - 1;
            const accent = isLastRound ? "amber" : "sky";
            return (
              <div key={round.name} className="flex flex-1 flex-col">
                <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {round.name}
                </p>
                <div className="flex flex-1 flex-col">
                  {round.matches.map((match, mi) => (
                    <MatchCell
                      key={match.id}
                      match={match}
                      roundIndex={ri}
                      indexInRound={mi}
                      isLastRound={isLastRound}
                      accent={accent}
                    />
                  ))}
                  {/* 3rd-place play-off tucked under the final */}
                  {isLastRound && (
                    <div className="mt-4 flex flex-col items-center px-4">
                      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-white/30">
                        Mecz o 3. miejsce
                      </p>
                      <MatchCard match={THIRD_PLACE_MATCH} accent="sky" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
