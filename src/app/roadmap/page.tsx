export default function RoadmapPage() {
  const phases = [
    {
      phase: "Faza 1 - MVP",
      status: "done" as const,
      color: "emerald",
      items: [
        { text: "Integracja z The Odds API (dane z prawdziwych bukmacherow)", done: true },
        { text: "Algorytm wykrywania arbitrazu (surebet)", done: true },
        { text: "Dashboard z podsumowaniem rynku", done: true },
        { text: "Lista okazji arbitrazowych z kalkulacja stawek", done: true },
        { text: "Porownywarka kursow miedzy bukmacherami", done: true },
        { text: "Kalkulator arbitrazu (reczne wprowadzanie kursow)", done: true },
        { text: "Responsywny design (Tailwind CSS)", done: true },
        { text: "Tryb demo z realistycznymi danymi", done: true },
      ],
    },
    {
      phase: "Faza 2 - Dane na zywo",
      status: "current" as const,
      color: "blue",
      items: [
        { text: "WebSocket/SSE do odswiezania kursow w czasie rzeczywistym", done: false },
        { text: "Automatyczne odswiezanie co 30 sekund", done: false },
        { text: "Powiadomienia push o nowych okazjach arbitrazowych", done: false },
        { text: "Filtrowanie po sportach, bukmacherach, minimalnym zysku", done: false },
        { text: "Sortowanie i zaawansowane wyszukiwanie wydarzen", done: false },
        { text: "Obsluga wiekszej liczby rynkow (over/under, handicap)", done: false },
      ],
    },
    {
      phase: "Faza 3 - Scraping bukmacherow",
      status: "planned" as const,
      color: "amber",
      items: [
        { text: "Web scraping kursow z polskich bukmacherow (STS, Fortuna, Betclic, Superbet)", done: false },
        { text: "Scraping z Betfair Exchange", done: false },
        { text: "Obsluga bukmacherow europejskich: Pinnacle, Bet365, Unibet, Betway", done: false },
        { text: "System kolejkowania i rotacji proxy do unikania blokad", done: false },
        { text: "Cache warstwy posredniej z Redis/Upstash", done: false },
        { text: "Rate limiting i obsluga bledow API", done: false },
      ],
    },
    {
      phase: "Faza 4 - Zaawansowana analiza",
      status: "planned" as const,
      color: "purple",
      items: [
        { text: "Historyczne dane arbitrazowych - analiza trendow", done: false },
        { text: "Predykcja kursow na podstawie ML (machine learning)", done: false },
        { text: "Value betting - identyfikacja zawyzone kursow", done: false },
        { text: "Kelly Criterion kalkulator optymalnych stawek", done: false },
        { text: "Wielowalutowe rozliczenia i konwersja", done: false },
        { text: "Porownanie marzy bukmacherow", done: false },
      ],
    },
    {
      phase: "Faza 5 - Uzytkownicy i monetyzacja",
      status: "planned" as const,
      color: "red",
      items: [
        { text: "System rejestracji i logowania (NextAuth.js)", done: false },
        { text: "Zapisywanie ulubionych wydarzen i preferencji", done: false },
        { text: "Powiadomienia email/SMS o okazjach", done: false },
        { text: "Panel administratora z analityka", done: false },
        { text: "Plan premium z zaawansowanymi funkcjami", done: false },
        { text: "Bot Telegram/Discord do powiadomien", done: false },
        { text: "API publiczne dla zewnetrznych deweloperow", done: false },
      ],
    },
    {
      phase: "Faza 6 - Skalowalnosc i produkcja",
      status: "planned" as const,
      color: "gray",
      items: [
        { text: "Deploy na Vercel z Edge Functions", done: false },
        { text: "Baza danych PostgreSQL (Neon/Supabase) na dane historyczne", done: false },
        { text: "Redis cache dla kursow w czasie rzeczywistym", done: false },
        { text: "CDN i optymalizacja wydajnosci", done: false },
        { text: "Monitoring i alerty (Sentry, LogRocket)", done: false },
        { text: "Testy jednostkowe i integracyjne (Jest, Playwright)", done: false },
        { text: "CI/CD pipeline z GitHub Actions", done: false },
        { text: "Dokumentacja API i uzytkownika", done: false },
      ],
    },
  ];

  const statusBadge = {
    done: { text: "Ukonczona", bg: "bg-emerald-500/20", color: "text-emerald-400" },
    current: { text: "W trakcie", bg: "bg-blue-500/20", color: "text-blue-400" },
    planned: { text: "Planowana", bg: "bg-[#1e293b]", color: "text-[#64748b]" },
  };

  const colorMap: Record<string, { border: string; dot: string }> = {
    emerald: { border: "border-emerald-500/30", dot: "bg-emerald-500" },
    blue: { border: "border-blue-500/30", dot: "bg-blue-500" },
    amber: { border: "border-amber-500/30", dot: "bg-amber-500" },
    purple: { border: "border-purple-500/30", dot: "bg-purple-500" },
    red: { border: "border-red-500/30", dot: "bg-red-500" },
    gray: { border: "border-[#374151]", dot: "bg-[#64748b]" },
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Plan Rozwoju</h1>
        <p className="mt-1 text-white/64">
          Roadmapa projektu BukScan, od MVP do pełnej platformy arbitrażowej.
        </p>
      </div>

      {/* Progress overview */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-white/68">Postęp ogólny</span>
          <span className="text-sm text-emerald-200 font-mono">
            {phases[0].items.length}/{phases.reduce((s, p) => s + p.items.length, 0)} zadan
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
            style={{
              width: `${(phases[0].items.filter((i) => i.done).length / phases.reduce((s, p) => s + p.items.length, 0)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Tech stack */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6">
        <h2 className="text-lg font-bold text-white mb-4">Stos technologiczny</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Next.js 16", desc: "App Router, SSR" },
            { name: "TypeScript", desc: "Typy statyczne" },
            { name: "Tailwind CSS 4", desc: "Stylowanie" },
            { name: "The Odds API", desc: "Dane kursow" },
            { name: "Vercel", desc: "Hosting (plan)" },
            { name: "PostgreSQL", desc: "Baza danych (plan)" },
            { name: "Redis", desc: "Cache (plan)" },
            { name: "NextAuth.js", desc: "Autentykacja (plan)" },
          ].map((tech) => (
            <div key={tech.name} className="rounded-xl border border-white/8 bg-transparent p-3">
              <p className="text-white font-medium text-sm">{tech.name}</p>
              <p className="text-white/55 text-xs">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-6">
        {phases.map((phase) => {
          const badge = statusBadge[phase.status];
          const colors = colorMap[phase.color];
          const completedCount = phase.items.filter((i) => i.done).length;

          return (
            <div
              key={phase.phase}
              className={`glass-panel rounded-3xl border ${colors.border} p-4 sm:p-6`}
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                  <h2 className="text-lg font-bold text-white">{phase.phase}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/45">
                    {completedCount}/{phase.items.length}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${badge.bg} ${badge.color}`}>
                    {badge.text}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {phase.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 py-1"
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      item.done
                        ? "bg-emerald-500/20 border-emerald-500/50"
                        : "border-[#374151]"
                    }`}>
                      {item.done && (
                        <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${item.done ? "text-white/78" : "text-white/55"}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Key metrics targets */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6">
        <h2 className="text-lg font-bold text-white mb-4">Cele biznesowe</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/8 bg-transparent p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400 sm:text-3xl">20+</p>
            <p className="text-sm text-white/72 mt-1">Bukmacherów</p>
            <p className="text-xs text-white/52">do monitorowania</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-transparent p-4 text-center">
            <p className="text-2xl font-bold text-blue-400 sm:text-3xl">&lt;30s</p>
            <p className="text-sm text-white/72 mt-1">Opóźnienie danych</p>
            <p className="text-xs text-white/52">cel na Fazę 2</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-transparent p-4 text-center">
            <p className="text-2xl font-bold text-amber-400 sm:text-3xl">15+</p>
            <p className="text-sm text-white/72 mt-1">Sportów</p>
            <p className="text-xs text-white/52">piłka nożna, koszykówka, tenis...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
