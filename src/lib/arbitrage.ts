import {
  EventWithOdds,
  ArbitrageOpportunity,
  ArbitrageBet,
  NearArbitrageOpportunity,
} from './types';

const DEFAULT_NEAR_ARBITRAGE_THRESHOLD = 0.04;

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
  totalStake: number = 1000
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

    // Calculate total implied probability
    const totalImpliedProbability = bestOdds.reduce(
      (sum, o) => sum + 1 / o.odds,
      0
    );

    // Arbitrage exists if total implied probability < 1
    if (totalImpliedProbability < 1) {
      const profit = (1 / totalImpliedProbability - 1) * 100;

      // Calculate optimal stakes for each outcome
      const bets: ArbitrageBet[] = bestOdds.map((o) => {
        const stake = totalStake * (1 / o.odds / totalImpliedProbability);
        return {
          outcome: o.outcome,
          bookmaker: o.bookmaker,
          bookmakerKey: o.bookmakerKey,
          odds: o.odds,
          stake: Math.round(stake * 100) / 100,
          potentialReturn: Math.round(stake * o.odds * 100) / 100,
        };
      });

      const guaranteedReturn = bets[0].potentialReturn;

      opportunities.push({
        id: `${event.id}-${market.marketKey}`,
        event,
        marketKey: market.marketKey,
        profit: Math.round(profit * 100) / 100,
        totalImpliedProbability: Math.round(totalImpliedProbability * 10000) / 10000,
        bets,
        stake: totalStake,
        guaranteedReturn: Math.round(guaranteedReturn * 100) / 100,
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
  totalStake: number = 1000
): ArbitrageOpportunity[] {
  const allOpportunities: ArbitrageOpportunity[] = [];

  for (const event of events) {
    const opportunities = findArbitrageForEvent(event, totalStake);
    allOpportunities.push(...opportunities);
  }

  // Sort by profit descending
  return allOpportunities.sort((a, b) => b.profit - a.profit);
}

export function findNearArbitrageForEvent(
  event: EventWithOdds,
  threshold: number = DEFAULT_NEAR_ARBITRAGE_THRESHOLD
): NearArbitrageOpportunity[] {
  const opportunities: NearArbitrageOpportunity[] = [];

  for (const market of event.markets) {
    const outcomes = market.outcomes;
    if (outcomes.length < 2 || outcomes.some((outcome) => outcome.bookmakers.length === 0)) {
      continue;
    }

    const bestOdds = outcomes.map((outcome) => ({
      outcome: outcome.name,
      bookmaker: outcome.bestOdds.bookmaker,
      bookmakerKey: outcome.bestOdds.bookmakerKey,
      odds: outcome.bestOdds.odds,
    }));

    const totalImpliedProbability = bestOdds.reduce((sum, outcome) => sum + 1 / outcome.odds, 0);

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

    for (const outcome of bestOdds) {
      const inverseOdds = 1 / outcome.odds;
      const remainingImpliedProbability = totalImpliedProbability - inverseOdds;

      if (remainingImpliedProbability >= 1) {
        continue;
      }

      const targetOdds = 1 / (1 - remainingImpliedProbability);
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
  threshold: number = DEFAULT_NEAR_ARBITRAGE_THRESHOLD
): NearArbitrageOpportunity[] {
  const nearArbitrages: NearArbitrageOpportunity[] = [];

  for (const event of events) {
    nearArbitrages.push(...findNearArbitrageForEvent(event, threshold));
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
 * Calculate the net decimal odds after tax on winnings.
 * Polish flat-rate tax applies to net profit only.
 *
 * @param odds     Gross decimal odds offered by bookmaker
 * @param taxRate  Tax rate as a percentage (e.g. 12 for 12%)
 * @returns        Net decimal odds after tax
 */
export function netOddsAfterTax(odds: number, taxRate: number): number {
  if (odds <= 1) return odds;
  const netProfit = (odds - 1) * (1 - taxRate / 100);
  return Math.round((1 + netProfit) * 10000) / 10000;
}

