// Service-role Supabase client — bypasses RLS so the background alert
// worker can scan every user's notify_settings/event_alerts, not just one.
// NEVER import this from client components or expose the key as NEXT_PUBLIC_*.
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for the alert worker.");
  }
  return createSupabaseClient(url, serviceKey, { auth: { persistSession: false } });
}
