// Mapping of Polish national-team names (as scraped from bookmakers) to
// ISO 3166-1 alpha-2 codes used by flagcdn.com. Club teams are not listed,
// so getFlagCode returns null for them and no flag is rendered.

const TOKEN_ALIASES: Record<string, string> = {
  pld: 'poludniowa',
  pln: 'polnocna',
};

const NAME_ALIASES: Record<string, string> = {
  usa: 'stany zjednoczone',
  zea: 'zjednoczone emiraty arabskie',
  wks: 'wybrzeze kosci sloniowej',
  bosnia: 'bosnia i hercegowina',
  'republika poludniowej afryki': 'rpa',
};

function normalizeCountry(name: string): string {
  let norm = name
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\(k\)|\(m\)|u\d{2}/g, '') // (K) women's tag, U21 etc.
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  norm = norm
    .split(' ')
    .map((token) => TOKEN_ALIASES[token] || token)
    .join(' ');

  return NAME_ALIASES[norm] || norm;
}

const COUNTRY_CODES: Record<string, string> = {
  meksyk: 'mx', kanada: 'ca', 'stany zjednoczone': 'us', argentyna: 'ar',
  brazylia: 'br', urugwaj: 'uy', kolumbia: 'co', ekwador: 'ec', paragwaj: 'py',
  chile: 'cl', peru: 'pe', boliwia: 'bo', wenezuela: 've',
  anglia: 'gb-eng', szkocja: 'gb-sct', walia: 'gb-wls', irlandia: 'ie',
  'irlandia polnocna': 'gb-nir', francja: 'fr', niemcy: 'de', hiszpania: 'es',
  portugalia: 'pt', wlochy: 'it', holandia: 'nl', belgia: 'be', chorwacja: 'hr',
  serbia: 'rs', 'bosnia i hercegowina': 'ba', szwajcaria: 'ch', austria: 'at',
  polska: 'pl', czechy: 'cz', slowacja: 'sk', slowenia: 'si', wegry: 'hu',
  rumunia: 'ro', bulgaria: 'bg', grecja: 'gr', turcja: 'tr', ukraina: 'ua',
  dania: 'dk', szwecja: 'se', norwegia: 'no', finlandia: 'fi', islandia: 'is',
  albania: 'al', 'macedonia polnocna': 'mk', czarnogora: 'me', kosowo: 'xk',
  gruzja: 'ge', armenia: 'am', azerbejdzan: 'az', kazachstan: 'kz',
  japonia: 'jp', 'korea poludniowa': 'kr', 'korea polnocna': 'kp', chiny: 'cn',
  australia: 'au', 'nowa zelandia': 'nz', iran: 'ir', irak: 'iq',
  'arabia saudyjska': 'sa', katar: 'qa', 'zjednoczone emiraty arabskie': 'ae',
  jordania: 'jo', uzbekistan: 'uz', indonezja: 'id', tajlandia: 'th',
  wietnam: 'vn', indie: 'in', maroko: 'ma', algieria: 'dz', tunezja: 'tn',
  egipt: 'eg', libia: 'ly', senegal: 'sn', nigeria: 'ng', ghana: 'gh',
  kamerun: 'cm', mali: 'ml', 'burkina faso': 'bf', rpa: 'za',
  'demokratyczna republika konga': 'cd', 'dr konga': 'cd', kongo: 'cg',
  zambia: 'zm', zimbabwe: 'zw', angola: 'ao', mozambik: 'mz', gabon: 'ga',
  gwinea: 'gn', tanzania: 'tz', uganda: 'ug', kenia: 'ke', etiopia: 'et',
  'wyspy zielonego przyladka': 'cv', 'republika zielonego przyladka': 'cv',
  kostaryka: 'cr', panama: 'pa', honduras: 'hn', gwatemala: 'gt',
  salwador: 'sv', jamajka: 'jm', haiti: 'ht', 'trynidad i tobago': 'tt',
  kuba: 'cu', curacao: 'cw', surinam: 'sr', 'wybrzeze kosci sloniowej': 'ci',
};

/** ISO code for a national team name, or null when it's not a country. */
export function getFlagCode(teamName: string): string | null {
  return COUNTRY_CODES[normalizeCountry(teamName)] ?? null;
}

export function getFlagUrl(code: string, width: 40 | 80 = 40): string {
  return `https://flagcdn.com/w${width}/${code}.png`;
}
