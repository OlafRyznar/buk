"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";

export default function DemoModeBanner() {
  const { settings } = useApp();

  if (settings.isPremium) return null;

  return (
    <div className="sticky top-0 z-40 w-full">
      <div className="flex flex-col gap-2 border-b border-amber-300/20 bg-amber-300/12 px-3 py-2 text-xs backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5">
        <div className="min-w-0 flex items-start gap-2 text-amber-50/90 sm:items-center">
          <span className="shrink-0">🎮</span>
          <span className="text-[11px] leading-5 sm:text-xs">
            <strong className="text-amber-50">Tryb Demo</strong> — kursy są
            symulowane. Wirtualne saldo:{" "}
            <span className="font-mono font-semibold text-amber-100">
              {settings.virtualBalance.toLocaleString("pl-PL")} zł
            </span>
          </span>
        </div>
        <Link
          href="/settings#subscription"
          className="w-full whitespace-nowrap rounded-xl border border-amber-300/35 bg-amber-300/22 px-3 py-1.5 text-center font-semibold text-amber-50 transition hover:bg-amber-300/30 sm:w-auto"
        >
          Aktywuj Premium →
        </Link>
      </div>
    </div>
  );
}
