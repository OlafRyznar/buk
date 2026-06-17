"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useApp } from "@/components/AppProvider";
import { createClient } from "@/lib/supabase/client";
import BrandLogo from "@/components/BrandLogo";

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
    href: "/kalkulator",
    label: "Kalkulator",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
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
    href: "/account",
    label: "Konto",
    badge: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useApp();

  const [syncInfo, setSyncInfo] = useState<{
    isSyncing: boolean;
    lastSyncTime: number | null;
    lastSyncCount: number;
    hasData: boolean;
  }>({
    isSyncing: false,
    lastSyncTime: null,
    lastSyncCount: 0,
    hasData: false
  });
  const [localSyncing, setLocalSyncing] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const data = await res.json();
        setSyncInfo(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (localSyncing || syncInfo.isSyncing) return;
    setLocalSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncInfo({
          isSyncing: false,
          lastSyncTime: data.timestamp ?? syncInfo.lastSyncTime,
          lastSyncCount: data.count ?? syncInfo.lastSyncCount,
          hasData: true
        });
        router.refresh();
        // Cooldown hit — data was already fresh, let the user know.
        if (data.skipped && data.message) alert(data.message);
      } else {
        alert(data.message || data.error || 'Błąd synchronizacji.');
      }
    } catch (e) {
      console.error(e);
      alert('Nie udało się połączyć z serwerem synchronizacji.');
    } finally {
      setLocalSyncing(false);
      fetchSyncStatus();
    }
  };

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  const renderSyncBlock = () => {
    // Static export has no API/scraper — hide the sync panel entirely.
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") return null;
    const active = localSyncing || syncInfo.isSyncing;
    const timeText = syncInfo.lastSyncTime 
      ? new Date(syncInfo.lastSyncTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : 'nigdy';

    return (
      <div className="rounded-xl border border-white/5 bg-white/[0.015] p-3 text-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-white/40 font-medium">Baza danych</span>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            syncInfo.hasData 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-amber-500/10 text-amber-400'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${syncInfo.hasData ? 'bg-emerald-400' : 'bg-amber-400'} ${active ? 'animate-pulse' : ''}`} />
            {syncInfo.hasData ? `Live (${syncInfo.lastSyncCount} meczów)` : 'Demo'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-white/30">
          <span>Ostatnia synch.:</span>
          <span className="font-mono">{timeText}</span>
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={active}
          className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-white transition ${
            active
              ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
              : 'btn-primary'
          }`}
        >
          {active ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white/60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Skanowanie 8 bukmacherów... (1–2 min)
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
              </svg>
              Skanuj kursy (8 bukmacherów)
            </>
          )}
        </button>
      </div>
    );
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const renderUserBlock = () => {
    if (!userEmail) return null;
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-transparent p-3 text-xs">
        <div className="min-w-0">
          <p className="text-white/40">Zalogowano jako</p>
          <p className="truncate font-medium text-white/85">{userEmail}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 rounded-lg border border-white/15 bg-white/8 px-2.5 py-1.5 font-medium text-white/70 transition hover:bg-white/12 hover:text-white"
        >
          Wyloguj
        </button>
      </div>
    );
  };

  const renderNav = (mobile = false) => (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const isActive = isItemActive(item.href);
        const showBadge = item.badge && unreadCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`group relative flex items-center gap-3 rounded-lg px-3 transition-colors ${
              isActive
                ? "bg-gradient-to-r from-sky-400/15 to-transparent text-white font-semibold"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            } ${mobile ? "py-3 text-base" : "py-2 text-sm"}`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sky-400" />
            )}
            <span
              className={`relative rounded-md p-1 transition-colors ${
                isActive ? "text-sky-400" : "text-white/40 group-hover:text-white/80"
              }`}
            >
              {item.icon}
              {showBadge && (
                <span suppressHydrationWarning className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span className="tracking-[0.01em]">{item.label}</span>
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
            <BrandLogo size={32} />
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

            <div className="mt-4 space-y-3">
              {renderUserBlock()}
              {renderSyncBlock()}
            </div>
          </div>
        </div>
      )}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] border-r border-white/8 bg-[#0b0e11]/25 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col p-6">
          <div className="border-b border-white/8 pb-4">
            <Link href="/" className="flex items-center gap-3">
              <BrandLogo size={32} />
              <div>
                <h1 className="text-base font-semibold text-white">BukScan</h1>
                <p className="text-[11px] text-white/50">panel arbitrażu</p>
              </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-5">{renderNav()}</div>

          <div className="space-y-3 border-t border-white/8 pt-5">
            {renderUserBlock()}
            {renderSyncBlock()}
          </div>
        </div>
      </aside>
    </>
  );
}
