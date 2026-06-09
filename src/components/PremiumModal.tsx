"use client";

import Link from "next/link";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

const PLAN_FEATURES = [
  "Kursy w czasie rzeczywistym (opóźnienie 0s)",
  "Alerty push i e-mail dla nowych surebetów",
  "Dostęp do widełek środkowych i ValueBet live",
  "Historia kursów i wykresy trendów",
  "Nieograniczona liczba wpisów w dzienniku",
  "Priorytetowe wsparcie techniczne",
];

export default function PremiumModal({ isOpen, onClose, featureName }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="glass-panel animate-slide-up mx-3 mb-3 w-full max-w-md space-y-5 rounded-3xl border border-white/15 p-5 sm:mx-4 sm:mb-0 sm:space-y-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-3">⭐</div>
          <h2 className="text-2xl font-bold text-white mb-2">BukScan Premium</h2>
          {featureName && (
            <p className="text-sm text-white/65">
              Funkcja{" "}
              <span className="text-amber-200 font-semibold">{featureName}</span>{" "}
              wymaga konta Premium.
            </p>
          )}
          {!featureName && (
            <p className="text-sm text-white/65">
              Odblokuj pełne możliwości arbitrażu sportowego.
            </p>
          )}
        </div>

        {/* Features list */}
        <ul className="space-y-2">
          {PLAN_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-white/80">
              <span className="text-emerald-400 shrink-0">✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* Pricing teaser */}
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/12 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Od</p>
            <p className="text-2xl font-bold text-amber-200">
              29 zł<span className="text-sm font-normal text-white/50">/mies.</span>
            </p>
          </div>
          <Link
            href="/settings"
            onClick={onClose}
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-400"
          >
            Wybierz plan →
          </Link>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full rounded-2xl border border-white/12 bg-white/6 py-3 text-sm text-white/65 transition hover:text-white"
        >
          Pozostań w trybie demo
        </button>
      </div>
    </div>
  );
}
