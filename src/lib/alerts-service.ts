// Client-side reads/writes for notify_settings and event_alerts — called
// directly from the browser via Supabase, no Next.js API route involved.
// The VPS background worker reads the same tables with a service-role key.
import type { SupabaseClient } from "@supabase/supabase-js";

export interface NotifySettingsRow {
  enabled: boolean;
  minutesBefore: number;
  email: string;
}

export async function fetchNotifySettings(supabase: SupabaseClient, userId: string): Promise<NotifySettingsRow | null> {
  const { data, error } = await supabase
    .from("notify_settings")
    .select("enabled, minutes_before, email")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return { enabled: data.enabled, minutesBefore: data.minutes_before, email: data.email };
}

export async function upsertNotifySettings(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  partial: Partial<NotifySettingsRow>
): Promise<void> {
  const { error } = await supabase.from("notify_settings").upsert({
    user_id: userId,
    email,
    ...(partial.enabled !== undefined ? { enabled: partial.enabled } : {}),
    ...(partial.minutesBefore !== undefined ? { minutes_before: partial.minutesBefore } : {}),
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("[alerts-service] upsertNotifySettings failed:", error);
}

export type EventAlertType = "before-kickoff" | "at-time" | "odds-threshold";

export interface EventAlertRow {
  id: string;
  eventId: string;
  type: EventAlertType;
  minutesBefore?: number;
  atTime?: string;
  outcomeName?: string;
  thresholdPrice?: number;
}

export interface UserEventAlert extends EventAlertRow {
  email: string;
}

// All of a user's event subscriptions (across every match) — used by the
// client watcher to fire ONLY the alerts the user explicitly added.
export async function fetchUserEventAlerts(
  supabase: SupabaseClient,
  userId: string
): Promise<UserEventAlert[]> {
  const { data, error } = await supabase
    .from("event_alerts")
    .select("id, event_id, email, type, minutes_before, at_time, outcome_name, threshold_price")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    eventId: r.event_id,
    email: r.email,
    type: r.type,
    minutesBefore: r.minutes_before ?? undefined,
    atTime: r.at_time ?? undefined,
    outcomeName: r.outcome_name ?? undefined,
    thresholdPrice: r.threshold_price ?? undefined,
  }));
}

export async function fetchEventAlerts(supabase: SupabaseClient, eventId: string): Promise<EventAlertRow[]> {
  const { data, error } = await supabase
    .from("event_alerts")
    .select("id, event_id, type, minutes_before, at_time, outcome_name, threshold_price")
    .eq("event_id", eventId);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    eventId: r.event_id,
    type: r.type,
    minutesBefore: r.minutes_before ?? undefined,
    atTime: r.at_time ?? undefined,
    outcomeName: r.outcome_name ?? undefined,
    thresholdPrice: r.threshold_price ?? undefined,
  }));
}

export async function addEventAlert(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  alert: {
    eventId: string;
    eventName: string;
    sportTitle: string;
    type: EventAlertType;
    minutesBefore?: number;
    atTime?: string;
    outcomeName?: string;
    thresholdPrice?: number;
  }
): Promise<boolean> {
  const { error } = await supabase.from("event_alerts").insert({
    user_id: userId,
    email,
    event_id: alert.eventId,
    event_name: alert.eventName,
    sport_title: alert.sportTitle,
    type: alert.type,
    minutes_before: alert.minutesBefore ?? null,
    at_time: alert.atTime ?? null,
    outcome_name: alert.outcomeName ?? null,
    threshold_price: alert.thresholdPrice ?? null,
  });
  if (error) console.error("[alerts-service] addEventAlert failed:", error);
  return !error;
}

export async function removeEventAlert(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { data, error } = await supabase.from("event_alerts").delete().eq("id", id).select();
  if (error) {
    console.error("[alerts-service] removeEventAlert failed:", error);
    return false;
  }
  return data ? data.length > 0 : false;
}
