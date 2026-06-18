"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GoogleAuthButton from "@/components/GoogleAuthButton";

interface AuthFormProps {
  mode: "login" | "register";
}

function AuthFormInner({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const isLogin = mode === "login";
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmSent, setConfirmSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!email || !password) {
      setError("Podaj adres e-mail i hasło.");
      return;
    }
    if (!isLogin && password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków.");
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }

    setIsPending(true);
    const supabase = createClient();

    if (isLogin) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setIsPending(false);
      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Nieprawidłowy e-mail lub hasło."
            : signInError.message
        );
        return;
      }
      router.push(redirectTo);
      router.refresh();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setIsPending(false);
    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "Konto z tym adresem e-mail już istnieje."
          : signUpError.message
      );
      return;
    }
    if (data.session) {
      router.push(redirectTo);
      router.refresh();
      return;
    }
    setConfirmSent(true);
  };

  if (confirmSent) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center space-y-2">
        <p className="text-emerald-300 font-semibold">Sprawdź swoją skrzynkę e-mail</p>
        <p className="text-sm text-white/60">
          Wysłaliśmy link potwierdzający. Kliknij go, aby aktywować konto i zalogować się.
        </p>
        <Link href="/login" className="inline-block mt-3 text-sky-400 hover:text-sky-300 text-sm font-medium">
          Wróć do logowania
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4">
      <GoogleAuthButton />
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/35">lub</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-white/40 font-semibold uppercase tracking-wider">Adres e-mail</label>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="twoj@email.com"
            className="mt-1.5 w-full rounded-[14px] border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400/50"
          />
        </div>

        <div>
          <label className="text-xs text-white/40 font-semibold uppercase tracking-wider">Hasło</label>
          <input
            type="password"
            name="password"
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-[14px] border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400/50"
          />
        </div>

        {!isLogin && (
          <div>
            <label className="text-xs text-white/40 font-semibold uppercase tracking-wider">Powtórz hasło</label>
            <input
              type="password"
              name="confirmPassword"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-[14px] border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400/50"
            />
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
        >
          {isPending ? "Chwila…" : isLogin ? "Zaloguj się" : "Zarejestruj się"}
        </button>

        <p className="text-center text-sm text-white/50">
          {isLogin ? (
            <>Nie masz konta? <Link href="/register" className="text-sky-400 hover:text-sky-300 font-medium">Zarejestruj się</Link></>
          ) : (
            <>Masz już konto? <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium">Zaloguj się</Link></>
          )}
        </p>
      </form>
    </div>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  return (
    <Suspense fallback={<div className="glass-panel rounded-2xl p-6 text-center text-sm text-white/50">Chwila…</div>}>
      <AuthFormInner mode={mode} />
    </Suspense>
  );
}
