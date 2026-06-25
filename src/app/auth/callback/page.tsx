"use client";

import { useEffect, useRef, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import BrandLogo from "@/components/BrandLogo";

// Supabase can hand the session back in several shapes depending on the
// provider/flow, so the callback handles all of them — works on a static
// export (out/) with no server, exactly like a Vite/Netlify SPA:
//   • ?code=...                      → OAuth/PKCE (e.g. Google) + magic links
//   • #access_token=&refresh_token=  → implicit flow (tokens in URL hash)
//   • ?token_hash=&type=             → e-mail confirmation / recovery links
export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    // React StrictMode runs effects twice in dev; an auth code/token can only
    // be consumed once, so guard against a double run.
    if (ran.current) return;
    ran.current = true;

    (async () => {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const next = query.get("next") || "/";

      const fail = (msg: string) => {
        setError(msg);
        window.location.replace(`/login?error=${encodeURIComponent(msg)}`);
      };

      // Provider rejected the request (denied consent, misconfig, etc.)
      const oauthError =
        query.get("error_description") ?? query.get("error") ??
        hash.get("error_description") ?? hash.get("error");
      if (oauthError) {
        fail(oauthError);
        return;
      }

      const supabase = createClient();

      try {
        const code = query.get("code");
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        const tokenHash = query.get("token_hash");
        const type = query.get("type");

        if (code) {
          const { error: e } = await supabase.auth.exchangeCodeForSession(code);
          if (e) throw e;
        } else if (accessToken && refreshToken) {
          const { error: e } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (e) throw e;
        } else if (tokenHash && type) {
          const { error: e } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          });
          if (e) throw e;
        } else {
          // No recognised params — maybe the session is already set.
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            fail("Brak danych autoryzacji w odpowiedzi.");
            return;
          }
        }
      } catch (e) {
        // A duplicate/StrictMode run may have already set the session — accept
        // that case before surfacing the error.
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          fail(e instanceof Error ? e.message : "Logowanie nie powiodło się.");
          return;
        }
      }

      // Full reload so AppProvider/Sidebar re-read the freshly set session.
      window.location.replace(next);
    })();
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-4 text-center">
        <BrandLogo size={48} className="mx-auto rounded-xl" />
        {error ? (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        ) : (
          <p className="text-sm text-white/60">Logowanie…</p>
        )}
      </div>
    </div>
  );
}
