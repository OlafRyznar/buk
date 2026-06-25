# BukScan — pytania i odpowiedzi o projekcie

Dokument podsumowujący stan projektu: co zostało zrobione, co nie wyszło, jakie są ograniczenia techniczne i jak na nie odpowiedziano decyzjami produktowymi. Pisany jako materiał do prezentacji/obrony projektu oraz jako punkt odniesienia na przyszłość.

---

## 1. Czym jest projekt i jaki problem rozwiązuje

**P: Co to jest BukScan?**

BukScan to aplikacja webowa (Next.js 15, App Router, TypeScript) do wykrywania okazji arbitrażu bukmacherskiego (surebetów) na polskim rynku bukmacherskim. Pobiera kursy bezpośrednio ze stron 10 polskich bukmacherów, porównuje je między sobą i wskazuje sytuacje, w których postawienie odpowiednio rozłożonych stawek na wszystkie możliwe wyniki meczu gwarantuje zysk niezależnie od wyniku sportowego.

**P: Na czym polega arbitraż bukmacherski (surebet)?**

Arbitraż zachodzi, gdy suma odwrotności najlepszych dostępnych kursów na wszystkie wyniki tego samego zdarzenia (u różnych bukmacherów) jest mniejsza niż 1:

```
1/kurs_1 + 1/kurs_X + 1/kurs_2 < 1
```

Zysk procentowy: `(1 / suma_odwrotności − 1) × 100`. W praktyce marża wbudowana przez bukmacherów sprawia, że ta suma jest zwykle > 1 — okazja powstaje tylko wtedy, gdy różni bukmacherzy wycenią to samo zdarzenie inaczej (np. jeden faworyzuje gospodarzy, drugi gości).

**P: Dla kogo jest ta aplikacja?**

Dla osób grających w zakłady wzajemne w Polsce, które chcą:
- automatycznie wykrywać surebety bez ręcznego porównywania kursów u 10 bukmacherów,
- mieć kalkulator do ręcznego liczenia podziału stawek,
- śledzić swoją historię zakładów (dziennik) i realną rentowność po podatku.

---

## 2. Co udało się zrobić (zakres działający)

**P: Jakie funkcje są w pełni gotowe i działające?**

- **Scraper kursów** (Playwright, Chromium headless) dla 10 polskich bukmacherów: STS, Superbet, Fortuna, Betclic, Etoto, Fuksiarz, forBET, LvBet, Betfan, Totalbet. Każdy ma dedykowaną lub generyczną strategię ekstrakcji DOM dopasowaną do struktury jego strony.
- **Scalanie wydarzeń między bukmacherami** — normalizacja nazw drużyn (usuwanie akcentów, skrótów, dopasowanie tokenowe ≥65% podobieństwa), aliasy dla problematycznych przypadków (np. różne formy "DR Kongo"), rozróżnianie meczów o tej samej nazwie ale odległym czasie startu (>6h różnicy = inne wydarzenie).
- **Stabilne ID wydarzeń** oparte na znormalizowanych nazwach drużyn — nie zmieniają się między kolejnymi scrapingami, dzięki czemu linki i wpisy w dzienniku nie wygasają po odświeżeniu danych.
- **Silnik arbitrażu** (`src/lib/arbitrage.ts`) — pełna matematyka: wykrywanie surebetów, rozkład stawek proporcjonalny, uwzględnienie 12% podatku od zakładów wzajemnych (z wyjątkiem Betclic, który ma tryb bez podatku), filtr odrzucający "okazje" >20% zysku jako błędy parsowania.
- **Watchlista (near-arbitrage)** — pokazuje mecze bliskie progu arbitrażu (zmiana kursu <3% u jednego bukmachera stworzyłaby surebet), ograniczone do meczów zaczynających się w ciągu 72h lub trwających od max. 2h, z wyliczonym kursem docelowym.
- **Dashboard, lista surebetów, przeglądarka wydarzeń z filtrowaniem po sporcie/lidze, kalkulator ręczny, tabela realnych marż bukmacherów, dziennik zakładów z statusami (wygrana/przegrana/anulowana), powiadomienia.**
- **Autentykacja i konta** przez Supabase (e-mail/hasło + Google OAuth), Row Level Security na tabeli `journal_entries`.
- **Tryb demo** — gdy brak danych ze scrapera i brak klucza API, aplikacja ładuje statyczne dane demo, w pełni nawigowalna bez konfiguracji.
- **Automatyczny harmonogram scrapingu** co 8h (`SCRAPE_INTERVAL_MIN`) uruchamiany przez instrumentation hook Next.js, plus endpoint `POST /api/sync` do ręcznego odświeżenia z cooldownem 2 minut (chroni przed zbyt częstym obciążaniem stron bukmacherów).
- **Filtr wiarygodności danych** — walidacja kursów w realnym zakresie (1.01–66) i odrzucanie wierszy o nierealnej implikowanej probabilności, żeby błędy scrapingu nie generowały fałszywych surebetów.

**P: Czego się nauczyliśmy / co zadziałało lepiej niż zakładano?**

- Generyczny ekstraktor (`extractGenericRows`) sprawdził się dla większości serwisów bukmacherskich opartych na podobnych wzorcach DOM (Fuksiarz, Betclic, forBET, LvBet, Betfan) — nie trzeba pisać osobnego parsera dla każdego z nich.
- Dopasowanie tokenowe nazw drużyn (≥65% podobieństwa) okazało się wystarczająco odporne na różnice w zapisie nazw klubów między serwisami, bez potrzeby budowania pełnego słownika aliasów.

---

## 3. Co nie udało się zrobić / czego zabrakło

**P: Jakie funkcje z roadmapy zostały odłożone lub nie weszły?**

Zgodnie z `src/app/roadmap/page.tsx`, w pełni zrealizowana jest tylko **Faza 1 (MVP)**. Pozostałe fazy są w statusie "planowana" lub "w trakcie":

- **Faza 2 — dane na żywo:** WebSocket/SSE do odświeżania w czasie rzeczywistym, auto-refresh co 30s, powiadomienia push, zaawansowane filtrowanie i sortowanie, dodatkowe typy rynków (over/under, handicap) — **niezrealizowane**.
- **Faza 3 — szersze scrapowanie:** Betfair Exchange, zagraniczni bukmacherzy (Pinnacle, Bet365, Unibet, Betway), rotacja proxy, cache w Redis/Upstash, rate limiting — **niezrealizowane**. Bukmacherzy zagraniczni są zdefiniowani w `ALL_BOOKMAKERS` jako rezerwa na przyszłość, ale nie są scrapowani, bo ich strony skuteczniej blokują automatyczne odwiedziny lub wymagają logowania.
- **Faza 4 — analiza zaawansowana:** dane historyczne i trendy, predykcja ML, value betting, kalkulator Kelly Criterion, rozliczenia wielowalutowe — **niezrealizowane**.
- **Faza 5 — monetyzacja:** plan premium, bot Telegram/Discord, publiczne API — **częściowo zrealizowane** (konta użytkowników i dziennik istnieją, ale brak płatnego planu, brak bota, brak publicznego API).
- **Faza 6 — produkcja i skalowalność:** Redis, CDN, monitoring (Sentry/LogRocket), pełne testy jednostkowe/integracyjne, CI/CD — **niezrealizowane**. Aplikacja działa obecnie na hostingu Hostido w trybie SSR bez warstwy cache.

**P: Czy próbowano scrapować bukmacherów zagranicznych (Pinnacle, Bet365, Unibet)?**

Tak, są przygotowani w strukturze danych (`ALL_BOOKMAKERS`), ale scraping się nie powiódł na tyle skutecznie, by włączyć ich do produkcji — ich strony stosują silniejsze mechanizmy antybotowe i/lub wymagają zalogowania, co wykracza poza zakres prostego scrapera DOM bez rotacji proxy i bez systemu sesji.

**P: Czy jest cache albo kolejka zadań?**

Nie. Aplikacja działa w czystym trybie server-side rendering — każde żądanie strony z kursami odczytuje plik `scraped-data.json` i liczy arbitraże na żywo, na serwerze. Nie ma Redis, nie ma kolejki, nie ma warstwy pośredniej. To prostsze w utrzymaniu, ale ogranicza skalowalność przy większym ruchu.

---

## 4. Główne ograniczenia projektu

**P: Jakie jest największe ograniczenie techniczne?**

**Prędkość odświeżania kursów.** Scraper oparty na Playwright + Chromium headless musi fizycznie otworzyć każdą stronę bukmachera, poczekać na załadowanie, przewinąć (auto-scroll) i sparsować DOM. Pełny przebieg po wszystkich 10 bukmacherach trwa około **2–3 minuty**. To oznacza, że:
- nie da się odświeżać kursów w czasie rzeczywistym (sekundy) — domyślny interwał automatyczny to 8 godzin, a ręczne odświeżenie ma cooldown 2 minuty właśnie po to, by nie przeciążać stron bukmacherów ciągłym scrapowaniem.
- między dwoma odświeżeniami kursy u bukmacherów mogą się zmienić wielokrotnie — okno wykrycia surebetu może się zamknąć, zanim użytkownik zdąży zareagować.

**P: Czy to oznacza, że surebety wykrywane przez aplikację są zawsze aktualne?**

Nie zawsze. Dane są tak świeże, jak ostatni scraping (do 8h, lub mniej jeśli użytkownik ręcznie odświeżył z zachowaniem cooldownu). W zakładach sportowych okazje arbitrażowe bywają krótkotrwałe (minuty), więc realna szansa na "złowienie" surebetu zanim kurs się skoryguje jest ograniczona przez częstotliwość scrapingu, a nie przez samą logikę wykrywania.

**P: Czy łatwo jest znaleźć prawdziwe surebety?**

Nie — to drugie kluczowe ograniczenie. Nawet z poprawnie działającym scraperem i dobrą logiką wykrywania, **rzeczywistych surebetów na rynku polskim jest mało i są nietrwałe**. Powody:
- Bukmacherzy szybko korygują kursy, gdy widzą jednostronny napływ zakładów (to właśnie tworzy i zamyka okazje arbitrażowe).
- Polscy bukmacherzy często kopiują się nawzajem cenowo (podobne marże, podobne typowania), więc rozjazdy kursów wystarczające do arbitrażu po uwzględnieniu 12% podatku są rzadkie.
- 12% podatek od obrotu znacząco zawęża próg — kurs musi być rozjeżdżony dość mocno, żeby po przeliczeniu na netto nadal wyszedł zysk, co dodatkowo redukuje liczbę realnych okazji.
- Filtr wiarygodności (odrzucanie okazji >20% zysku) słusznie eliminuje błędy parsowania, ale tym samym eliminuje też dużą część "okazji", które i tak były fałszywe.

**P: Jak zaadresowano te dwa ograniczenia (wolne odświeżanie + rzadkość surebetów) na poziomie produktu?**

Zdecydowano się **przesunąć nacisk z "czystego łowienia surebetów" na pokazywanie najwyższych dostępnych kursów** u poszczególnych bukmacherów dla danego wydarzenia/rynku:
- Widok porównawczy w `/events` pokazuje kursy wszystkich bukmacherów obok siebie dla każdego wydarzenia, z naciskiem na to, który bukmacher daje **najlepszy kurs** na dany wynik — nawet jeśli nie składa się to w pełny surebet.
- Watchlista (near-arbitrage) jest świadomym kompromisem: skoro pełne surebety są rzadkie i krótkotrwałe, użytkownikowi pokazuje się też okazje "blisko progu" (różnica <3%), żeby miał szansę zareagować, gdy kurs jeszcze trochę się ruszy — to rozszerza użyteczność danych poza wąskie okno realnych surebetów.
- Tabela marż (`/margins`) pozwala użytkownikowi samodzielnie ocenić, który bukmacher ma generalnie najlepsze (najniższe marżowo, czyli najwyższe dla grającego) kursy w danej dyscyplinie, niezależnie od tego, czy akurat trwa surebet.
- W praktyce aplikacja działa więc jako **narzędzie do znajdowania najlepszych kursów i okazji granicznych**, a nie wyłącznie "maszynka do gwarantowanego zysku" — to bardziej realistyczne pozycjonowanie biorąc pod uwagę ograniczenia częstotliwości danych i rzadkość prawdziwych surebetów.

**P: Jakie są inne, mniejsze ograniczenia?**

- **Rynki ograniczone do dwu-/trójdrogowych** — piłka nożna (1X2) i koszykówka (zwycięzca z dogrywką). Brak handicapów, over/under, rynków szczegółowych (np. liczba goli, strzelcy) — to wymagałoby znacznie bardziej złożonego parsowania DOM dla każdego bukmachera.
- **Brak historii kursów** — aplikacja przechowuje tylko ostatni stan (`scraped-data.json`), nie ma bazy danych historycznych do analizy trendów ani do trenowania modeli predykcyjnych.
- **Zależność od struktury DOM bukmacherów** — każda zmiana układu strony bukmachera może zepsuć ekstraktor i wymaga ręcznej aktualizacji selektorów; to typowe ryzyko każdego scrapera bez publicznego API.
- **Brak testów automatycznych** — nie ma jednostkowych/integracyjnych testów (planowane w Fazie 6), co zwiększa ryzyko regresji przy zmianach w logice arbitrażu lub scraperze.
- **Pojedynczy serwer, brak cache** — przy większym ruchu obliczanie arbitrażu na żywo przy każdym żądaniu może obciążyć serwer; nie ma warstwy Redis ani CDN.

---

## 5. Decyzje produktowe i ich uzasadnienie

**P: Dlaczego podatek 12% jest wliczany do kalkulacji, a nie tylko pokazywany informacyjnie?**

Bo kurs "powyżej 1.0" może mimo to generować stratę po podatku od obrotu (np. kurs 1.10 brutto przy 100 zł stawki: 88 zł netto w grę × 1.10 = 96.80 zł, czyli strata). Pokazywanie tylko kursów brutto sugerowałoby fałszywe okazje. Dlatego wszystkie wyliczenia finansowe (stawki, zysk, próg arbitrażu) bazują na kursie netto, a kursy brutto są wyświetlane tylko jako odniesienie do tego, co widać u bukmachera.

**P: Dlaczego Betclic jest wyjątkiem podatkowym?**

Betclic oferuje tryb gry bez podatku (pokrywa go sam), więc jego kursy nie są dyskontowane w obliczeniach. Lista wyjątków (`TAX_FREE_BOOKMAKER_KEYS`) jest rozszerzalna, jeśli inni bukmacherzy wprowadzą podobne promocje.

**P: Dlaczego odrzucane są okazje z zyskiem >20%?**

Tak wysoki "zysk" w realnym arbitrażu bukmacherskim praktycznie nie istnieje — oznacza w 99% przypadków błąd scrapowania (pomylone mecze, źle sparsowany kurs, nieaktualna strona). Filtr chroni użytkownika przed postawieniem pieniędzy na podstawie danych, które są artefaktem błędu technicznego, a nie realną okazją rynkową.

**P: Dlaczego cooldown 2 minuty na ręczne odświeżenie?**

Żeby nie bombardować stron bukmacherów częstymi automatycznymi wizytami, co groziłoby zablokowaniem adresu IP scrapera i utratą dostępu do danych w ogóle. To kompromis między świeżością danych a stabilnością/trwałością samego mechanizmu zbierania danych.

---

## 6. Stos technologiczny i architektura (skrót)

| Warstwa | Technologia |
|---|---|
| Framework | Next.js 15/16 (App Router), SSR |
| Język | TypeScript |
| Stylowanie | Tailwind CSS |
| Autentykacja + baza | Supabase (PostgreSQL, RLS) |
| Scraper | Playwright (Chromium headless) |
| Hosting | Hostido |

Kluczowe pliki logiki: `src/lib/arbitrage.ts` (matematyka arbitrażu), `src/lib/scraper.ts` (zbieranie kursów), `src/lib/data-service.ts` (łączenie scrapera z arbitrażem), `src/lib/journal-service.ts` (dziennik w Supabase).

---

## 7. Plany na przyszłość (z roadmapy, nie zrealizowane)

Krótkoterminowo (Faza 2): odświeżanie danych w czasie bliższym rzeczywistemu (cel <30s opóźnienia), więcej typów rynków, lepsze filtrowanie.

Średnioterminowo (Faza 3–4): szersze pokrycie bukmacherów (cel: 20+, w tym zagraniczni i Betfair Exchange), cache pośredni (Redis), dane historyczne i analiza trendów, value betting, kalkulator Kelly Criterion.

Długoterminowo (Faza 5–6): monetyzacja (plan premium, boty powiadomień, publiczne API), pełna infrastruktura produkcyjna (testy, CI/CD, monitoring, CDN).

Cele biznesowe zapisane w aplikacji: 20+ bukmacherów monitorowanych, <30s opóźnienia danych, 15+ sportów — żaden z tych celów nie jest jeszcze zrealizowany w obecnej wersji (10 bukmacherów krajowych, opóźnienie liczone w godzinach, 2 sporty: piłka nożna i koszykówka).
