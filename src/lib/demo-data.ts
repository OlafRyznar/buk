import { OddsApiEvent } from './types';

/**
 * Demo data with realistic odds tailored to the Polish market.
 * Represents surebets and opportunities from local bookmakers.
 */
export function getDemoEvents(): OddsApiEvent[] {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  return [
    // ARBITRAGE OPPORTUNITY - Ekstraklasa (3-way)
    {
      id: 'demo-pl-001',
      sport_key: 'soccer_poland_ekstraklasa',
      sport_title: 'Ekstraklasa',
      commence_time: tomorrow.toISOString(),
      home_team: 'Legia Warszawa',
      away_team: 'Lech Poznań',
      bookmakers: [
        {
          key: 'superbet',
          title: 'Superbet',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Legia Warszawa', price: 2.30 },
              { name: 'Draw', price: 3.40 },
              { name: 'Lech Poznań', price: 3.10 },
            ],
          }],
        },
        {
          key: 'betclic',
          title: 'Betclic',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Legia Warszawa', price: 2.10 },
              { name: 'Draw', price: 3.70 },
              { name: 'Lech Poznań', price: 3.20 },
            ],
          }],
        },
        {
          key: 'lvbet',
          title: 'LVBet',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Legia Warszawa', price: 2.15 },
              { name: 'Draw', price: 3.35 },
              { name: 'Lech Poznań', price: 3.65 },
            ],
          }],
        },
        {
          key: 'sts',
          title: 'STS',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Legia Warszawa', price: 2.20 },
              { name: 'Draw', price: 3.45 },
              { name: 'Lech Poznań', price: 3.25 },
            ],
          }],
        },
      ],
    },

    // STRONG ARBITRAGE - MMA / KSW (2-way)
    {
      id: 'demo-pl-002',
      sport_key: 'mma_mixed_martial_arts',
      sport_title: 'KSW',
      commence_time: dayAfter.toISOString(),
      home_team: 'Mamed Khalidov',
      away_team: 'Mariusz Pudzianowski',
      bookmakers: [
        {
          key: 'sts',
          title: 'STS',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Mamed Khalidov', price: 2.25 },
              { name: 'Mariusz Pudzianowski', price: 1.65 },
            ],
          }],
        },
        {
          key: 'fortuna',
          title: 'Fortuna',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Mamed Khalidov', price: 1.85 },
              { name: 'Mariusz Pudzianowski', price: 1.95 },
            ],
          }],
        },
        {
          key: 'forbet',
          title: 'forBET',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Mamed Khalidov', price: 1.90 },
              { name: 'Mariusz Pudzianowski', price: 1.88 },
            ],
          }],
        },
      ],
    },

    // ARBITRAGE OPPORTUNITY - PlusLiga Volleyball
    {
      id: 'demo-pl-003',
      sport_key: 'volleyball_poland_plusliga',
      sport_title: 'PlusLiga',
      commence_time: tomorrow.toISOString(),
      home_team: 'Jastrzębski Węgiel',
      away_team: 'ZAKSA Kędzierzyn-Koźle',
      bookmakers: [
        {
          key: 'etoto',
          title: 'ETOTO',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Jastrzębski Węgiel', price: 2.10 },
              { name: 'ZAKSA Kędzierzyn-Koźle', price: 1.70 },
            ],
          }],
        },
        {
          key: 'totalbet',
          title: 'TOTALbet',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Jastrzębski Węgiel', price: 1.75 },
              { name: 'ZAKSA Kędzierzyn-Koźle', price: 2.15 },
            ],
          }],
        },
        {
          key: 'betfan',
          title: 'Betfan',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Jastrzębski Węgiel', price: 1.85 },
              { name: 'ZAKSA Kędzierzyn-Koźle', price: 1.90 },
            ],
          }],
        },
      ],
    },

    // ARBITRAGE OPPORTUNITY - 1 Liga
    {
      id: 'demo-pl-004',
      sport_key: 'soccer_poland_1_liga',
      sport_title: '1. Liga',
      commence_time: tomorrow.toISOString(),
      home_team: 'Wisła Kraków',
      away_team: 'Arka Gdynia',
      bookmakers: [
        {
          key: 'fuksiarz',
          title: 'Fuksiarz',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Wisła Kraków', price: 2.45 },
              { name: 'Draw', price: 3.30 },
              { name: 'Arka Gdynia', price: 2.80 },
            ],
          }],
        },
        {
          key: 'superbet',
          title: 'Superbet',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Wisła Kraków', price: 2.15 },
              { name: 'Draw', price: 3.65 },
              { name: 'Arka Gdynia', price: 3.10 },
            ],
          }],
        },
        {
          key: 'sts',
          title: 'STS',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Wisła Kraków', price: 2.25 },
              { name: 'Draw', price: 3.40 },
              { name: 'Arka Gdynia', price: 3.45 },
            ],
          }],
        },
      ],
    },

    // PRE-SUREBET - Ekstraklasa (Close to arbitrage)
    {
      id: 'demo-pl-005',
      sport_key: 'soccer_poland_ekstraklasa',
      sport_title: 'Ekstraklasa',
      commence_time: dayAfter.toISOString(),
      home_team: 'Śląsk Wrocław',
      away_team: 'Jagiellonia Białystok',
      bookmakers: [
        {
          key: 'fortuna',
          title: 'Fortuna',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Śląsk Wrocław', price: 2.65 },
              { name: 'Draw', price: 3.30 },
              { name: 'Jagiellonia Białystok', price: 2.65 },
            ],
          }],
        },
        {
          key: 'betclic',
          title: 'Betclic',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Śląsk Wrocław', price: 2.50 },
              { name: 'Draw', price: 3.45 },
              { name: 'Jagiellonia Białystok', price: 2.70 },
            ],
          }],
        },
        {
          key: 'sts',
          title: 'STS',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Śląsk Wrocław', price: 2.55 },
              { name: 'Draw', price: 3.35 },
              { name: 'Jagiellonia Białystok', price: 2.80 },
            ],
          }],
        },
      ],
    },

    // LIVE OPPORTUNITY - Ekstraklasa
    {
      id: 'demo-pl-006',
      sport_key: 'soccer_poland_ekstraklasa',
      sport_title: 'Ekstraklasa (LIVE)',
      commence_time: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      home_team: 'Raków Częstochowa',
      away_team: 'Widzew Łódź',
      bookmakers: [
        {
          key: 'sts',
          title: 'STS',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Raków Częstochowa', price: 1.55 },
              { name: 'Draw', price: 4.10 },
              { name: 'Widzew Łódź', price: 6.50 },
            ],
          }],
        },
        {
          key: 'superbet',
          title: 'Superbet',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Raków Częstochowa', price: 1.62 },
              { name: 'Draw', price: 3.90 },
              { name: 'Widzew Łódź', price: 5.80 },
            ],
          }],
        },
        {
          key: 'lvbet',
          title: 'LVBet',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Raków Częstochowa', price: 1.48 },
              { name: 'Draw', price: 4.35 },
              { name: 'Widzew Łódź', price: 6.80 },
            ],
          }],
        },
      ],
    },

    // ARBITRAGE - Ekstraliga Speedway
    {
      id: 'demo-pl-007',
      sport_key: 'speedway_ekstraliga',
      sport_title: 'Ekstraliga Żużlowa',
      commence_time: tomorrow.toISOString(),
      home_team: 'Motor Lublin',
      away_team: 'Sparta Wrocław',
      bookmakers: [
        {
          key: 'forbet',
          title: 'forBET',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Motor Lublin', price: 1.45 },
              { name: 'Draw', price: 15.0 },
              { name: 'Sparta Wrocław', price: 3.40 },
            ],
          }],
        },
        {
          key: 'betfan',
          title: 'Betfan',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Motor Lublin', price: 1.65 },
              { name: 'Draw', price: 14.0 },
              { name: 'Sparta Wrocław', price: 2.80 },
            ],
          }],
        },
        {
          key: 'pzbuk',
          title: 'PZBuk',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Motor Lublin', price: 1.50 },
              { name: 'Draw', price: 18.0 },
              { name: 'Sparta Wrocław', price: 3.10 },
            ],
          }],
        },
      ],
    },
    
    // NORMAL ODDS - Fame MMA
    {
      id: 'demo-pl-008',
      sport_key: 'mma_mixed_martial_arts',
      sport_title: 'FAME MMA',
      commence_time: tomorrow.toISOString(),
      home_team: 'Michał Boxdel Baron',
      away_team: 'Kasjusz Don Kasjo Życiński',
      bookmakers: [
        {
          key: 'betclic',
          title: 'Betclic',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Michał Boxdel Baron', price: 2.15 },
              { name: 'Kasjusz Don Kasjo Życiński', price: 1.65 },
            ],
          }],
        },
        {
          key: 'fortuna',
          title: 'Fortuna',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Michał Boxdel Baron', price: 2.05 },
              { name: 'Kasjusz Don Kasjo Życiński', price: 1.70 },
            ],
          }],
        },
      ],
    },
    {
      id: 'demo-wc-001',
      sport_key: 'soccer_fifa_world_cup',
      sport_title: 'Mistrzostwa Świata 2026',
      commence_time: tomorrow.toISOString(),
      home_team: 'Brazylia',
      away_team: 'Szkocja',
      bookmakers: [
        {
          key: 'sts',
          title: 'STS',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Brazylia', price: 1.45 },
              { name: 'Draw', price: 4.80 },
              { name: 'Szkocja', price: 7.20 },
            ],
          }],
        },
        {
          key: 'superbet',
          title: 'Superbet',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Brazylia', price: 1.48 },
              { name: 'Draw', price: 4.60 },
              { name: 'Szkocja', price: 7.50 },
            ],
          }],
        },
      ],
    },
    {
      id: 'demo-wc-002',
      sport_key: 'soccer_fifa_world_cup',
      sport_title: 'Mistrzostwa Świata 2026',
      commence_time: dayAfter.toISOString(),
      home_team: 'Niemcy',
      away_team: 'Ekwador',
      bookmakers: [
        {
          key: 'fortuna',
          title: 'Fortuna',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Niemcy', price: 1.65 },
              { name: 'Draw', price: 4.00 },
              { name: 'Ekwador', price: 5.50 },
            ],
          }],
        },
        {
          key: 'betclic',
          title: 'Betclic',
          last_update: now.toISOString(),
          markets: [{
            key: 'h2h',
            last_update: now.toISOString(),
            outcomes: [
              { name: 'Niemcy', price: 1.62 },
              { name: 'Draw', price: 4.20 },
              { name: 'Ekwador', price: 5.20 },
            ],
          }],
        },
      ],
    },
  ];
}
