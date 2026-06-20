import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        // PKCE so the OAuth code can be exchanged client-side (works on a
        // static export with no server). detectSessionInUrl is off because
        // the /auth/callback page exchanges the code explicitly — letting
        // the client auto-exchange too would consume the code twice.
        flowType: "pkce",
        detectSessionInUrl: false,
      },
    }
  );
}
