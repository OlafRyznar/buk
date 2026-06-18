"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BrandLogo from "@/components/BrandLogo";

// Client-side OAuth/email-confirmation callback — exchanges the `code` query
// param for a session entirely in the browser via supabase-js, so it works
// on plain static hosting too (no Next.js server, no Route Handler needed).
function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    const next = params.get("next") || "/";

    if (!code) {
      setError("Brak kodu potwierdzającego w linku.");
      return;
    }

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) {
        setError("Nie udało się potwierdzić adresu e-mail.");
        return;
      }
      router.push(next);
      router.refresh();
    });
  }, [params, router]);

  if (error) {
    return (
      <>
        <p className="text-rose-300 font-semibold">{error}</p>
        <a href="/login" className="inline-block text-sky-400 hover:text-sky-300 text-sm font-medium">
          Wróć do logowania
        </a>
      </>
    );
  }

  return <p className="text-white/60 text-sm">Logowanie…</p>;
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-4 text-center">
        <BrandLogo size={48} className="mx-auto rounded-xl" />
        <Suspense fallback={<p className="text-white/60 text-sm">Logowanie…</p>}>
          <CallbackInner />
        </Suspense>
      </div>
    </div>
  );
}
