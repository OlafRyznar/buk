import {
  EventWithOdds,
  ArbitrageOpportunity,
  ArbitrageBet,
  NearArbitrageOpportunity,
} from './types';
import { DEFAULT_SETTINGS, TAX_FREE_BOOKMAKER_KEYS } from './store-types';

const DEFAULT_NEAR_ARBITRAGE_THRESHOLD = 0.04;

// Real surebets come from small cross-bookmaker margin differences — low
// single digits, occasionally up to ~15% on a mispriced outlier market.
// Anything above this is overwhelmingly likely to be bad data (two different
// matches fuzzy-merged into one event, a misread odd, a stale price) rather
// than a genuine guaranteed-profit opportunity, so it's dropped instead of
// shown as if it were real.
const MAX_PLAUSIBLE_PROFIT_PERCENT = 20;

// Default tax rate (%) applied to net winnings, and the set of bookmakers
// whose tax-free game mode means odds shouldn't be discounted.
export const DEFAULT_TAX_RATE = DEFAULT_SETTINGS.taxRate;
export const DEFAULT_TAX_FREE_KEYS = new Set(TAX_FREE_BOOKMAKER_KEYS);

/**
 * Calculate arbitrage opportunity for a given event and market.
 * 
 * Arbitrage exists when the sum of inverse best odds < 1
 * i.e., 1/odds1 + 1/odds2 + ... + 1/oddsN < 1
 * 
 * Profit % = (1 / totalImpliedProbability - 1) * 100
 */
export function findArbitrageForEvent(
  event: EventWithOdds,
  totalStake: number = 1000,
  taxRate: number = DEFAULT_TAX_RATE,
  taxFreeKeys: Set<string> = DEFAULT_TAX_FREE_KEYS
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  for (const market of event.markets) {
    // For h2h market: need exactly 2 outcomes (moneyline) or 3 (with draw)
    const outcomes = market.outcomes;
    if (outcomes.length < 2) continue;

    // Each outcome must have at least 1 bookmaker
    if (outcomes.some((o) => o.bookmakers.length === 0)) continue;

    // Use best odds for each outcome
    const bestOdds = outcomes.map((o) => ({
      ...o.bestOdds,
      outcome: o.name,
    }));

    // Arbitrage exists if the sum of inverse *net* (after-tax) odds < 1
    const netOdds = bestOdds.map((o) => effectiveOdds(o.odds, o.bookmakerKey, taxRate, taxFreeKeys));
    const totalImpliedProbability = netOdds.reduce((sum, o) => sum + 1 / o, 0);

    if (totalImpliedProbability < 1) {
      // bets[].odds stays gross (what you enter at the bookmaker); stakes,
      // returns and profit are computed from net (after-tax) odds.
      const grossBets: ArbitrageBet[] = bestOdds.map((o) => ({
        outcome: o.outcome,
        bookmaker: o.bookmaker,
        bookmakerKey: o.bookmakerKey,
        odds: o.odds,
        stake: 0,
        potentialReturn: 0,
        eventUrl: o.eventUrl,
      }));

      const recomputed = recomputeStakesWithTax(grossBets, totalStake, taxRate, taxFreeKeys);

      if (recomputed.profit > MAX_PLAUSIBLE_PROFIT_PERCENT) {
        console.warn(
          `[Arbitrage] Discarding implausible ${recomputed.profit}% opportunity for ` +
            `${event.homeTeam} vs ${event.awayTeam} (${market.marketKey}) — likely bad data.`
        );
        continue;
      }

      opportunities.push({
        id: `${event.id}-${market.marketKey}`,
        event,
        marketKey: market.marketKey,
        profit: recomputed.profit,
        totalImpliedProbability: recomputed.totalImpliedProbability,
        bets: recomputed.bets,
        stake: totalStake,
        guaranteedReturn: recomputed.guaranteedReturn,
      });
    }
  }

  return opportunities;
}

/**
 * Find all arbitrage opportunities from a list of events
 */
export function findAllArbitrages(
  events: EventWithOdds[],
  totalStake: number = 1000,
  taxRate: number = DEFAULT_TAX_RATE,
  taxFreeKeys: Set<string> = DEFAULT_TAX_FREE_KEYS
): ArbitrageOpportunity[] {
  const allOpportunities: ArbitrageOpportunity[] = [];

  for (const event of events) {
    const opportunities = findArbitrageForEvent(event, totalStake, taxRate, taxFreeKeys);
    allOpportunities.push(...opportunities);
  }

  // Sort by profit descending
  return allOpportunities.sort((a, b) => b.profit - a.profit);
}

export function findNearArbitrageForEvent(
  event: EventWithOdds,
  threshold: number = DEFAULT_NEAR_ARBITRAGE_THRESHOLD,
  taxRate: number = DEFAULT_TAX_RATE,
  taxFreeKeys: Set<string> = DEFAULT_TAX_FREE_KEYS
): NearArbitrageOpportunity[] {
  const opportunities: NearArbitrageOpportunity[] = [];

  for (const market of event.markets) {
    const outcomes = market.outcomes;
    if (outcomes.length < 2 || outcomes.some((outcome) => outcome.bookmakers.length === 0)) {
      continue;
    }

    // outcomes[].odds stays gross; the threshold/adjustment search below
    // works in net (after-tax) odds space so the radar reflects real profit.
    const bestOdds = outcomes.map((outcome) => ({
      outcome: outcome.name,
      bookmaker: outcome.bestOdds.bookmaker,
      bookmakerKey: outcome.bestOdds.bookmakerKey,
      odds: outcome.bestOdds.odds,
    }));

    const netOdds = bestOdds.map((o) => effectiveOdds(o.odds, o.bookmakerKey, taxRate, taxFreeKeys));
    const totalImpliedProbability = netOdds.reduce((sum, o) => sum + 1 / o, 0);

    if (totalImpliedProbability < 1 || totalImpliedProbability > 1 + threshold) {
      continue;
    }

    let bestAdjustment:
      | {
          outcome: string;
          bookmaker: string;
          bookmakerKey: string;
          currentOdds: number;
          targetOdds: number;
          requiredOddsChangePercent: number;
        }
      | null = null;

    for (let i = 0; i < bestOdds.length; i++) {
      const outcome = bestOdds[i];
      const inverseOdds = 1 / netOdds[i];
      const remainingImpliedProbability = totalImpliedProbability - inverseOdds;

      if (remainingImpliedProbability >= 1) {
        continue;
      }

      const targetNetOdds = 1 / (1 - remainingImpliedProbability);
      const targetOdds = grossOddsForNet(targetNetOdds, outcome.bookmakerKey, taxRate, taxFreeKeys);
      const requiredOddsChangePercent = ((targetOdds - outcome.odds) / outcome.odds) * 100;

      if (requiredOddsChangePercent <= 0) {
        continue;
      }

      if (!bestAdjustment || requiredOddsChangePercent < bestAdjustment.requiredOddsChangePercent) {
        bestAdjustment = {
          outcome: outcome.outcome,
          bookmaker: outcome.bookmaker,
          bookmakerKey: outcome.bookmakerKey,
          currentOdds: outcome.odds,
          targetOdds,
          requiredOddsChangePercent,
        };
      }
    }

    if (!bestAdjustment) {
      continue;
    }

    opportunities.push({
      id: `${event.id}-${market.marketKey}-near`,
      event,
      marketKey: market.marketKey,
      totalImpliedProbability: Math.round(totalImpliedProbability * 10000) / 10000,
      distanceFromArbitrage: Math.round((totalImpliedProbability - 1) * 10000) / 100,
      requiredOddsChangePercent:
        Math.round(bestAdjustment.requiredOddsChangePercent * 100) / 100,
      targetOutcome: bestAdjustment.outcome,
      currentOdds: Math.round(bestAdjustment.currentOdds * 100) / 100,
      targetOdds: Math.round(bestAdjustment.targetOdds * 100) / 100,
      bookmaker: bestAdjustment.bookmaker,
      bookmakerKey: bestAdjustment.bookmakerKey,
      outcomes: bestOdds,
    });
  }

  return opportunities;
}

export function findAllNearArbitrages(
  events: EventWithOdds[],
  threshold: number = DEFAULT_NEAR_ARBITRAGE_THRESHOLD,
  taxRate: number = DEFAULT_TAX_RATE,
  taxFreeKeys: Set<string> = DEFAULT_TAX_FREE_KEYS
): NearArbitrageOpportunity[] {
  const nearArbitrages: NearArbitrageOpportunity[] = [];

  for (const event of events) {
    nearArbitrages.push(...findNearArbitrageForEvent(event, threshold, taxRate, taxFreeKeys));
  }

  return nearArbitrages.sort((left, right) => {
    if (left.requiredOddsChangePercent === right.requiredOddsChangePercent) {
      return left.distanceFromArbitrage - right.distanceFromArbitrage;
    }

    return left.requiredOddsChangePercent - right.requiredOddsChangePercent;
  });
}

/**
 * Calculate stakes for a specific set of odds
 */
export function calculateArbitrageStakes(
  odds: number[],
  totalStake: number
): { stakes: number[]; profit: number; isArbitrage: boolean } {
  const totalImplied = odds.reduce((sum, o) => sum + 1 / o, 0);
  const isArbitrage = totalImplied < 1;
  const profit = isArbitrage ? (1 / totalImplied - 1) * 100 : 0;

  const stakes = odds.map((o) => {
    const stake = totalStake * (1 / o / totalImplied);
    return Math.round(stake * 100) / 100;
  });

  return { stakes, profit: Math.round(profit * 100) / 100, isArbitrage };
}

/**
 * Get implied probability from decimal odds
 */
export function impliedProbability(odds: number): number {
  return Math.round((1 / odds) * 10000) / 100;
}

/**
 * Categorize profit level
 */
export function profitCategory(profit: number): 'low' | 'medium' | 'high' {
  if (profit >= 5) return 'high';
  if (profit >= 2) return 'medium';
  return 'low';
}

/**
 * Round a stake to the nearest step (e.g. nearest 10 PLN)
 */
export function roundStake(stake: number, step: number): number {
  return Math.round(stake / step) * step;
}

/**
 * Calculate the hedge stake needed to guarantee a profit (or minimise loss)
 * given an already-placed original bet.
 *
 * @param originalStake  Amount already staked on the original outcome
 * @param originalOdds   Decimal odds of the original outcome
 * @param hedgeOdds      Current odds for the opposing / covering outcome
 * @returns              Stake to place on the hedge
 */
export function calculateHedgeStake(
  originalStake: number,
  originalOdds: number,
  hedgeOdds: number
): number {
  if (hedgeOdds <= 1) return 0;
  const potentialWin = originalStake * originalOdds;
  return Math.round((potentialWin / hedgeOdds) * 100) / 100;
}

/**
 * Calculate the bookmaker's overround (margin) for a set of decimal odds.
 * Returns the margin as a percentage (e.g. 5.2 means 5.2% margin).
 */
export function calculateMargin(odds: number[]): number {
  if (odds.length === 0) return 0;
  const implied = odds.reduce((sum, o) => sum + (o > 0 ? 1 / o : 0), 0);
  return Math.round((implied - 1) * 10000) / 100;
}

/**
 * Calculate the net decimal odds after tax.
 * Polish bookmaker tax (podatek od zakładów wzajemnych, 12%) is a turnover
 * tax: it's deducted from the stake itself before the bet is placed, not
 * from the profit. E.g. a 100 zł stake at odds 1.10 only has 88 zł actually
 * in play, returning 88 * 1.10 = 96.80 zł — a loss, even though the gross
 * odds are above 1. Net odds therefore scale the whole multiplier: a bet
 * only breaks even once odds >= 1 / (1 - taxRate/100) (~1.136 at 12%).
 *
 * @param odds     Gross decimal odds offered by bookmaker
 * @param taxRate  Tax rate as a percentage (e.g. 12 for 12%)
 * @returns        Net decimal odds after tax
 */
export function netOddsAfterTax(odds: number, taxRate: number): number {
  if (odds <= 1) return odds;
  const netOdds = odds * (1 - taxRate / 100);
  return Math.round(netOdds * 10000) / 10000;
}

function isTaxFreeBookmaker(bookmakerKey: string, taxFreeKeys: Set<string>): boolean {
  const normalizedKey = bookmakerKey?.toLowerCase().replace(/\s+/g, "") ?? "";
  return taxFreeKeys.has(normalizedKey);
}

/**
 * Decimal odds after tax for a specific bookmaker — bookmakers with a
 * tax-free game mode (e.g. Betclic) keep their gross odds, others get
 * `netOddsAfterTax`.
 */
export function effectiveOdds(
  odds: number,
  bookmakerKey: string,
  taxRate: number = DEFAULT_TAX_RATE,
  taxFreeKeys: Set<string> = DEFAULT_TAX_FREE_KEYS
): number {
  if (isTaxFreeBookmaker(bookmakerKey, taxFreeKeys)) return odds;
  return netOddsAfterTax(odds, taxRate);
}

/**
 * Inverse of `effectiveOdds` — given a target net (after-tax) decimal odds,
 * returns the gross odds a bookmaker would need to display.
 */
export function grossOddsForNet(
  netOdds: number,
  bookmakerKey: string,
  taxRate: number = DEFAULT_TAX_RATE,
  taxFreeKeys: Set<string> = DEFAULT_TAX_FREE_KEYS
): number {
  if (isTaxFreeBookmaker(bookmakerKey, taxFreeKeys) || netOdds <= 1) return netOdds;
  const grossOdds = netOdds / (1 - taxRate / 100);
  return Math.round(grossOdds * 10000) / 10000;
}

/**
 * Recompute stakes, returns and profit for a set of bets after tax.
 * `bets[].odds` is treated as gross (what's entered at the bookmaker) and
 * is preserved as-is; stake/potentialReturn/profit are derived from the
 * net (after-tax) odds.
 */
export function recomputeStakesWithTax(
  bets: ArbitrageBet[],
  totalStake: number,
  taxRate: number = DEFAULT_TAX_RATE,
  taxFreeKeys: Set<string> = DEFAULT_TAX_FREE_KEYS
): {
  bets: ArbitrageBet[];
  profit: number;
  totalImpliedProbability: number;
  guaranteedReturn: number;
  isArbitrage: boolean;
} {
  const netOdds = bets.map((bet) => effectiveOdds(bet.odds, bet.bookmakerKey, taxRate, taxFreeKeys));
  const { stakes, profit, isArbitrage } = calculateArbitrageStakes(netOdds, totalStake);
  const totalImpliedProbability = netOdds.reduce((sum, odds) => sum + 1 / odds, 0);

  const recomputedBets: ArbitrageBet[] = bets.map((bet, index) => ({
    ...bet,
    stake: stakes[index],
    potentialReturn: Math.round(stakes[index] * netOdds[index] * 100) / 100,
  }));

  return {
    bets: recomputedBets,
    profit,
    totalImpliedProbability: Math.round(totalImpliedProbability * 10000) / 10000,
    guaranteedReturn: recomputedBets[0]?.potentialReturn ?? 0,
    isArbitrage,
  };
}

