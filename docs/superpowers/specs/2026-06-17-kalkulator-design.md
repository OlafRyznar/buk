# Kalkulator (manual surebet calculator) — design

## Goal
A new "Kalkulator" tab where the user enters their own odds (kursy) for an event's
outcomes, sees optimal stakes and guaranteed profit recomputed live, and can add the
result to the Dziennik (journal).

## Navigation
- New route `/kalkulator`.
- Sidebar nav item between "Arbitraż" and "Wydarzenia", label "Kalkulator", calculator icon.

## Page: `src/app/kalkulator/page.tsx`
Client component (uses `useApp` for settings + `addJournalEntry`).
Layout matches the app: page title, a "Jak to działa?" glass panel, then the calculator
card (extracted into `src/components/ManualCalculator.tsx`).

## Form state
- `eventName` (optional text), `sportTitle` (optional text).
- `totalStake` (number, default 1000).
- `rows`: dynamic list, starts with 2. Each row: `outcome` (text), `odds` (number),
  `bookmakerKey` (dropdown from `ALL_BOOKMAKERS`, optional, default empty = manual).
  - "+ Dodaj wynik" adds a row (max 6). "Usuń" removes a row (min 2).

## Live calculation
Use existing `recomputeStakesWithTax` + `effectiveOdds` from `src/lib/arbitrage.ts` so the
result respects `settings.taxRate` and tax-free bookmakers (Betclic), identical to
`ArbitrageCard`. Honor `settings.roundingEnabled`/`roundingStep` for displayed stakes.

Display:
- Big profit % header (emerald if surebet, rose "—" if not).
- Results table: wynik / bukmacher / kurs / stawka / wygrana — updates live.
- Summary: total stake / guaranteed return / profit zł.
- Warning banner when after-tax the set is no longer a surebet (same copy as the card).

## "Dodaj do dziennika"
Enabled when ≥2 rows have valid odds (> 1). Builds a `JournalEntry`:
- `status: "pending"`, `marketKey: "manual"`, `isDemo: false`.
- `eventName` from input or fallback "Kalkulator ręczny".
- `bets` mapped from rows (bookmaker name resolved from key, or "—").
- `totalStake`, `guaranteedReturn`, `profit`, `profitPercent` from the computation.
Calls `addJournalEntry`, then shows a "Dodano do dziennika ✓" confirmation with a link to
`/journal`.

## Validation / edge cases
- Odds ≤ 1 or empty are excluded from the math and visually flagged.
- "Dodaj do dziennika" disabled until ≥2 valid odds present.
- Non-numeric stake/odds guarded (NaN → treated as empty).

## Out of scope
- No separate persistence on the calculator page (journal is the store of record).
- No changes to `arbitrage.ts` — reused as-is.

## Files
- New: `src/app/kalkulator/page.tsx`, `src/components/ManualCalculator.tsx`
- Edit: `src/components/Sidebar.tsx`
