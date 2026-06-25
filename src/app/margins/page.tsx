import MarginsTable from "@/components/MarginsTable";
import { getBookmakerMargins } from "@/lib/data-service";
import BookmakerIcon from "@/components/BookmakerIcon";

// Przykładowe promocje, jakie pojawiały się / mogą pojawiać się u danego
// bukmachera — materiał poglądowy, nie aktualna oferta.
const EXAMPLE_PROMOTIONS: { key: string; name: string; promos: string[] }[] = [
  {
    key: "sts",
    name: "STS",
    promos: ["Zakład bez ryzyka na start", "Boost kursów na hity kolejki", "Freebet za polecenie"],
  },
  {
    key: "fortuna",
    name: "Fortuna",
    promos: ["Zakład bez ryzyka do 600 zł", "Cashback przy przegranym kuponie", "Podwojenie pierwszej wpłaty"],
  },
  {
    key: "superbet",
    name: "Superbet",
    promos: ["Superkursy (podbite kursy dnia)", "Zakład bez ryzyka 50 zł co tydzień", "Bonus powitalny od depozytu"],
  },
  {
    key: "betclic",
    name: "Betclic",
    promos: ["Kurs 100.00 na start dla nowych", "Cashback na wybrane ligi", "Misje z freebetami"],
  },
  {
    key: "fuksiarz",
    name: "Fuksiarz",
    promos: ["Bonus 100% od pierwszej wpłaty", "Freebet na start", "Promocje okolicznościowe na MŚ"],
  },
  {
    key: "etoto",
    name: "Etoto",
    promos: ["Bonus powitalny do 1000 zł", "Freebet za rejestrację z kodem", "Boosty na weekendowe mecze"],
  },
  {
    key: "forbet",
    name: "forBET",
    promos: ["Freebet na start", "Bonus od depozytu", "Promocja zwrotu przy remisie 0:0"],
  },
  {
    key: "totalbet",
    name: "Totalbet",
    promos: ["Freebet bez depozytu za rejestrację", "Bonus od wpłaty na start", "TOTALprzewaga — podbite kursy"],
  },
];

export const dynamic = "force-dynamic";

function formatSync(ts: number | null) {
  if (!ts) return null;
  return new Date(ts).toLocaleString("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function MarginsPage() {
  const { stats, totalEvents, lastSync } = await getBookmakerMargins();
  const syncLabel = formatSync(lastSync);
  const totalSamples = stats.reduce((sum, s) => sum + s.eventCount, 0);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Marże bukmacherów
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/55">
            Policzone z{" "}
            <span className="font-semibold text-white/80">realnie zeskanowanych kursów</span> —
            nie z cennika marketingowego. Im niższa marża, tym uczciwszy kurs dla gracza.
          </p>
        </div>
        {stats.length > 0 && (
          <div className="flex flex-col items-start gap-1 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-2.5 sm:items-end">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Dane live
            </span>
            <span className="font-mono text-[11px] text-white/45 tabular-nums">
              {totalSamples} rynków · {totalEvents} wydarzeń
              {syncLabel ? ` · synch. ${syncLabel}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Explainer */}
      <details className="glass-panel group rounded-xl">
        <summary className="flex cursor-pointer select-none items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-400/12 text-sky-200">
              <svg className="h-4.5 w-4.5" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">
              Czym jest marża i jak ją liczymy?
            </h3>
          </div>
          <span className="text-white/40 transition-transform group-open:rotate-180">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </summary>
        <div className="border-t border-white/8 px-5 pb-5 pt-4 text-sm leading-6 text-white/65">
          <p>
            Dla każdego meczu sumujemy odwrotności kursów danego bukmachera
            (np. 1/1.90 + 1/3.80 + 1/4.50). Wynik powyżej 100% to właśnie marża — wbudowana
            przewaga bukmachera. Przy uczciwym kursie suma wynosiłaby dokładnie 100%.
          </p>
          <p className="mt-2">
            Tabela pokazuje <span className="font-medium text-white/85">średnią ze wszystkich
            zeskanowanych meczów</span> danego bukmachera (kolumna &quot;Próbka&quot; mówi z ilu).
            Mała próbka = mniej wiarygodna średnia. Marże poniżej 3% to poziom bukmacherów
            referencyjnych, idealnych do arbitrażu.
          </p>
        </div>
      </details>

      <MarginsTable stats={stats} />

      {/* Example promotions */}
      <section className="glass-panel rounded-xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-white">Przykładowe promocje bukmacherów</h2>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-200/80">
            materiał poglądowy
          </span>
        </div>
        <p className="mt-1.5 text-xs text-white/45">
          Tego typu oferty pojawiały się lub mogą pojawiać się u danego bukmachera — przed grą
          zawsze sprawdź aktualny regulamin promocji na jego stronie.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EXAMPLE_PROMOTIONS.map((bm) => (
            <div
              key={bm.key}
              className="card-hover rounded-lg border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <BookmakerIcon bookmakerKey={bm.key} size={18} />
                {bm.name}
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {bm.promos.map((promo) => (
                  <li key={promo} className="flex gap-2 text-xs leading-5 text-white/55">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sky-400/60" />
                    {promo}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Legend */}
      {stats.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/45">
          <span className="font-medium text-white/55">Legenda:</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> &lt; 3% bardzo niska
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> 3–5% niska
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> 5–6.5% średnia
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> &gt; 6.5% wysoka
          </span>
          <span className="ml-auto text-white/35">
            ×N = liczba rynków, z których policzono średnią
          </span>
        </div>
      )}
    </div>
  );
}
