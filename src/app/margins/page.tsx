"use client";

import { useState } from "react";

// Demo margin data per bookmaker per sport
const DEMO_MARGINS = [
  {
    key: 'pinnacle',
    name: 'Pinnacle',
    avgMargin: 2.1,
    soccer: 2.0,
    basketball: 2.2,
    tennis: 2.3,
    hockey: 2.4,
    isLicensedPL: false,
    promotions: 0,
    note: 'Najniższe marże – bukmacher referencyjny dla arbitrażu.',
  },
  {
    key: 'superbet',
    name: 'Superbet',
    avgMargin: 4.8,
    soccer: 4.5,
    basketball: 5.0,
    tennis: 5.2,
    hockey: 5.8,
    isLicensedPL: true,
    promotions: 3,
    note: 'Polski bukmacher, licencjonowany przez MF.',
  },
  {
    key: 'sts',
    name: 'STS',
    avgMargin: 5.2,
    soccer: 4.9,
    basketball: 5.4,
    tennis: 5.6,
    hockey: 6.0,
    isLicensedPL: true,
    promotions: 5,
    note: 'Największy polski bukmacher. Bogata oferta promocji.',
  },
  {
    key: 'fortuna',
    name: 'Fortuna',
    avgMargin: 5.4,
    soccer: 5.1,
    basketball: 5.6,
    tennis: 5.8,
    hockey: 6.2,
    isLicensedPL: true,
    promotions: 4,
    note: 'Licencjonowany w Polsce od 2011.',
  },
  {
    key: 'bet365',
    name: 'Bet365',
    avgMargin: 5.5,
    soccer: 5.2,
    basketball: 5.8,
    tennis: 5.5,
    hockey: 6.0,
    isLicensedPL: false,
    promotions: 2,
    note: 'Szeroka oferta i wiele rynków specjalnych.',
  },
  {
    key: 'unibet',
    name: 'Unibet',
    avgMargin: 6.0,
    soccer: 5.8,
    basketball: 6.2,
    tennis: 6.0,
    hockey: 6.4,
    isLicensedPL: false,
    promotions: 2,
    note: 'Skandynawska marka z dobrą ofertą piłkarską.',
  },
  {
    key: 'betway',
    name: 'Betway',
    avgMargin: 6.2,
    soccer: 6.0,
    basketball: 6.4,
    tennis: 6.3,
    hockey: 6.8,
    isLicensedPL: false,
    promotions: 1,
    note: 'Popularna platforma z dobrą obsługą.',
  },
  {
    key: 'betclic',
    name: 'Betclic',
    avgMargin: 5.8,
    soccer: 5.5,
    basketball: 6.0,
    tennis: 5.9,
    hockey: 6.5,
    isLicensedPL: true,
    promotions: 3,
    note: 'Licencjonowany w Polsce, znany z cashbacków.',
  },
  {
    key: 'williamhill',
    name: 'William Hill',
    avgMargin: 6.8,
    soccer: 6.5,
    basketball: 7.0,
    tennis: 7.0,
    hockey: 7.5,
    isLicensedPL: false,
    promotions: 1,
    note: 'Tradycyjny brytyjski bukmacher.',
  },
  {
    key: 'marathonbet',
    name: 'Marathon Bet',
    avgMargin: 3.2,
    soccer: 3.0,
    basketball: 3.4,
    tennis: 3.5,
    hockey: 3.8,
    isLicensedPL: false,
    promotions: 0,
    note: 'Niska marża – dobry partner do arbitrażu.',
  },
  {
    key: 'bwin',
    name: 'bwin',
    avgMargin: 6.5,
    soccer: 6.2,
    basketball: 6.8,
    tennis: 6.7,
    hockey: 7.0,
    isLicensedPL: false,
    promotions: 3,
    note: 'Popularna platforma europejska.',
  },
  {
    key: 'lvbet',
    name: 'LvBet',
    avgMargin: 5.6,
    soccer: 5.3,
    basketball: 5.8,
    tennis: 5.7,
    hockey: 6.0,
    isLicensedPL: true,
    promotions: 2,
    note: 'Licencja polska, ciekawe kursy na piłkę nożną.',
  },
];

type SortField = 'avgMargin' | 'soccer' | 'basketball' | 'tennis' | 'hockey';

function MarginBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value < 3 ? 'bg-emerald-400' : value < 5 ? 'bg-sky-400' : value < 6.5 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-20 rounded-full bg-white/10 sm:w-24">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-mono font-medium ${value < 3 ? 'text-emerald-300' : value < 5 ? 'text-sky-300' : value < 6.5 ? 'text-amber-200' : 'text-rose-300'}`}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

export default function MarginsPage() {
  const [sortBy, setSortBy] = useState<SortField>('avgMargin');
  const [filterPL, setFilterPL] = useState(false);
  const [marketFilter, setMarketFilter] = useState<'all' | 'soccer' | 'basketball' | 'tennis' | 'hockey'>('all');
  const [showTooltip, setShowTooltip] = useState(false);

  const effectiveSort = marketFilter === 'all' ? sortBy : (marketFilter as SortField);
  const marketLabel = {
    all: 'Śr. marża',
    soccer: 'Piłka nożna',
    basketball: 'Koszykówka',
    tennis: 'Tenis',
    hockey: 'Hokej',
  }[marketFilter];

  let data = [...DEMO_MARGINS];
  if (filterPL) data = data.filter(d => d.isLicensedPL);
  data.sort((a, b) => a[effectiveSort] - b[effectiveSort]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Porównanie Marż Bukmacherów</h1>
        <p className="mt-1 text-white/52">
          Niższa marża oznacza korzystniejsze kursy. Posortowane od najniższej do najwyższej.
        </p>
      </div>

      {/* Info banner */}
      <div className="glass-panel rounded-[28px] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-300/15 text-sky-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">Czym jest marża bukmachera?</h3>
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip((v) => !v)}
                className="rounded-full border border-white/15 bg-white/8 p-1 text-white/50 hover:text-white transition"
                aria-label="Pokaż wyjaśnienie"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            {showTooltip && (
              <div className="mt-2 rounded-[18px] border border-sky-300/20 bg-sky-300/5 p-4 text-sm leading-6 text-white/72">
                Marża bukmachera to różnica między &quot;fair value&quot; zakładu a kursem oferowanym przez bukmachera.
                Przykład: przy kursie &quot;fair&quot; 2.00 bukmacher oferuje 1.90 → marża ≈ 5.26%.
                W długim terminie marża bezpośrednio zmniejsza Twój zwrot z inwestycji. Im niższa marża,
                tym korzystniejsze warunki dla gracza. Bukmacherzy z marżą poniżej 3% (Pinnacle) są idealni
                do arbitrażu, bo rzadziej ograniczają wygrywających graczy.
              </div>
            )}
            {!showTooltip && (
              <p className="mt-1 text-sm text-white/58">
                Suma implikowanych prawdopodobieństw wszystkich wyników minus 100%. Im niższa, tym lepiej
                dla gracza. Marże poniżej 3% to poziom bukmacherów referencyjnych do arbitrażu.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <span className="shrink-0 self-center px-1 text-sm text-white/42">Filtruj:</span>
          {(['all', 'soccer', 'basketball', 'tennis', 'hockey'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMarketFilter(m)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                marketFilter === m
                  ? 'border border-sky-300/25 bg-sky-400/20 text-sky-100'
                  : 'border border-white/12 bg-white/6 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {{ all: 'Wszystkie', soccer: '⚽ Piłka nożna', basketball: '🏀 Koszykówka', tennis: '🎾 Tenis', hockey: '🏒 Hokej' }[m]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setFilterPL(!filterPL)}
          className={`w-full rounded-full px-4 py-2 text-sm transition sm:w-auto ${
            filterPL
              ? 'border border-rose-300/25 bg-rose-400/20 text-rose-100'
              : 'border border-white/12 bg-white/6 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          🇵🇱 Tylko polskie licencje
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-[28px] overflow-hidden">
        <div className="space-y-3 p-3 md:hidden">
          {data.map((bm, idx) => (
            <div key={bm.key} className="rounded-xl border border-white/10 bg-white/4 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-white/42">#{String(idx + 1).padStart(2, '0')}</p>
                  <p className="truncate text-sm font-semibold text-white">{bm.name}</p>
                  <p className="mt-0.5 text-xs text-white/46">{bm.note}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                  bm.isLicensedPL
                    ? 'bg-emerald-400/15 text-emerald-300'
                    : 'bg-white/8 text-white/50'
                }`}>
                  {bm.isLicensedPL ? 'PL' : 'GLOBAL'}
                </span>
              </div>

              <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-2.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{marketLabel}</p>
                <div className="mt-2">
                  <MarginBar value={bm[effectiveSort]} />
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-white/10 bg-white/4 px-2.5 py-2">
                  <p className="text-[11px] text-white/44">Śr. marża</p>
                  <p className="text-sm font-mono text-white">{bm.avgMargin.toFixed(1)}%</p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/4 px-2.5 py-2">
                  <p className="text-[11px] text-white/44">Promocje</p>
                  <p className="text-sm text-white/80">{bm.promotions > 0 ? `${bm.promotions} aktywne` : 'Brak'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left font-medium text-white/40">#</th>
                <th className="p-4 text-left font-medium text-white/40">Bukmacher</th>
                {(['avgMargin', 'soccer', 'basketball', 'tennis', 'hockey'] as SortField[]).map(field => (
                  <th
                    key={field}
                    className={`p-4 text-left font-medium cursor-pointer transition hover:text-white ${
                      (marketFilter === 'all' ? sortBy : marketFilter) === field ? 'text-sky-300' : 'text-white/40'
                    }`}
                    onClick={() => { setSortBy(field); setMarketFilter('all'); }}
                  >
                    {{ avgMargin: 'Śr. marża ▲', soccer: '⚽', basketball: '🏀', tennis: '🎾', hockey: '🏒' }[field]}
                  </th>
                ))}
                <th className="p-4 text-left font-medium text-white/40">Licencja PL</th>
                <th className="p-4 text-left font-medium text-white/40">Promocje</th>
              </tr>
            </thead>
            <tbody>
              {data.map((bm, idx) => (
                <tr key={bm.key} className="border-b border-white/6 last:border-0 hover:bg-white/4 transition group">
                  <td className="p-4 font-mono text-white/30">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-white">{bm.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">{bm.note}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <MarginBar value={bm.avgMargin} />
                  </td>
                  <td className="p-4"><MarginBar value={bm.soccer} /></td>
                  <td className="p-4"><MarginBar value={bm.basketball} /></td>
                  <td className="p-4"><MarginBar value={bm.tennis} /></td>
                  <td className="p-4"><MarginBar value={bm.hockey} /></td>
                  <td className="p-4">
                    {bm.isLicensedPL ? (
                      <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs text-emerald-300">
                        ✓ Tak
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-white/40">
                        Nie
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {bm.promotions > 0 ? (
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(bm.promotions, 5) }).map((_, i) => (
                          <span key={i} className="h-2 w-2 rounded-full bg-amber-400/70" />
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/25">–</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-white/42">
        <span>Legenda marż:</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> &lt; 3% – bardzo niska (referencyjny)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> 3–5% – niska</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> 5–6.5% – średnia</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> &gt; 6.5% – wysoka</span>
      </div>

      {/* Promotions note */}
      <div className="glass-panel rounded-[24px] p-5">
        <h3 className="font-semibold text-amber-100 mb-2">🎁 Stałe promocje z marżą 0%</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { bm: 'STS', promo: 'Środy bez podatku – zakłady bez opłaty skarbowej' },
            { bm: 'Fortuna', promo: 'Cashback do 200 zł przy przegranym zakładzie' },
            { bm: 'Superbet', promo: 'Zakład bez ryzyka 50 zł co tydzień' },
            { bm: 'Betclic', promo: 'Cashback 20% w piątek na wybrane ligi' },
            { bm: 'LvBet', promo: 'Doładowanie 100% do 100 zł w każdy poniedziałek' },
          ].map(p => (
            <div key={p.bm} className="rounded-[18px] border border-white/10 bg-white/4 p-3">
              <p className="text-xs font-semibold text-amber-200">{p.bm}</p>
              <p className="mt-1 text-xs leading-5 text-white/58">{p.promo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
