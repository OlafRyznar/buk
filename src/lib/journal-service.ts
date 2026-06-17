import type { SupabaseClient } from "@supabase/supabase-js";
import { JournalEntry, JournalBet } from "./store-types";

interface JournalEntryRow {
  id: string;
  created_at: string;
  event_name: string;
  sport_title: string;
  commence_time: string;
  market_key: string;
  bets: JournalBet[];
  total_stake: number;
  guaranteed_return: number;
  profit: number;
  profit_percent: number;
  status: JournalEntry["status"];
  notes: string;
  arbitrage_id: string | null;
  is_demo: boolean;
}

function rowToEntry(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    createdAt: row.created_at,
    eventName: row.event_name,
    sportTitle: row.sport_title,
    commenceTime: row.commence_time,
    marketKey: row.market_key,
    bets: row.bets,
    totalStake: row.total_stake,
    guaranteedReturn: row.guaranteed_return,
    profit: row.profit,
    profitPercent: row.profit_percent,
    status: row.status,
    notes: row.notes,
    arbitrageId: row.arbitrage_id ?? undefined,
    isDemo: row.is_demo,
  };
}

function entryToRow(entry: Omit<JournalEntry, "id" | "createdAt">, userId: string) {
  return {
    user_id: userId,
    event_name: entry.eventName,
    sport_title: entry.sportTitle,
    commence_time: entry.commenceTime,
    market_key: entry.marketKey,
    bets: entry.bets,
    total_stake: entry.totalStake,
    guaranteed_return: entry.guaranteedReturn,
    profit: entry.profit,
    profit_percent: entry.profitPercent,
    status: entry.status,
    notes: entry.notes,
    arbitrage_id: entry.arbitrageId ?? null,
    is_demo: entry.isDemo ?? false,
  };
}

function updatesToRow(updates: Partial<JournalEntry>) {
  const row: Record<string, unknown> = {};
  if (updates.eventName !== undefined) row.event_name = updates.eventName;
  if (updates.sportTitle !== undefined) row.sport_title = updates.sportTitle;
  if (updates.commenceTime !== undefined) row.commence_time = updates.commenceTime;
  if (updates.marketKey !== undefined) row.market_key = updates.marketKey;
  if (updates.bets !== undefined) row.bets = updates.bets;
  if (updates.totalStake !== undefined) row.total_stake = updates.totalStake;
  if (updates.guaranteedReturn !== undefined) row.guaranteed_return = updates.guaranteedReturn;
  if (updates.profit !== undefined) row.profit = updates.profit;
  if (updates.profitPercent !== undefined) row.profit_percent = updates.profitPercent;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.notes !== undefined) row.notes = updates.notes;
  if (updates.arbitrageId !== undefined) row.arbitrage_id = updates.arbitrageId ?? null;
  if (updates.isDemo !== undefined) row.is_demo = updates.isDemo;
  return row;
}

export async function fetchJournal(supabase: SupabaseClient, userId: string): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[journal-service] fetchJournal failed:", error);
    return [];
  }
  return (data as JournalEntryRow[]).map(rowToEntry);
}

export async function insertJournalEntry(
  supabase: SupabaseClient,
  userId: string,
  entry: Omit<JournalEntry, "id" | "createdAt">
): Promise<JournalEntry | null> {
  const { data, error } = await supabase
    .from("journal_entries")
    .insert(entryToRow(entry, userId))
    .select("*")
    .single();

  if (error) {
    console.error("[journal-service] insertJournalEntry failed:", error);
    return null;
  }
  return rowToEntry(data as JournalEntryRow);
}

export async function updateJournalEntryRow(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<JournalEntry>
): Promise<void> {
  const { error } = await supabase.from("journal_entries").update(updatesToRow(updates)).eq("id", id);
  if (error) console.error("[journal-service] updateJournalEntryRow failed:", error);
}

export async function deleteJournalEntryRow(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("journal_entries").delete().eq("id", id);
  if (error) console.error("[journal-service] deleteJournalEntryRow failed:", error);
}
