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
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                  selected
                    ? 'border-emerald-500/30 bg-transparent'
                    : 'border-white/10 bg-transparent hover:bg-white/5'
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
      <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-transparent p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-white">Powiadomienia push</p>
          <p className="text-sm text-white/50 mt-0.5">Włącz/wyłącz wszystkie alerty o surebetach</p>
        </div>
        <button
          onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
          className={`relative h-7 w-13 rounded-full transition-colors ${settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-white/20'}`}
          style={{ width: 52 }}
        >
          <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Min profit alert */}
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
            onChange={e => updateSettings({ minProfitForAlert: parseFloat(e.target.value) })}
            className="w-full flex-1 accent-emerald-500"
            style={{ '--slider-color': '#10b981', '--slider-color-alpha': 'rgba(16, 185, 129, 0.2)' } as React.CSSProperties}
          />
          <span className="w-16 text-right font-mono font-bold text-emerald-300">
            {settings.minProfitForAlert.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Pre-surebet threshold */}
      <div className="rounded-xl border border-white/8 bg-transparent p-4 space-y-3">
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
            className="w-full flex-1 accent-sky-500"
            style={{ '--slider-color': '#0ea5e9', '--slider-color-alpha': 'rgba(14, 165, 233, 0.2)' } as React.CSSProperties}
          />
          <span className="w-16 text-right font-mono font-bold text-sky-300">
            {settings.preSurebetThreshold.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Tax rate */}
      <div className="rounded-xl border border-white/8 bg-transparent p-4 space-y-3">
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
            className="w-full flex-1 accent-amber-500"
            style={{ '--slider-color': '#f59e0b', '--slider-color-alpha': 'rgba(245, 158, 11, 0.2)' } as React.CSSProperties}
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
          <div key={bm.bookmakerKey} className="rounded-xl border border-white/8 bg-transparent p-4">
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
        <div key={key} className="flex flex-col gap-3 rounded-xl border border-white/8 bg-transparent p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-white">{label}</p>
            <p className="text-sm text-white/50 mt-0.5">{desc}</p>
          </div>
          <button
            onClick={toggle}
            className={`relative h-7 rounded-full transition-colors shrink-0`}
            style={{ width: 52, backgroundColor: val ? '#10b981' : 'rgba(255,255,255,0.15)' }}
          >
            <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${val ? 'translate-x-6' : 'translate-x-0'}`} />
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
              onChange={e => updateSettings({ roundingStep: parseInt(e.target.value) })}
              className="w-full flex-1 accent-amber-500"
              style={{ '--slider-color': '#f59e0b', '--slider-color-alpha': 'rgba(245, 158, 11, 0.2)' } as React.CSSProperties}
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
          <div className="rounded-xl border border-white/8 bg-transparent p-6">
            <div className="text-center space-y-2 mb-6">
              <h4 className="text-xl font-bold text-white">BukScan Premium</h4>
              <p className="text-white/60 text-sm max-w-md mx-auto">
                Dostęp do surebetów bez opóźnień, alertów push w czasie rzeczywistym i zaawansowanych modułów.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 mb-6 max-w-xl mx-auto">
              {[
                'Alerty o surebetach w < 10 sekund',
                'Kursy live bez opóźnień',
                'Powiadomienia push',
                'Aplikacja mobilna',
                'Brak reklam',
                'Priorytetowe wsparcie',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <span className="text-emerald-400 font-semibold">✓</span>
                  <span>{f}</span>
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
            <p className="text-center text-xs text-white/30 mt-4">
              * To środowisko demo. Kliknięcie aktywuje tryb Premium symulacji.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-transparent p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-300">Jesteś Premium!</h4>
                <p className="text-xs text-white/60">Wszystkie funkcje odblokowane</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/8 bg-transparent p-4">
              <p className="text-sm text-white/50">Ważność do: <span className="font-semibold text-white">31 marca 2027</span></p>
              <p className="text-sm text-white/50 mt-1">Plan: <span className="font-semibold text-white">Roczny</span></p>
            </div>
            <button
              onClick={() => updateSettings({ isPremium: false })}
              className="mt-4 text-xs text-rose-400/60 hover:text-rose-400 transition"
            >
              Anuluj automatyczne odnawianie
            </button>
          </div>

          {/* Virtual balance reset */}
          <div className="rounded-xl border border-white/8 bg-transparent p-4">
            <p className="font-medium text-white mb-1 text-sm">Wirtualne saldo (demo)</p>
            <p className="text-xs text-white/50 mb-3">
              Aktualne saldo: <span className="font-mono font-bold text-emerald-300">{settings.virtualBalance.toLocaleString('pl-PL')} zł</span>
            </p>
            <button
              onClick={() => updateSettings({ virtualBalance: 10000 })}
              className="rounded-xl bg-white/[0.06] px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/[0.1] transition"
            >
              Resetuj saldo do 10 000 zł
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS_CONFIG: { id: SettingsTab; label: string }[] = [
  { id: 'bookmakers', label: 'Moi Bukmacherzy' },
  { id: 'notifications', label: 'Powiadomienia' },
  { id: 'balances', label: 'Salda' },
  { id: 'safety', label: 'Bezpieczeństwo' },
  { id: 'subscription', label: 'Subskrypcja' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('bookmakers');

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Ustawienia</h1>
        <p className="mt-1 text-white/52">Spersonalizuj swoje doświadczenie z BukScan.</p>
      </div>

      <div className="flex gap-6 border-b border-white/10 pb-px overflow-x-auto">
        {TABS_CONFIG.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 pb-3 text-sm font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-sky-400 font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-4 sm:p-6">
        {activeTab === 'bookmakers' && <BookmakerFilterTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'balances' && <BalancesTab />}
        {activeTab === 'safety' && <SafetyTab />}
        {activeTab === 'subscription' && <SubscriptionTab />}
      </div>
    </div>
  );
}
