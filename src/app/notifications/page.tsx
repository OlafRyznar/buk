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
    'surebet': { icon: '🎯', color: notif.expired ? 'border-white/10 bg-white/4' : 'border-emerald-300/20 bg-emerald-300/6', dot: notif.expired ? 'bg-white/25' : 'bg-emerald-400' },
    'pre-surebet': { icon: '📊', color: 'border-sky-300/20 bg-sky-300/6', dot: 'bg-sky-400' },
    'system': { icon: '🔔', color: 'border-white/10 bg-white/5', dot: 'bg-white/40' },
  }[notif.type];

  return (
    <div
      className={`relative rounded-[24px] border p-4 transition sm:p-5 ${typeConfig.color} ${!notif.read ? 'shadow-[0_0_20px_rgba(110,231,183,0.05)]' : 'opacity-70'}`}
      onClick={() => onRead(notif.id)}
    >
      {!notif.read && (
        <span className={`absolute right-5 top-5 h-2.5 w-2.5 rounded-full ${typeConfig.dot} shadow-[0_0_10px_currentColor]`} />
      )}
      <div className="flex items-start gap-4">
        <div className="text-2xl shrink-0 mt-0.5">{typeConfig.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className={`font-semibold text-sm ${notif.read ? 'text-white/70' : 'text-white'}`}>{notif.title}</p>
            {notif.expired && (
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/40">Wygasł</span>
            )}
            {notif.profit !== undefined && !notif.expired && (
              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-300">
                +{notif.profit}%
              </span>
            )}
          </div>
          <p className="text-sm text-white/55">{notif.message}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-xs text-white/35">{timeAgo(notif.timestamp)}</p>
            {notif.surebetId && !notif.expired && (
              <Link
                href="/arbitrage"
                className="text-xs text-sky-400 hover:text-sky-300 transition"
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
      title: '🎯 Nowy surebet! Liverpool vs Man City',
      message: 'Surebet 2-drogowy z gwarantowanym zyskiem +1.8%. Działaj szybko!',
      profit: 1.8,
      read: false,
      expired: false,
      surebetId: 'demo-live-001',
      eventName: 'Liverpool vs Man City',
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Powiadomienia</h1>
          <p className="mt-1 text-white/52">
            {unreadCount > 0 ? `${unreadCount} nieprzeczytanych alertów` : 'Wszystkie przeczytane'}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <button
            onClick={simulateNewAlert}
            className="w-full rounded-2xl border border-emerald-300/20 bg-emerald-300/8 px-4 py-2 text-xs text-emerald-200 transition hover:bg-emerald-300/14 sm:w-auto"
          >
            + Symuluj alert
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-2 text-xs text-white/60 transition hover:text-white sm:w-auto"
            >
              Oznacz wszystkie
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="w-full rounded-2xl border border-rose-300/15 bg-rose-300/6 px-4 py-2 text-xs text-rose-300/70 transition hover:text-rose-300 sm:w-auto"
            >
              Wyczyść
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Surebety', count: surebetNotifs.filter(n => !n.expired).length, color: 'text-emerald-300', bg: 'bg-emerald-300/8 border-emerald-300/20' },
          { label: 'Graniczne', count: preSurebetNotifs.length, color: 'text-sky-300', bg: 'bg-sky-300/8 border-sky-300/20' },
          { label: 'Nieprzeczytane', count: unreadCount, color: 'text-amber-200', bg: 'bg-amber-300/8 border-amber-300/20' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`rounded-[22px] border ${bg} p-4 text-center`}>
            <p className={`text-2xl font-bold font-mono ${color}`}>{count}</p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Premium promo */}
      <div className="glass-panel rounded-[24px] border border-amber-300/15 bg-amber-300/5 p-4">
        <div className="flex flex-wrap items-start gap-3">
          <span className="text-2xl">⚡</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-amber-100 text-sm">Alerty w czasie rzeczywistym – tylko Premium</p>
            <p className="text-xs text-amber-100/60 mt-0.5">
              W wersji demo powiadomienia są opóźnione o ~15 minut.
              Premium daje alert w ciągu 10 sekund od pojawienia się surebetu.
            </p>
          </div>
          <Link
            href="/settings"
            className="w-full rounded-2xl bg-amber-400/20 px-4 py-2 text-center text-xs font-medium text-amber-200 transition hover:bg-amber-400/30 sm:ml-auto sm:w-auto"
          >
            Odblokuj
          </Link>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-panel rounded-[28px] p-10 text-center sm:p-14">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-semibold text-white mb-1">Brak powiadomień</p>
          <p className="text-sm text-white/50">Kliknij &quot;Symuluj alert&quot; aby zobaczyć powiadomienie demo.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {surebetNotifs.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-white/70 mb-3 flex items-center gap-2">
                🎯 Surebety
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-xs text-emerald-300">{surebetNotifs.length}</span>
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
              <h2 className="text-base font-semibold text-white/70 mb-3 flex items-center gap-2">
                📊 Pre-surebety
                <span className="rounded-full bg-sky-400/15 px-2.5 py-0.5 text-xs text-sky-300">{preSurebetNotifs.length}</span>
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
              <h2 className="text-base font-semibold text-white/70 mb-3 flex items-center gap-2">
                🔔 Systemowe
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
