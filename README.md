# BukScan — skaner arbitrażu bukmacherskiego

BukScan to aplikacja webowa do wykrywania okazji arbitrażowych (surebetów) na polskim rynku bukmacherskim. Pobiera kursy bezpośrednio ze stron bukmacherów, porównuje je ze sobą i wskazuje sytuacje, gdzie postawienie na wszystkie możliwe wyniki meczu gwarantuje zysk niezależnie od tego, co się stanie na boisku.

## Spis treści

- [Czym jest surebet](#czym-jest-surebet)
- [Funkcje aplikacji](#funkcje-aplikacji)
- [Architektura i technologie](#architektura-i-technologie)
- [Struktura projektu](#struktura-projektu)
- [Zmienne środowiskowe](#zmienne-środowiskowe)
- [Jak działa scraper](#jak-działa-scraper)
- [Logika arbitrażu i podatek](#logika-arbitrażu-i-podatek)
- [Baza danych (Supabase)](#baza-danych-supabase)
- [API](#api)
- [Obsługiwani bukmacherzy](#obsługiwani-bukmacherzy)

---

## Czym jest surebet

Arbitraż bukmacherski zachodzi wtedy, gdy suma odwrotności najlepszych kursów na wszystkie wyniki tego samego meczu u różnych bukmacherów jest mniejsza niż 1:

```
1/kurs_1 + 1/kurs_X + 1/kurs_2 < 1
```

Jeśli ten warunek jest spełniony, można rozłożyć bankroll proporcjonalnie między wszystkich bukmacherów i zagwarantować sobie zysk bez względu na wynik. Zysk wyraża się wzorem:

```
zysk% = (1 / suma_odwrotności - 1) × 100
```

W praktyce marże bukmacherów sprawiają, że suma ta jest zazwyczaj większa niż 1 (bukmacher ma zysk wbudowany w kursy). Okazje arbitrażowe pojawiają się, gdy różni bukmacherzy wyceniają to samo zdarzenie inaczej — np. jeden faworyzuje gospodarzy, a inny gości.

---

## Funkcje aplikacji

### Dashboard (`/`)
Strona główna z szybkim przeglądem sytuacji: liczba dostępnych surebetów, rynki bliskie progu, średni profit i lista nadchodzących wydarzeń. Wyświetla spersonalizowane powitanie dla zalogowanego użytkownika.

### Okazje arbitrażowe (`/arbitrage`)
Pełna lista aktualnych surebetów wraz z rozkładem stawek i gwarantowanym zwrotem. Każda okazja pokazuje, u którego bukmachera postawić jaką kwotę i ile wyniesie zysk po podatku. Obok surebetów widoczna jest watchlista — mecze, które są bliskie progu arbitrażu (wystarczy zmiana kursu o kilka procent).

### Przeglądarka wydarzeń (`/events`)
Lista wszystkich zebranych wydarzeń z porównaniem kursów między bukmacherami. Można filtrować po sporcie i lidze, posortować po czasie rozpoczęcia, kliknąć w wydarzenie żeby zobaczyć pełne zestawienie kursów obok siebie.

### Kalkulator (`/kalkulator`)
Ręczny kalkulator arbitrażu. Użytkownik wpisuje własne kursy, wybiera bukmacherów i podaje łączną stawkę — kalkulator rozdziela ją proporcjonalnie i pokazuje, czy istnieje gwarantowany zysk. Wynik można od razu zapisać do dziennika.

### Marże bukmacherów (`/margins`)
Tabela z realnie obliczonymi marżami każdego bukmachera — liczonymi na podstawie kursów faktycznie zebranych przez scraper, nie z marketingowych deklaracji. Podział na piłkę nożną, koszykówkę i turnieje międzynarodowe.

### Konto i dziennik (`/account`)
Panel użytkownika z ustawieniami (lista posiadanych kont u bukmacherów, stawka podatkowa, progi alertów) oraz dziennikiem zakładów. Dziennik przechowuje historię zapisanych surebetów z możliwością oznaczenia każdego jako wygrana / przegrana / anulowana i dodania własnych notatek.

### Powiadomienia (`/notifications`)
Historia powiadomień systemowych o nowych surebetach, okazjach wchodzących w próg i zakończonych zakładach.

---

## Architektura i technologie

| Warstwa | Technologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Język | TypeScript |
| Stylowanie | Tailwind CSS |
| Autentykacja + baza | Supabase (PostgreSQL) |
| Scraper | Playwright (Chromium headless) |
| Hosting | Hostido |

Aplikacja działa w trybie **server-side rendering** — każde żądanie do strony z danymi kursów odczytuje najnowszy plik `scraped-data.json` i oblicza arbitraże na żywo na serwerze. Nie ma żadnego zewnętrznego cache'u ani kolejki zadań; dane są świeże przy każdym odświeżeniu strony.

---

## Struktura projektu

```
src/
├── app/                    # Strony Next.js (App Router)
│   ├── page.tsx            # Dashboard
│   ├── arbitrage/          # Lista surebetów
│   ├── events/             # Przeglądarka wydarzeń i widok szczegółowy
│   ├── kalkulator/         # Kalkulator ręczny
│   ├── margins/            # Marże bukmacherów
│   ├── account/            # Konto + dziennik + ustawienia
│   ├── notifications/      # Powiadomienia
│   ├── groups/             # Grupy MŚ 2026
│   ├── login/              # Logowanie
│   ├── register/           # Rejestracja
│   ├── auth/callback/      # Callback OAuth (Google)
│   └── api/
│       ├── sync/           # POST /api/sync — wywołuje scraper ręcznie
│       └── events/list/    # GET /api/events/list — lista wydarzeń jako JSON
│
├── components/             # Komponenty React
│   ├── ArbitrageCard.tsx       # Karta pojedynczego surebetu
│   ├── ArbitrageFilteredList.tsx  # Lista z filtrowaniem
│   ├── ArbitrageFormula.tsx    # Wzór matematyczny (wizualizacja)
│   ├── EventCard.tsx           # Karta meczu
│   ├── ManualCalculator.tsx    # Interaktywny kalkulator
│   ├── MarginsTable.tsx        # Tabela marż
│   ├── PotentialArbitrageCard.tsx # Karta okazji bliskiej progu
│   ├── Sidebar.tsx             # Nawigacja boczna
│   └── ...                 # Pozostałe komponenty UI
│
└── lib/                    # Logika biznesowa
    ├── types.ts            # Definicje typów TypeScript
    ├── arbitrage.ts        # Algorytmy: wykrywanie surebetów, podatek, stawki
    ├── scraper.ts          # Playwright — scraping kursów z bukmacherów
    ├── data-service.ts     # Fasada: łączy scraper z logiką arbitrażu
    ├── journal-service.ts  # CRUD na tabeli journal_entries w Supabase
    ├── store-types.ts      # Typy ustawień, lista bukmacherów, domyślne wartości
    ├── odds-api.ts         # Adapter do The Odds API (tryb z kluczem API)
    ├── demo-data.ts        # Dane testowe (gdy brak scraped-data.json i klucza API)
    ├── scraped-data.json   # Plik wynikowy scrapera (gitignored w prod)
    └── supabase/
        ├── client.ts       # Klient po stronie przeglądarki
        ├── server.ts       # Klient po stronie serwera (cookies)
        └── admin.ts        # Klient z rolą service_role
```

---


```

Aplikacja będzie dostępna pod `http://localhost:3000`.

Przy pierwszym uruchomieniu bez klucza API i bez pliku `scraped-data.json` aplikacja wyświetla dane demo. Żeby pobrać prawdziwe kursy, wywołaj endpoint synchronizacji:

```bash
curl -X POST http://localhost:3000/api/sync
```

Scraper uruchomi Chromium, otworzy strony bukmacherów i zapisze wyniki do `src/lib/scraped-data.json`. Zajmuje to około 2–3 minut.

---

## Zmienne środowiskowe

Plik `.env.local` (lub zmienne na serwerze):

```env
# Supabase — wymagane do logowania i dziennika
NEXT_PUBLIC_SUPABASE_URL=https://<id-projektu>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>


# Scraping — opcjonalne, wartości domyślne są sensowne
SCRAPE_INTERVAL_MIN=480   # co ile minut auto-scrape (domyślnie 8h)
SCRAPE_COOLDOWN_MIN=2     # minimalny czas między ręcznymi wywołaniami

# n8n — opcjonalne, do wysyłania alertów e-mail
N8N_WEBHOOK_URL=
N8N_AUTH_HEADER=
```

---

## Jak działa scraper

Scraper (`src/lib/scraper.ts`) uruchamia Chromium w trybie headless przez Playwright i odwiedza strony bukmacherów. Nie korzysta z żadnego publicznego API — parsuje DOM stron tak, jak widzi je przeglądarka.

### Obsługiwane strony

Każdy bukmacher ma własną strategię ekstrakcji dostosowaną do struktury jego strony:

- **STS, Superbet** — dedykowane ekstraktory operujące na specyficznych selektorach CSS tych serwisów
- **Fortuna, Totalbet** — ekstraktor `extractWynikMeczu` szukający sekcji "Wynik meczu" w kartach wydarzeń
- **Etoto** — ekstraktor na `li.single-event`
- **Fuksiarz, Betclic, forBET, LvBet, Betfan** — generyczny ekstraktor `extractGenericRows` próbujący wspólnych selektorów obecnych na większości serwisów bukmacherskich

### Przebieg scrapingu

1. Każda strona otwierana jest w izolowanym kontekście przeglądarki z polskim locale i strefą czasową Europe/Warsaw.
2. Blokowane są zasoby medialne (obrazki, wideo, fonty) — aplikacja potrzebuje tylko DOM.
3. Scraper przewija stronę w dół (auto-scroll), żeby załadować lazy-loaded rekordy.
4. Próbuje kliknąć przycisk akceptacji cookies, jeśli jest widoczny.
5. Wyekstrahowane rekordy są walidowane — odrzucane są wiersze z kursami poza realnym zakresem (1.01–66) lub z łączną implikowaną prawdopodobieńnością wykraczającą poza rozsądny margines bukmachera.

### Scalanie wyników

Najtrudniejsza część: ten sam mecz u różnych bukmacherów może być zapisany jako "Legia Warszawa – Raków Częstochowa" u jednego i "Legia – Raków" u drugiego. Scraper normalizuje nazwy (usuwa akcenty, skróty klubowe, spacje) i szuka podobieństwa tokenowego — dwa ciągi są uznawane za ten sam zespół, gdy co najmniej 65% tokenów pasuje do siebie.

Obsługiwane są też aliasy dla problemowych przypadków (np. różne formy gramatyczne "DR Kongo/DR Konga", skróty krajów).

Mecze z tą samą nazwą drużyn, ale odległym czasem rozpoczęcia (ponad 6h różnicy) są traktowane jako różne spotkania.

Po scaleniu każde wydarzenie dostaje stabilne ID oparte na znormalizowanych nazwach drużyn, które nie zmienia się między kolejnymi scrapingami — dzięki temu linki i wpisy w dzienniku nie tracą ważności po odświeżeniu danych.

### Automatyczny scraping

Po uruchomieniu serwera Next.js (instrumentation hook w `src/instrumentation-node.ts`) startuje harmonogram, który wywołuje scraper co 8 godzin (domyślnie). Pierwsze uruchomienie następuje 15 sekund po starcie serwera — ale tylko wtedy, gdy plik z danymi jest starszy niż interwał. Ręczne wywołanie przez `POST /api/sync` ma cooldown 2 minuty, żeby nie bombardować serwisów bukmacherskich zbyt często.

---

## Logika arbitrażu i podatek

Cała matematyka arbitrażu jest w `src/lib/arbitrage.ts`.

### Podatek od zakładów wzajemnych (12%)

W Polsce bukmacherzy pobierają 12% podatek od zakładów. Jest to podatek od obrotu (od stawki), nie od wygranej. Oznacza to, że ze 100 zł stawki w grę wchodzi faktycznie tylko 88 zł. Przy kursie 1.10 zwrot wynosi 88 × 1.10 = 96.80 zł, czyli strata — mimo że kurs jest "powyżej 1".

Efektywny kurs po podatku: `kurs_netto = kurs_brutto × (1 - podatek/100)`

Aplikacja zawsze liczy stawki i zyski na kursach netto. Wyświetlane kursy są brutto (takie jak widać u bukmachera), ale wszystkie wyliczenia finansowe uwzględniają podatek.

Wyjątek: **Betclic** oferuje tryb gry bez podatku (Betclic go pokrywa sam), więc jego kursy nie są dyskontowane. Jeśli inni bukmacherzy wprowadzą podobne programy, można ich dopisać do `TAX_FREE_BOOKMAKER_KEYS` w `store-types.ts`.

Użytkownik może zmienić stawkę podatkową w ustawieniach konta (domyślnie 12%).

### Filtr wiarygodności

Okazje arbitrażowe z zyskiem powyżej 20% są automatycznie odrzucane jako niemożliwe — oznaczają błąd parsowania lub pomylone dane z dwóch różnych meczów, a nie prawdziwy surebet.

### Watchlista (near-arbitrage)

Poza surebetami aplikacja wyświetla mecze "bliskie progu" — takie, gdzie zmiana kursu o mniej niż 3% u jednego bukmachera stworzyłaby surebet, a mecz zaczyna się w ciągu najbliższych 72 godzin lub już trwa (od max. 2 godzin). Dla każdej takiej okazji obliczany jest targetowy kurs, który należałoby zobaczyć, żeby powstał arbitraż.

---

## Baza danych (Supabase)

Do działania scrapera i obliczania arbitrażu baza danych nie jest potrzebna. Supabase jest używane wyłącznie do:

- autentykacji użytkowników (e-mail/hasło + Google OAuth)
- przechowywania dziennika zakładów (`journal_entries`)

### Schemat tabeli `journal_entries`

```sql
create table journal_entries (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  event_name      text not null,
  sport_title     text not null,
  commence_time   timestamptz not null,
  market_key      text not null,
  bets            jsonb not null,       -- tablica JournalBet[]
  total_stake     numeric not null,
  guaranteed_return numeric not null,
  profit          numeric not null,
  profit_percent  numeric not null,
  status          text not null default 'pending',  -- pending|won|lost|cancelled
  notes           text not null default '',
  arbitrage_id    text,
  is_demo         boolean not null default false
);

-- Row Level Security: każdy użytkownik widzi tylko swoje wpisy
alter table journal_entries enable row level security;
create policy "own rows" on journal_entries
  using (auth.uid() = user_id);
```

---

## API

### `POST /api/sync`

Uruchamia scraper i nadpisuje `scraped-data.json`. Endpoint jest chroniony cooldownem (domyślnie 2 minuty) — jeśli dane są świeże, zwraca je od razu bez ponownego scrapowania.

**Odpowiedź (sukces):**
```json
{
  "success": true,
  "count": 87,
  "timestamp": 1718800000000
}
```

**Odpowiedź (cooldown aktywny):**
```json
{
  "success": true,
  "skipped": true,
  "count": 87,
  "timestamp": 1718799000000,
  "message": "Kursy są aktualne (odświeżono 1 minutę temu)."
}
```

**Odpowiedź (scraping w toku):** HTTP 429

### `GET /api/sync`

Zwraca status synchronizacji bez uruchamiania scrapera.

```json
{
  "isSyncing": false,
  "lastSyncTime": 1718800000000,
  "lastSyncCount": 87,
  "hasData": true
}
```

### `GET /api/events/list`

Zwraca listę wszystkich wydarzeń jako JSON (bez przeliczania arbitrażu). Używane przez komponenty frontendowe do filtrowania i sortowania po stronie klienta.

---

## Obsługiwani bukmacherzy

| Bukmacher | Klucz | Strona |
|---|---|---|
| STS | `sts` | sts.pl |
| Superbet | `superbet` | superbet.pl |
| Fortuna | `fortuna` | efortuna.pl |
| Betclic | `betclic` | betclic.pl |
| Etoto | `etoto` | etoto.pl |
| Fuksiarz | `fuksiarz` | fuksiarz.pl |
| forBET | `forbet` | iforbet.pl |
| LvBet | `lvbet` | lvbet.pl |
| Betfan | `betfan` | betfan.pl |
| Totalbet | `totalbet` | totalbet.pl |

Bukmacherzy zagraniczni (Pinnacle, Bet365, Unibet itd.) są zdefiniowani w liście `ALL_BOOKMAKERS` jako przyszłe rozszerzenie, ale aktualnie nie są scrapowane — ich strony blokują automatyczne odwiedziny skuteczniej niż polskie odpowiedniki lub wymagają logowania.

### Obsługiwane sporty

- Piłka nożna: wszystkie ligi dostępne w danym momencie u scrapowaych bukmacherów, automatycznie rozpoznawane jako spotkania klubowe lub reprezentacyjne (Mistrzostwa Świata 2026)
- Koszykówka: rynki dwudrogowe (zwycięzca meczu z dogrywką)

---

## Tryb demo

Gdy brak pliku `scraped-data.json` i brak klucza `ODDS_API_KEY`, aplikacja automatycznie ładuje statyczne dane demo z `src/lib/demo-data.ts`. Tryb demo jest oznaczony banerem w interfejsie i nie wymaga żadnej konfiguracji — aplikacja jest w pełni nawigowalna i kalkulator działa normalnie.
