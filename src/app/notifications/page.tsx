"use client";

import { useApp } from "@/components/AppProvider";
import { AppNotification } from "@/lib/store-types";
import Link from "next/link";

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return 'przed chwilą';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min temu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} godz. temu`;
  return `${Math.floor(seconds / 86400)} dni temu`;
}

function NotificationItem({ notif, onRead }: { notif: AppNotification; onRead: (id: string) => void }) {
  const typeConfig = {
    'surebet': { label: 'Surebet', color: notif.expired ? 'border-white/5 bg-white/[0.02]' : 'border-emerald-500/20 bg-emerald-500/[0.03]', dot: notif.expired ? 'bg-white/20' : 'bg-emerald-400' },
    'pre-surebet': { label: 'Pre-Surebet', color: 'border-sky-500/20 bg-sky-500/[0.03]', dot: 'bg-sky-400' },
    'system': { label: 'System', color: 'border-white/5 bg-white/[0.02]', dot: 'bg-white/40' },
  }[notif.type];

  return (
    <div
      className={`relative rounded-xl border p-4 transition sm:p-5 ${typeConfig.color} ${!notif.read ? 'shadow-[0_0_15px_rgba(16,185,129,0.03)]' : 'opacity-60'}`}
      onClick={() => onRead(notif.id)}
    >
      {!notif.read && (
        <span className={`absolute right-5 top-5 h-2 w-2 rounded-full ${typeConfig.dot}`} />
      )}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold tracking-wider uppercase opacity-40">{typeConfig.label}</span>
            <p className={`font-semibold text-sm ${notif.read ? 'text-white/70' : 'text-white'}`}>{notif.title}</p>
            {notif.expired && (
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">Wygasł</span>
            )}
            {notif.profit !== undefined && !notif.expired && (
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                +{notif.profit}%
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 leading-5">{notif.message}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-[10px] text-white/30">{timeAgo(notif.timestamp)}</p>
            {notif.surebetId && !notif.expired && (
              <Link
                href="/arbitrage"
                className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold transition"
                onClick={e => e.stopPropagation()}
              >
                → Otwórz kalkulator
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications, unreadCount, addNotification } = useApp();

  const surebetNotifs = notifications.filter(n => n.type === 'surebet');
  const preSurebetNotifs = notifications.filter(n => n.type === 'pre-surebet');
  const systemNotifs = notifications.filter(n => n.type === 'system');

  const simulateNewAlert = () => {
    addNotification({
      type: 'surebet',
      title: 'Nowy surebet: Liverpool vs Man City',
      message: 'Surebet 2-drogowy z gwarantowanym zyskiem +1.8%. Działaj szybko!',
      profit: 1.8,
      read: false,
      expired: false,
      surebetId: 'demo-live-001',
      eventName: 'Liverpool vs Man City',
    });
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Powiadomienia</h1>
          <p className="mt-1 text-xs text-white/40">
            {unreadCount > 0 ? `${unreadCount} nieprzeczytanych alertów` : 'Wszystkie przeczytane'}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <button
            onClick={simulateNewAlert}
            className="w-full rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-400 font-semibold transition hover:bg-emerald-500/15 sm:w-auto"
          >
            + Symuluj alert
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition hover:text-white sm:w-auto font-medium"
            >
              Oznacz wszystkie
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="w-full rounded-lg border border-rose-500/10 bg-rose-500/5 px-3 py-1.5 text-xs text-rose-400/80 transition hover:bg-rose-500/15 sm:w-auto font-medium"
            >
              Wyczyść
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Surebety', count: surebetNotifs.filter(n => !n.expired).length, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/10' },
          { label: 'Graniczne', count: preSurebetNotifs.length, color: 'text-sky-400', bg: 'bg-sky-500/5 border-sky-500/10' },
          { label: 'Nieprzeczytane', count: unreadCount, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/10' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`rounded-xl border ${bg} p-4 text-center`}>
            <p className={`text-xl font-bold font-mono ${color}`}>{count}</p>
            <p className="text-[10px] text-white/40 mt-1 uppercase font-semibold tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Premium promo */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-amber-200 text-sm">Alerty w czasie rzeczywistym – tylko Premium</p>
            <p className="text-xs text-white/50 mt-0.5">
              W wersji demo powiadomienia są opóźnione o ~15 minut.
              Premium daje alert w ciągu 10 sekund od pojawienia się surebetu.
            </p>
          </div>
          <Link
            href="/settings"
            className="w-full rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-center text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20 sm:ml-auto sm:w-auto"
          >
            Odblokuj
          </Link>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-panel rounded-xl p-10 text-center sm:p-14">
          <p className="font-semibold text-white mb-1">Brak powiadomień</p>
          <p className="text-xs text-white/50">Kliknij &quot;Symuluj alert&quot; aby zobaczyć powiadomienie demo.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {surebetNotifs.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-white/50 mb-3 flex items-center gap-2 uppercase tracking-wider">
                Surebety
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">{surebetNotifs.length}</span>
              </h2>
              <div className="space-y-3">
                {surebetNotifs.map(n => (
                  <NotificationItem key={n.id} notif={n} onRead={markNotificationRead} />
                ))}
              </div>
            </section>
          )}

          {preSurebetNotifs.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-white/50 mb-3 flex items-center gap-2 uppercase tracking-wider">
                Pre-surebety
                <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] text-sky-400">{preSurebetNotifs.length}</span>
              </h2>
              <div className="space-y-3">
                {preSurebetNotifs.map(n => (
                  <NotificationItem key={n.id} notif={n} onRead={markNotificationRead} />
                ))}
              </div>
            </section>
          )}

          {systemNotifs.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-white/50 mb-3 flex items-center gap-2 uppercase tracking-wider">
                Systemowe
              </h2>
              <div className="space-y-3">
                {systemNotifs.map(n => (
                  <NotificationItem key={n.id} notif={n} onRead={markNotificationRead} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
