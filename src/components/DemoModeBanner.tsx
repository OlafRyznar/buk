"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";

export default function DemoModeBanner() {
  const { settings } = useApp();

  if (settings.isPremium) return null;

  return (
    <div className="sticky top-0 z-40 w-full">
      <div className="flex flex-col gap-2 border-b border-amber-500/10 bg-amber-500/5 px-3 py-2 text-xs backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5">
        <div className="min-w-0 flex items-start gap-2 text-amber-200/80 sm:items-center">
          <span className="text-[11px] leading-5 sm:text-xs">
            <strong className="text-amber-200 font-semibold">Tryb Demo</strong> — kursy są symulowane. Wirtualne saldo:{" "}
            <span className="font-mono font-semibold text-amber-100">
              {settings.virtualBalance.toLocaleString("pl-PL")} zł
            </span>
          </span>
        </div>
        <Link
          href="/account"
          className="w-full whitespace-nowrap rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-center font-medium text-amber-200 transition hover:bg-amber-500/20 sm:w-auto text-xs"
        >
          Aktywuj Premium
        </Link>
      </div>
    </div>
  );
}
