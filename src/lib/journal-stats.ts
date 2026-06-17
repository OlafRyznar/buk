import { JournalEntry } from "./store-types";

export interface JournalStats {
  totalProfit: number;
  totalStake: number;
  roi: number;
  wonCount: number;
  closedCount: number;
  pendingCount: number;
  winRate: number | null;
  monthlyProfits: { month: string; profit: number }[];
}

export function computeJournalStats(journal: JournalEntry[]): JournalStats {
  const settled = journal.filter((e) => e.status !== "cancelled");
  const totalProfit = settled.reduce((s, e) => s + e.profit, 0);
  const totalStake = settled.reduce((s, e) => s + e.totalStake, 0);
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
  const wonCount = journal.filter((e) => e.status === "won").length;
  const closedCount = journal.filter((e) => e.status === "won" || e.status === "lost").length;
  const pendingCount = journal.filter((e) => e.status === "pending").length;
  const winRate = closedCount > 0 ? (wonCount / closedCount) * 100 : null;

  const monthlyMap: Record<string, number> = {};
  // Oldest entries are sorted last by default in journal — walk in chronological
  // order so the resulting chart reads left-to-right as time moving forward.
  [...journal]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .forEach((e) => {
      const m = new Date(e.createdAt).toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
      monthlyMap[m] = (monthlyMap[m] || 0) + (e.status !== "cancelled" ? e.profit : 0);
    });

  return {
    totalProfit,
    totalStake,
    roi,
    wonCount,
    closedCount,
    pendingCount,
    winRate,
    monthlyProfits: Object.entries(monthlyMap).map(([month, profit]) => ({ month, profit })),
  };
}
