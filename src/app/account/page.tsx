"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { JournalEntryStatus, ALL_BOOKMAKERS, AppNotification } from "@/lib/store-types";
import { computeJournalStats } from "@/lib/journal-stats";
import { createClient } from "@/lib/supabase/client";
import { JournalEntryCard, STATUS_META } from "@/components/JournalEntryCard";
import ProfitChart from "@/components/ProfitChart";
import BookmakerIcon from "@/components/BookmakerIcon";
import { firstNameFrom } from "@/lib/user-display";
import { fetchNotifySettings, upsertNotifySettings } from "@/lib/alerts-service";

interface Profile {
  email: string;
  displayName: string | null;
  createdAt: string;
}

type AccountTab = "overview" | "bookmakers" | "notifications" | "balances" | "safety" | "subscription";

const TABS_CONFIG: { id: AccountTab; label: string }[] = [
  { id: "overview", label: "Przegląd" },
  { id: "bookmakers", label: "Bukmacherzy" },
  { id: "notifications", label: "Powiadomienia" },
  { id: "balances", label: "Salda" },
  { id: "safety", label: "Bezpieczeństwo" },
  { id: "subscription", label: "Subskrypcja" },
];

function OverviewTab({ profile }: { profile: Profile | null }) {
  const { journal, updateJournalEntry, deleteJournalEntry, settings } = useApp();
  const [filter, setFilter] = useState<JournalEntryStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "profit">("date");

  const stats = useMemo(() => computeJournalStats(journal), [journal]);

  const filtered = useMemo(() => {
    let arr = [...journal];
    if (filter !== "all") arr = arr.filter((e) => e.status === filter);
    arr.sort((a, b) => {
      if (sortBy === "profit") return b.profit - a.profit;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return arr;
  }, [journal, filter, sortBy]);

  const initials = profile?.email ? profile.email.charAt(0).toUpperCase() : "?";
  const greetName = profile ? firstNameFrom(profile.displayName, profile.email) : null;

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="glass-panel flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-600 text-xl font-bold text-white shadow-[0_4px_14px_-4px_rgba(56,189,248,0.6)]">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              {greetName ? `Witaj, ${greetName}` : "—"}
            </p>
            <p className="text-xs text-white/45">
              {profile?.email}
              {profile && (
                <>
                  {" · konto od "}
                  {new Date(profile.createdAt).toLocaleDateString("pl-PL", { dateStyle: "long" })}
                </>
              )}
            </p>
          </div>
        </div>

        {settings.isPremium && (
          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-sm font-semibold text-emerald-300">
            ✓ Premium
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs text-white/40">Łączny zysk netto</p>
          <p
            className={`mt-2 font-mono text-2xl font-bold tabular-nums ${
              stats.totalProfit >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {stats.totalProfit >= 0 ? "+" : ""}
            {stats.totalProfit.toFixed(2)} zł
          </p>
          <p className="mt-1 text-xs text-white/35">obrót {stats.totalStake.toFixed(0)} zł</p>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs text-white/40">ROI</p>
          <p
            className={`mt-2 font-mono text-2xl font-bold tabular-nums ${
              stats.roi >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {stats.roi >= 0 ? "+" : ""}
            {stats.roi.toFixed(2)}%
          </p>
          <p className="mt-1 text-xs text-white/35">zysk / łączna stawka</p>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs text-white/40">Skuteczność</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-sky-300">
            {stats.winRate !== null ? `${Math.round(stats.winRate)}%` : "—"}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-500"
              style={{ width: `${stats.winRate ?? 0}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-white/35">
            {stats.wonCount} z {stats.closedCount} rozliczonych
          </p>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs text-white/40">Oczekujące</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-amber-300">
            {stats.pendingCount}
          </p>
          <p className="mt-1 text-xs text-white/35">
            {stats.pendingCount > 0 ? "do rozliczenia po meczach" : "wszystko rozliczone"}
          </p>
        </div>
      </div>

      {/* Profit chart */}
      <div className="glass-panel rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Zysk w czasie</h3>
        <ProfitChart data={stats.monthlyProfits} />
      </div>

      {/* Filters and sort */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Historia zakładów</h3>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {(["all", "pending", "won", "lost", "cancelled"] as const).map((f) => {
              const count = f === "all" ? journal.length : journal.filter((e) => e.status === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition ${
                    filter === f
                      ? "border border-sky-300/25 bg-sky-400/15 text-sky-100"
                      : "border border-white/12 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {f !== "all" && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[f].dot}`} />}
                  {f === "all" ? "Wszystkie" : STATUS_META[f].label}
                  <span className="font-mono text-xs text-white/35 tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-0.5 text-xs">
            {[
              { v: "date" as const, l: "Data" },
              { v: "profit" as const, l: "Zysk" },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setSortBy(v)}
                className={`rounded-full px-3 py-1 transition ${
                  sortBy === v ? "bg-white/12 text-white" : "text-white/45 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-xl p-8 text-center sm:p-12">
          <p className="text-base font-semibold text-white">Brak wpisów</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
            Znajdź surebet w zakładce{" "}
            <span className="font-semibold text-sky-300">Arbitraż</span> i zapisz go do dziennika,
            aby śledzić wyniki.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <JournalEntryCard
              key={e.id}
              entry={e}
              onUpdateStatus={(id, status) => updateJournalEntry(id, { status })}
              onDelete={deleteJournalEntry}
              onUpdateNotes={(id, notes) => updateJournalEntry(id, { notes })}
            />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
        <p className="text-xs leading-5 text-amber-100/70">
          <strong className="text-amber-100">Pamiętaj:</strong> po wygranej nie wypłacaj zysku
          natychmiast. Daj bukmacherowi kilka dni przed kolejnym zakładem, aby limit konta nie
          pojawił się zbyt szybko.
        </p>
      </div>
    </div>
  );
}

function BookmakersTab() {
  const { settings, updateSettings, bookmakerBalances } = useApp();

  const toggle = (key: string) => {
    const current = settings.selectedBookmakers;
    const updated = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    updateSettings({ selectedBookmakers: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-white mb-1">Moi Bukmacherzy</h3>
        <p className="text-sm text-white/52 mb-4">
          Zaznacz bukmacherów, w których masz zarejestrowane konto. Wyniki surebetów
          będą filtrowane tylko do tych serwisów.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_BOOKMAKERS.map((bm) => {
            const selected = settings.selectedBookmakers.includes(bm.key);
            const bal = bookmakerBalances.find((b) => b.bookmakerKey === bm.key);
            return (
              <button
                key={bm.key}
                onClick={() => toggle(bm.key)}
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-emerald-500/30 bg-transparent"
                    : "border-white/10 bg-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center transition ${
                      selected ? "bg-emerald-400/20" : "bg-white/8"
                    }`}
                  >
                    <BookmakerIcon bookmakerKey={bm.key} size={22} />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${selected ? "text-white" : "text-white/60"}`}>{bm.name}</p>
                    {bal && <p className="text-xs text-white/35">{bal.balance.toFixed(2)} zł</p>}
                  </div>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition ${
                    selected ? "border-emerald-400 bg-emerald-400" : "border-white/25 bg-transparent"
                  }`}
                >
                  {selected && (
                    <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-white/35">
          Wybrano {settings.selectedBookmakers.length} z {ALL_BOOKMAKERS.length} bukmacherów.
        </p>
      </div>
    </div>
  );
}

function EmailAlertsCard() {
  const { settings, updateSettings } = useApp();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setUserId(data.user?.id ?? null);
      if (data.user?.id) {
        fetchNotifySettings(supabase, data.user.id).then((row) => {
          if (row) updateSettings({ emailAlertsEnabled: row.enabled, emailAlertMinutesBefore: row.minutesBefore });
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = async (partial: { emailAlertsEnabled?: boolean; emailAlertMinutesBefore?: number }) => {
    updateSettings(partial);
    if (!userId || !userEmail) return;
    setStatus("saving");
    try {
      const supabase = createClient();
      await upsertNotifySettings(supabase, userId, userEmail, {
        enabled: partial.emailAlertsEnabled,
        minutesBefore: partial.emailAlertMinutesBefore,
      });
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMsg("Nie udało się zapisać ustawień.");
    }
  };

  return (
    <div className="rounded-xl border border-white/8 bg-transparent p-4 space-y-4">
      <div>
        <p className="font-medium text-white">Alerty e-mail</p>
        <p className="text-sm text-white/50 mt-0.5">
          E-mail z najlepszymi kursami przed startem meczu, na adres konta.
        </p>
      </div>

      <div>
        <label className="text-xs text-white/40 font-semibold uppercase tracking-wider">Adres e-mail</label>
        <div className="mt-1.5 w-full rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70">
          {userEmail ?? "—"}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-white text-sm">Wysyłaj alerty e-mail</p>
          <p className="text-xs text-white/50 mt-0.5">Na adres konta widoczny powyżej</p>
        </div>
        <button
          onClick={() => persist({ emailAlertsEnabled: !settings.emailAlertsEnabled })}
          disabled={!userEmail}
          className="relative h-7 rounded-full transition-colors shrink-0 disabled:opacity-40"
          style={{ width: 52, backgroundColor: settings.emailAlertsEnabled ? "#10b981" : "rgba(255,255,255,0.15)" }}
        >
          <span
            className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
              settings.emailAlertsEnabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-white text-sm">Wyślij ile minut przed meczem</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={settings.emailAlertMinutesBefore}
            onChange={(e) => updateSettings({ emailAlertMinutesBefore: parseInt(e.target.value) })}
            onMouseUp={() => persist({ emailAlertMinutesBefore: settings.emailAlertMinutesBefore })}
            onTouchEnd={() => persist({ emailAlertMinutesBefore: settings.emailAlertMinutesBefore })}
            className="w-full flex-1 accent-sky-500"
          />
          <span className="w-20 text-right font-mono font-bold text-sky-300">
            {settings.emailAlertMinutesBefore} min
          </span>
        </div>
      </div>

      {status === "error" && <p className="text-xs text-rose-400">{errorMsg}</p>}
    </div>
  );
}

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return "przed chwilą";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min temu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} godz. temu`;
  return `${Math.floor(seconds / 86400)} dni temu`;
}

function NotificationItem({ notif, onRead }: { notif: AppNotification; onRead: (id: string) => void }) {
  const typeConfig = {
    surebet: {
      label: "Surebet",
      color: notif.expired ? "border-white/5 bg-white/[0.02]" : "border-emerald-500/20 bg-emerald-500/[0.03]",
      dot: notif.expired ? "bg-white/20" : "bg-emerald-400",
    },
    "pre-surebet": { label: "Pre-Surebet", color: "border-sky-500/20 bg-sky-500/[0.03]", dot: "bg-sky-400" },
    system: { label: "System", color: "border-white/5 bg-white/[0.02]", dot: "bg-white/40" },
  }[notif.type];

  return (
    <div
      className={`relative rounded-xl border p-4 transition sm:p-5 ${typeConfig.color} ${!notif.read ? "shadow-[0_0_15px_rgba(16,185,129,0.03)]" : "opacity-60"}`}
      onClick={() => onRead(notif.id)}
    >
      {!notif.read && <span className={`absolute right-5 top-5 h-2 w-2 rounded-full ${typeConfig.dot}`} />}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold tracking-wider uppercase opacity-40">{typeConfig.label}</span>
            <p className={`font-semibold text-sm ${notif.read ? "text-white/70" : "text-white"}`}>{notif.title}</p>
            {notif.expired && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">Wygasł</span>}
            {notif.profit !== undefined && !notif.expired && (
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                +{notif.profit}%
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 leading-5">{notif.message}</p>
          <p className="mt-2 text-[10px] text-white/30">{timeAgo(notif.timestamp)}</p>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const { settings, updateSettings, notifications, markNotificationRead, markAllNotificationsRead, clearNotifications, unreadCount } = useApp();

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-white">Ustawienia powiadomień</h3>

      <EmailAlertsCard />

      <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-transparent p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-white">Powiadomienia push</p>
          <p className="text-sm text-white/50 mt-0.5">Włącz/wyłącz wszystkie alerty o surebetach</p>
        </div>
        <button
          onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
          className={`relative h-7 w-13 rounded-full transition-colors ${settings.notificationsEnabled ? "bg-emerald-500" : "bg-white/20"}`}
          style={{ width: 52 }}
        >
          <span
            className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
              settings.notificationsEnabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="rounded-xl border border-white/8 bg-transparent p-4 space-y-3">
        <div>
          <p className="font-medium text-white">Minimalny zysk do alertu</p>
          <p className="text-sm text-white/50 mt-0.5">Otrzymuj alert tylko gdy zysk przekroczy tę wartość</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={settings.minProfitForAlert}
            onChange={(e) => updateSettings({ minProfitForAlert: parseFloat(e.target.value) })}
            className="w-full flex-1 accent-emerald-500"
          />
          <span className="w-16 text-right font-mono font-bold text-emerald-300">
            {settings.minProfitForAlert.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-transparent p-4 space-y-3">
        <div>
          <p className="font-medium text-white">Próg pre-surebetu</p>
          <p className="text-sm text-white/50 mt-0.5">
            Obserwuj zdarzenia z marżą do {(100 + settings.preSurebetThreshold).toFixed(1)}% (próg:{" "}
            {settings.preSurebetThreshold.toFixed(1)}% powyżej 100%)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={settings.preSurebetThreshold}
            onChange={(e) => updateSettings({ preSurebetThreshold: parseFloat(e.target.value) })}
            className="w-full flex-1 accent-sky-500"
          />
          <span className="w-16 text-right font-mono font-bold text-sky-300">
            {settings.preSurebetThreshold.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-transparent p-4 space-y-3">
        <div>
          <p className="font-medium text-white">Stawka podatkowa (kursy netto)</p>
          <p className="text-sm text-white/50 mt-0.5">Domyślnie 12% – używane do obliczania zysku netto po podatku</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={settings.taxRate}
            onChange={(e) => updateSettings({ taxRate: parseFloat(e.target.value) })}
            className="w-full flex-1 accent-amber-500"
          />
          <span className="w-16 text-right font-mono font-bold text-amber-300">{settings.taxRate.toFixed(0)}%</span>
        </div>
      </div>

      {/* Feed */}
      <div className="border-t border-white/8 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="font-semibold text-white">
            Skrzynka {unreadCount > 0 && <span className="text-white/40">({unreadCount} nieprzeczytanych)</span>}
          </h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition hover:text-white font-medium"
              >
                Oznacz wszystkie
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="rounded-lg border border-rose-500/10 bg-rose-500/5 px-3 py-1.5 text-xs text-rose-400/80 transition hover:bg-rose-500/15 font-medium"
              >
                Wyczyść
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center">
            <p className="font-semibold text-white mb-1">Brak powiadomień</p>
            <p className="text-xs text-white/50">Alerty o surebetach i progach pojawią się tutaj.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notif={n} onRead={markNotificationRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BalancesTab() {
  const { bookmakerBalances, updateBalance, settings } = useApp();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempVal, setTempVal] = useState("");

  const displayedBalances = bookmakerBalances.filter((b) => settings.selectedBookmakers.includes(b.bookmakerKey));
  const totalBalance = displayedBalances.reduce((s, b) => s + b.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-white">Salda u Bukmacherów</h3>
        <div className="text-left sm:text-right">
          <p className="text-xs text-white/40">Łącznie</p>
          <p className="font-bold font-mono text-emerald-300">{totalBalance.toFixed(2)} zł</p>
        </div>
      </div>
      <p className="text-sm text-white/50">
        Ręcznie aktualizuj stan środków. System ostrzeże Cię gdy stawka w kalkulatorze przekroczy dostępne saldo.
      </p>

      {displayedBalances.length === 0 && (
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white/50 text-sm">Wybierz bukmacherów w zakładce &quot;Bukmacherzy&quot;, aby zarządzać saldami.</p>
        </div>
      )}

      <div className="space-y-3">
        {displayedBalances.map((bm) => (
          <div key={bm.bookmakerKey} className="rounded-xl border border-white/8 bg-transparent p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                <BookmakerIcon bookmakerKey={bm.bookmakerKey} size={24} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{bm.bookmakerName}</p>
                <p className="text-xs text-white/35">
                  Aktualizacja: {new Date(bm.lastUpdated).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
              {editingKey === bm.bookmakerKey ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    value={tempVal}
                    onChange={(e) => setTempVal(e.target.value)}
                    className="w-28 rounded-[14px] border border-white/20 bg-white/10 px-3 py-2 text-sm font-mono text-white focus:outline-none text-right"
                    autoFocus
                  />
                  <span className="text-sm text-white/40">zł</span>
                  <button
                    onClick={() => {
                      updateBalance(bm.bookmakerKey, parseFloat(tempVal) || 0);
                      setEditingKey(null);
                    }}
                    className="rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/30 transition"
                  >
                    ✓
                  </button>
                  <button onClick={() => setEditingKey(null)} className="rounded-xl bg-white/8 px-3 py-2 text-xs text-white/50 hover:text-white transition">
                    ✗
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono font-semibold text-white">{bm.balance.toFixed(2)} zł</span>
                  <button
                    onClick={() => {
                      setEditingKey(bm.bookmakerKey);
                      setTempVal(bm.balance.toString());
                    }}
                    className="rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-white/12 transition"
                  >
                    Edytuj
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SafetyTab() {
  const { settings, updateSettings } = useApp();

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-white">Bezpieczeństwo Konta</h3>
      <p className="text-sm text-white/52">
        Ustawienia pomagające ukryć profesjonalny profil gracza przed algorytmami bukmacherów.
      </p>

      {[
        {
          key: "roundingEnabled",
          label: "Zaokrąglanie stawek",
          desc: "Zaokrąglaj stawki do pełnych kwot, by wyglądać jak gracz rekreacyjny",
          val: settings.roundingEnabled,
          toggle: () => updateSettings({ roundingEnabled: !settings.roundingEnabled }),
        },
        {
          key: "excludeNicheMarkets",
          label: "Wyklucz niszowe rynki",
          desc: "Ukryj surebety na egzotycznych ligach (3. liga mongolska, niszowe ligi)",
          val: settings.excludeNicheMarkets,
          toggle: () => updateSettings({ excludeNicheMarkets: !settings.excludeNicheMarkets }),
        },
        {
          key: "mainMarketsOnly",
          label: "Tylko główne rynki",
          desc: "Pokaż tylko zakłady 1X2 i Over/Under – bez niszowych wyników",
          val: settings.mainMarketsOnly,
          toggle: () => updateSettings({ mainMarketsOnly: !settings.mainMarketsOnly }),
        },
      ].map(({ key, label, desc, val, toggle }) => (
        <div key={key} className="flex flex-col gap-3 rounded-xl border border-white/8 bg-transparent p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-white">{label}</p>
            <p className="text-sm text-white/50 mt-0.5">{desc}</p>
          </div>
          <button
            onClick={toggle}
            className="relative h-7 rounded-full transition-colors shrink-0"
            style={{ width: 52, backgroundColor: val ? "#10b981" : "rgba(255,255,255,0.15)" }}
          >
            <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${val ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      ))}

      {settings.roundingEnabled && (
        <div className="rounded-xl border border-white/8 bg-transparent p-4 space-y-3">
          <p className="font-medium text-white text-sm">Krok zaokrąglenia stawki</p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={settings.roundingStep}
              onChange={(e) => updateSettings({ roundingStep: parseInt(e.target.value) })}
              className="w-full flex-1 accent-amber-500"
            />
            <span className="w-20 text-right font-mono font-bold text-amber-300">{settings.roundingStep} zł</span>
          </div>
          <p className="text-xs text-white/35">
            Stawki będą zaokrąglone do najbliższej wielokrotności {settings.roundingStep} zł
          </p>
        </div>
      )}
    </div>
  );
}

function SubscriptionTab() {
  const { settings, updateSettings } = useApp();

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-white">Subskrypcja i Premium</h3>

      <div className="rounded-xl border border-white/8 bg-transparent p-4">
        <p className="font-medium text-white text-sm">Saldo wirtualne</p>
        <p className="mt-2 text-xs text-white/50">
          Aktualne saldo: <span className="font-mono font-bold text-emerald-300">{settings.virtualBalance.toLocaleString("pl-PL")} zł</span>
        </p>
        <button
          onClick={() => updateSettings({ virtualBalance: 10000 })}
          className="mt-3 rounded-xl bg-white/[0.06] px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/[0.1] transition"
        >
          Resetuj saldo do 10 000 zł
        </button>
      </div>

      {!settings.isPremium ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/8 bg-transparent p-6">
            <div className="text-center space-y-2 mb-6">
              <h4 className="text-xl font-bold text-white">BukScan Premium</h4>
              <p className="text-white/60 text-sm max-w-md mx-auto">
                Dostęp do surebetów bez opóźnień, alertów push w czasie rzeczywistym i zaawansowanych modułów.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 mb-6 max-w-xl mx-auto">
              {[
                "Alerty o surebetach w < 10 sekund",
                "Kursy live bez opóźnień",
                "Powiadomienia push",
                "Aplikacja mobilna",
                "Brak reklam",
                "Priorytetowe wsparcie",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <span className="text-emerald-400 font-semibold">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { period: "Miesięczny", price: "49 zł/mies.", badge: null },
                { period: "Kwartalny", price: "129 zł/kw.", badge: "Oszczędź 12%" },
                { period: "Roczny", price: "399 zł/rok", badge: "Oszczędź 32%" },
              ].map((plan) => (
                <button
                  key={plan.period}
                  onClick={() => updateSettings({ isPremium: true })}
                  className="relative rounded-xl border border-white/10 bg-transparent p-4 text-center hover:bg-white/5 transition"
                >
                  {plan.badge && (
                    <span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {plan.badge}
                    </span>
                  )}
                  <p className="font-semibold text-white text-sm">{plan.period}</p>
                  <p className="text-sky-300 font-mono mt-1 text-sm">{plan.price}</p>
                  <p className="text-xs text-white/40 mt-2">Aktywuj teraz</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-transparent p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">✓</div>
              <div>
                <h4 className="text-lg font-bold text-emerald-300">Jesteś Premium!</h4>
                <p className="text-xs text-white/60">Wszystkie funkcje odblokowane</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/8 bg-transparent p-4">
              <p className="text-sm text-white/50">
                Ważność do: <span className="font-semibold text-white">31 marca 2027</span>
              </p>
              <p className="text-sm text-white/50 mt-1">
                Plan: <span className="font-semibold text-white">Roczny</span>
              </p>
            </div>
            <button
              onClick={() => updateSettings({ isPremium: false })}
              className="mt-4 text-xs text-rose-400/60 hover:text-rose-400 transition"
            >
              Anuluj automatyczne odnawianie
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTab>("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const { unreadCount } = useApp();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        const displayName = (data.user.user_metadata?.full_name || data.user.user_metadata?.name) ?? null;
        setProfile({ email: data.user.email, displayName, createdAt: data.user.created_at });
      }
    });
  }, []);

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Konto</h1>
        <p className="mt-1.5 text-sm text-white/55">
          Profil, statystyki, bukmacherzy, powiadomienia i ustawienia — w jednym miejscu.
        </p>
      </div>

      <div className="flex gap-6 border-b border-white/10 pb-px overflow-x-auto">
        {TABS_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 pb-3 text-sm font-medium transition-all relative ${
              activeTab === tab.id ? "text-sky-400 font-semibold" : "text-white/60 hover:text-white"
            }`}
          >
            {tab.label}
            {tab.id === "notifications" && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
            {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full" />}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab profile={profile} />}
      {activeTab === "bookmakers" && <BookmakersTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "balances" && <BalancesTab />}
      {activeTab === "safety" && <SafetyTab />}
      {activeTab === "subscription" && <SubscriptionTab />}
    </div>
  );
}
