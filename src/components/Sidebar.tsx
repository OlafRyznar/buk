"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/arbitrage",
    label: "Arbitraż",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    href: "/events",
    label: "Wydarzenia",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/calculator",
    label: "Kalkulator",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/margins",
    label: "Marże",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/strategies",
    label: "Strategie",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    href: "/journal",
    label: "Dziennik",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/notifications",
    label: "Powiadomienia",
    badge: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Ustawienia",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, settings } = useApp();

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  const renderNav = (mobile = false) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = isItemActive(item.href);
        const showBadge = item.badge && unreadCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`group flex items-center gap-3 rounded-lg border-l-2 px-3 transition-colors ${
              isActive
                ? "border-l-sky-400 border-white/12 bg-white/8 text-white"
                : "border-l-transparent border-transparent text-white/74 hover:border-white/10 hover:bg-white/6 hover:text-white"
            } ${mobile ? "py-3 text-base" : "py-2.5 text-sm"}`}
          >
            <span
              className={`relative rounded-md p-1.5 transition ${
                isActive ? "bg-white/10 text-sky-300" : "bg-black/15 text-white/58 group-hover:text-white"
              }`}
            >
              {item.icon}
              {showBadge && (
                <span suppressHydrationWarning className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span className="font-medium tracking-[0.02em]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 lg:hidden">
        <div className="soft-panel flex items-center justify-between rounded-lg border border-white/12 px-3 py-2.5">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/8 text-xs font-bold text-white">
              B
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">BukScan</h1>
              <p className="text-[10px] text-white/50">panel arbitrażu</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="rounded-md border border-white/15 bg-white/8 p-2 text-white transition hover:bg-white/12"
            aria-label="Otwórz menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 px-3 pb-4 pt-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="soft-panel max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border border-white/12 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/54">Nawigacja</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-white/16 bg-white/8 px-2.5 py-1 text-xs text-white/76 transition hover:bg-white/12"
              >
                Zamknij
              </button>
            </div>
            {renderNav(true)}
            <div className="mt-4 rounded-lg border border-white/12 bg-white/6 p-3">
              <div className="flex items-center gap-2 text-sm text-white/86">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                Tryb demo: {settings.virtualBalance.toLocaleString("pl-PL")} zł
              </div>
              <p className="mt-1 text-xs leading-5 text-white/62">
                Dodaj ODDS_API_KEY w .env.local lub przejdź na Premium.
              </p>
            </div>
          </div>
        </div>
      )}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[288px] px-4 py-4 lg:block">
        <div className="soft-panel flex h-full flex-col rounded-xl border border-white/12 p-4">
          <div className="border-b border-white/12 pb-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/8 text-xs font-bold text-white">
                B
              </div>
              <div>
                <h1 className="text-base font-semibold text-white">BukScan</h1>
                <p className="text-[11px] text-white/52">prosty panel arbitrażu</p>
              </div>
            </Link>

            <p className="mt-3 text-sm leading-6 text-white/66">
              Najpierw najważniejsze dane. Bez przeładowania i bez zbędnych elementów.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-4">{renderNav()}</div>

          <div className="space-y-2 border-t border-white/12 pt-4">
            <div className="rounded-lg border border-white/12 bg-white/6 p-3">
              <div className="flex items-center gap-2 text-sm text-white/86">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300 animate-pulse-green" />
                Tryb demo
              </div>
              <p className="mt-1 text-xs leading-5 text-white/62">
                Wirtualne saldo:{" "}
                <span className="font-mono font-semibold text-white">
                  {settings.virtualBalance.toLocaleString("pl-PL")} zł
                </span>
              </p>
              <Link
                href="/settings"
                className="mt-2 inline-flex items-center gap-1 text-xs text-sky-300 transition hover:text-sky-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                Przejdź na Premium
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
