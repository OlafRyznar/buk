// FIFA World Cup 2026 knockout bracket, as provided by the user. Match numbers,
// kickoff dates/times and the slot labels are known; most teams are still coded
// placeholders that resolve from the group stage:
//   "1I"  = winner of group I        "2A"  = runner-up of group A
//   "3ABCDF" = a 3rd-placed team from one of those groups
//   "W74" = winner of match 74       "L101" = loser of match 101
// A few slots are already-decided group winners and carry a real flag.
// Matches within each round are ordered top-to-bottom so the tree lines up.

export interface BracketSlot {
  /** Display label, e.g. "1I", "W74", "GER". */
  label: string;
  /** Polish team name for the flag image, when the team is already known. */
  flag?: string;
}

export interface BracketMatch {
  /** Official FIFA match number, e.g. "M73". */
  id: string;
  /** ISO date "YYYY-MM-DD". */
  date: string;
  /** Kickoff "HH:MM". */
  time: string;
  /** The two participants (home, away). */
  slots: [BracketSlot, BracketSlot];
}

export interface BracketRound {
  /** Short Polish label. */
  name: string;
  matches: BracketMatch[];
}

const m = (
  id: string,
  date: string,
  time: string,
  home: BracketSlot,
  away: BracketSlot
): BracketMatch => ({ id, date, time, slots: [home, away] });

// Round of 32 → 1/8 → QF → SF → Final, each ordered to align the tree.
export const WORLD_CUP_BRACKET: BracketRound[] = [
  {
    name: "1/16 finału",
    matches: [
      m("M74", "2026-06-29", "22:30", { label: "GER", flag: "Niemcy" }, { label: "3ABCDF" }),
      m("M77", "2026-06-30", "23:00", { label: "1I" }, { label: "3CDFGH" }),
      m("M73", "2026-06-28", "21:00", { label: "2A" }, { label: "2B" }),
      m("M75", "2026-06-30", "03:00", { label: "1F" }, { label: "2C" }),
      m("M83", "2026-07-03", "01:00", { label: "2K" }, { label: "2L" }),
      m("M84", "2026-07-02", "21:00", { label: "1H" }, { label: "2J" }),
      m("M81", "2026-07-02", "02:00", { label: "USA", flag: "Stany Zjednoczone" }, { label: "3BEFIJ" }),
      m("M82", "2026-07-01", "22:00", { label: "1G" }, { label: "3AEHIJ" }),
      m("M76", "2026-06-29", "19:00", { label: "1C" }, { label: "2F" }),
      m("M78", "2026-06-30", "19:00", { label: "2E" }, { label: "2I" }),
      m("M79", "2026-07-01", "03:00", { label: "MEX", flag: "Meksyk" }, { label: "3CEFHI" }),
      m("M80", "2026-07-01", "18:00", { label: "1L" }, { label: "3EHIJK" }),
      m("M86", "2026-07-04", "00:00", { label: "1J" }, { label: "2H" }),
      m("M88", "2026-07-03", "20:00", { label: "2D" }, { label: "2G" }),
      m("M85", "2026-07-03", "05:00", { label: "1B" }, { label: "3EFGIJ" }),
      m("M87", "2026-07-04", "03:30", { label: "1K" }, { label: "3DEIJL" }),
    ],
  },
  {
    name: "1/8 finału",
    matches: [
      m("M89", "2026-07-04", "23:00", { label: "W74" }, { label: "W77" }),
      m("M90", "2026-07-04", "19:00", { label: "W73" }, { label: "W75" }),
      m("M93", "2026-07-06", "21:00", { label: "W83" }, { label: "W84" }),
      m("M94", "2026-07-07", "02:00", { label: "W81" }, { label: "W82" }),
      m("M91", "2026-07-05", "22:00", { label: "W76" }, { label: "W78" }),
      m("M92", "2026-07-06", "02:00", { label: "W79" }, { label: "W80" }),
      m("M95", "2026-07-07", "18:00", { label: "W86" }, { label: "W88" }),
      m("M96", "2026-07-07", "22:00", { label: "W85" }, { label: "W87" }),
    ],
  },
  {
    name: "Ćwierćfinały",
    matches: [
      m("M97", "2026-07-09", "22:00", { label: "W89" }, { label: "W90" }),
      m("M98", "2026-07-10", "21:00", { label: "W93" }, { label: "W94" }),
      m("M99", "2026-07-11", "23:00", { label: "W91" }, { label: "W92" }),
      m("M100", "2026-07-12", "03:00", { label: "W95" }, { label: "W96" }),
    ],
  },
  {
    name: "Półfinały",
    matches: [
      m("M101", "2026-07-14", "21:00", { label: "W97" }, { label: "W98" }),
      m("M102", "2026-07-15", "21:00", { label: "W99" }, { label: "W100" }),
    ],
  },
  {
    name: "Finał",
    matches: [m("M104", "2026-07-19", "21:00", { label: "W101" }, { label: "W102" })],
  },
];

// Played between the two losing semi-finalists.
export const THIRD_PLACE_MATCH: BracketMatch = m(
  "M103",
  "2026-07-18",
  "23:00",
  { label: "L101" },
  { label: "L102" }
);
