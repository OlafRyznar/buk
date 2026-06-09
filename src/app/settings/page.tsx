"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { ALL_BOOKMAKERS } from "@/lib/store-types";

type SettingsTab = 'bookmakers' | 'notifications' | 'balances' | 'safety' | 'subscription';

function BookmakerFilterTab() {
  const { settings, updateSettings, bookmakerBalances } = useApp();

  const toggle = (key: string) => {
    const current = settings.selectedBookmakers;
    const updated = current.includes(key)
      ? current.filter(k => k !== key)
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
          {ALL_BOOKMAKERS.map(bm => {
            const selected = settings.selectedBookmakers.includes(bm.key);
            const bal = bookmakerBalances.find(b => b.bookmakerKey === bm.key);
            return (
              <button
                key={bm.key}
                onClick={() => toggle(bm.key)}
                className={`flex items-center justify-between rounded-[22px] border p-4 text-left transition ${
                  selected
                    ? 'border-emerald-300/25 bg-emerald-300/8 shadow-[0_0_20px_rgba(110,231,183,0.06)]'
                    : 'border-white/10 bg-white/5 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold transition ${
                    selected ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/8 text-white/40'
                  }`}>
                    {bm.name.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${selected ? 'text-white' : 'text-white/60'}`}>{bm.name}</p>
                    {bal && <p className="text-xs text-white/35">{bal.balance.toFixed(2)} zł</p>}
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition ${
                  selected ? 'border-emerald-400 bg-emerald-400' : 'border-white/25 bg-transparent'
                }`}>
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

function NotificationsTab() {
  const { settings, updateSettings } = useApp();

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-white">Ustawienia Powiadomień</h3>

      {/* Master toggle */}
      <div className="flex flex-col gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-white">Powiadomienia push</p>
          <p className="text-sm text-white/50 mt-0.5">Włącz/wyłącz wszystkie alerty o surebetach</p>
        </div>
        <button
          onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
          className={`relative h-7 w-13 rounded-full transition-colors ${settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-white/20'}`}
          style={{ width: 52 }}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Min profit alert */}
      <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 space-y-3">
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
            onChange={e => updateSettings({ minProfitForAlert: parseFloat(e.target.value) })}
            className="flex-1 accent-emerald-500"
          />
          <span className="w-16 text-right font-mono font-bold text-emerald-300">
            {settings.minProfitForAlert.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Pre-surebet threshold */}
      <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 space-y-3">
        <div>
          <p className="font-medium text-white">Próg pre-surebetu</p>
          <p className="text-sm text-white/50 mt-0.5">
            Obserwuj zdarzenia z marżą do {(100 + settings.preSurebetThreshold).toFixed(1)}% (próg: {settings.preSurebetThreshold.toFixed(1)}% powyżej 100%)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={settings.preSurebetThreshold}
            onChange={e => updateSettings({ preSurebetThreshold: parseFloat(e.target.value) })}
            className="flex-1 accent-sky-500"
          />
          <span className="w-16 text-right font-mono font-bold text-sky-300">
            {settings.preSurebetThreshold.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Tax rate */}
      <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 space-y-3">
        <div>
          <p className="font-medium text-white">Stawka podatkowa (kursy netto)</p>
          <p className="text-sm text-white/50 mt-0.5">
            Domyślnie 12% – używane do obliczania zysku netto po podatku
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={settings.taxRate}
            onChange={e => updateSettings({ taxRate: parseFloat(e.target.value) })}
            className="flex-1 accent-amber-500"
          />
          <span className="w-16 text-right font-mono font-bold text-amber-300">
            {settings.taxRate.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function BalancesTab() {
  const { bookmakerBalances, updateBalance, settings } = useApp();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempVal, setTempVal] = useState('');

  const displayedBalances = bookmakerBalances.filter(b =>
    settings.selectedBookmakers.includes(b.bookmakerKey)
  );

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
          <p className="text-white/50 text-sm">Wybierz bukmacherów w zakładce &quot;Moi Bukmacherzy&quot;, aby zarządzać saldami.</p>
        </div>
      )}

      <div className="space-y-3">
        {displayedBalances.map(bm => (
          <div key={bm.bookmakerKey} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/8 flex items-center justify-center text-sm font-bold text-white/60 shrink-0">
              {bm.bookmakerName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">{bm.bookmakerName}</p>
              <p className="text-xs text-white/35">
                Aktualizacja: {new Date(bm.lastUpdated).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
            {editingKey === bm.bookmakerKey ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  value={tempVal}
                  onChange={e => setTempVal(e.target.value)}
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
                <button onClick={() => setEditingKey(null)} className="rounded-xl bg-white/8 px-3 py-2 text-xs text-white/50 hover:text-white transition">✗</button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono font-semibold text-white">{bm.balance.toFixed(2)} zł</span>
                <button
                  onClick={() => { setEditingKey(bm.bookmakerKey); setTempVal(bm.balance.toString()); }}
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
          key: 'roundingEnabled',
          label: 'Zaokrąglanie stawek',
          desc: 'Zaokrąglaj stawki do pełnych kwot, by wyglądać jak gracz rekreacyjny',
          val: settings.roundingEnabled,
          toggle: () => updateSettings({ roundingEnabled: !settings.roundingEnabled }),
        },
        {
          key: 'excludeNicheMarkets',
          label: 'Wyklucz niszowe rynki',
          desc: 'Ukryj surebety na egzotycznych ligach (3. liga mongolska, niszowe ligi)',
          val: settings.excludeNicheMarkets,
          toggle: () => updateSettings({ excludeNicheMarkets: !settings.excludeNicheMarkets }),
        },
        {
          key: 'mainMarketsOnly',
          label: 'Tylko główne rynki',
          desc: 'Pokaż tylko zakłady 1X2 i Over/Under – bez niszowych wyników',
          val: settings.mainMarketsOnly,
          toggle: () => updateSettings({ mainMarketsOnly: !settings.mainMarketsOnly }),
        },
      ].map(({ key, label, desc, val, toggle }) => (
        <div key={key} className="flex flex-col gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-white">{label}</p>
            <p className="text-sm text-white/50 mt-0.5">{desc}</p>
          </div>
          <button
            onClick={toggle}
            className={`relative h-7 rounded-full transition-colors shrink-0`}
            style={{ width: 52, backgroundColor: val ? '#10b981' : 'rgba(255,255,255,0.15)' }}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${val ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      ))}

      {settings.roundingEnabled && (
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 space-y-3">
          <p className="font-medium text-white text-sm">Krok zaokrąglenia stawki</p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={settings.roundingStep}
              onChange={e => updateSettings({ roundingStep: parseInt(e.target.value) })}
              className="flex-1 accent-amber-500"
            />
            <span className="w-20 text-right font-mono font-bold text-amber-300">
              {settings.roundingStep} zł
            </span>
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

      {!settings.isPremium ? (
        <div className="space-y-4">
          <div className="glass-panel rounded-[28px] border border-amber-300/20 bg-amber-300/5 p-6">
            <div className="text-center space-y-3 mb-6">
              <p className="text-4xl">🚀</p>
              <h4 className="text-xl font-bold text-white">Odblokuj BukScan Premium</h4>
              <p className="text-white/60">
                Dostęp do surebetów bez opóźnień, alertów push w czasie rzeczywistym i więcej.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              {[
                '⚡ Alerty o surebetach w &lt;10 sekund',
                '📊 Kursy live bez opóźnień',
                '🔔 Powiadomienia push',
                '📱 Aplikacja mobilna',
                '🚫 Brak reklam',
                '💬 Priorytetowe wsparcie',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <span className="w-5 shrink-0 text-center" dangerouslySetInnerHTML={{ __html: f.split(' ')[0] }} />
                  <span dangerouslySetInnerHTML={{ __html: f.substring(f.indexOf(' ') + 1) }} />
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { period: 'Miesięczny', price: '49 zł/mies.', badge: null },
                { period: 'Kwartalny', price: '129 zł/kw.', badge: 'Oszczędź 12%' },
                { period: 'Roczny', price: '399 zł/rok', badge: 'Oszczędź 32%' },
              ].map(plan => (
                <button
                  key={plan.period}
                  onClick={() => updateSettings({ isPremium: true })}
                  className="relative rounded-[22px] border border-sky-300/25 bg-sky-300/8 p-4 text-center hover:bg-sky-300/14 transition"
                >
                  {plan.badge && (
                    <span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                      {plan.badge}
                    </span>
                  )}
                  <p className="font-semibold text-white">{plan.period}</p>
                  <p className="text-sky-200 font-mono mt-1">{plan.price}</p>
                  <p className="text-xs text-white/40 mt-2">Aktywuj teraz</p>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-white/30 mt-4">
              * To środowisko demo. Kliknięcie aktywuje tryb Premium symulacji.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-panel rounded-[28px] border border-emerald-300/20 bg-emerald-300/6 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-400/20 flex items-center justify-center text-2xl">
                ✨
              </div>
              <div>
                <h4 className="text-xl font-bold text-emerald-200">Jesteś Premium!</h4>
                <p className="text-sm text-white/60">Wszystkie funkcje odblokowane</p>
              </div>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/50">Ważność do: <span className="font-semibold text-white">31 marca 2027</span></p>
              <p className="text-sm text-white/50 mt-1">Plan: <span className="font-semibold text-white">Roczny</span></p>
            </div>
            <button
              onClick={() => updateSettings({ isPremium: false })}
              className="mt-4 text-sm text-rose-400/60 hover:text-rose-400 transition"
            >
              Anuluj automatyczne odnawianie
            </button>
          </div>

          {/* Virtual balance reset */}
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <p className="font-medium text-white mb-1">Wirtualne saldo (demo)</p>
            <p className="text-sm text-white/50 mb-3">
              Aktualne saldo: <span className="font-mono font-bold text-emerald-300">{settings.virtualBalance.toLocaleString('pl-PL')} zł</span>
            </p>
            <button
              onClick={() => updateSettings({ virtualBalance: 10000 })}
              className="rounded-2xl bg-white/8 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/12 transition"
            >
              Resetuj saldo do 10 000 zł
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS_CONFIG: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'bookmakers', label: 'Moi Bukmacherzy', icon: '🏦' },
  { id: 'notifications', label: 'Powiadomienia', icon: '🔔' },
  { id: 'balances', label: 'Salda', icon: '💰' },
  { id: 'safety', label: 'Bezpieczeństwo', icon: '🛡️' },
  { id: 'subscription', label: 'Subskrypcja', icon: '⭐' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('bookmakers');

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Ustawienia</h1>
        <p className="mt-1 text-white/52">Spersonalizuj swoje doświadczenie z BukScan.</p>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {TABS_CONFIG.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-sky-400/20 text-sky-100 border border-sky-300/25'
                : 'border border-white/12 bg-white/6 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-[28px] p-4 sm:p-6">
        {activeTab === 'bookmakers' && <BookmakerFilterTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'balances' && <BalancesTab />}
        {activeTab === 'safety' && <SafetyTab />}
        {activeTab === 'subscription' && <SubscriptionTab />}
      </div>
    </div>
  );
}
