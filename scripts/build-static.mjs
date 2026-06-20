// Buduje statyczną wersję strony do folderu `out/` (na zwykły hosting/domenę).
//
// Statyczny eksport nie wspiera force-dynamic, API routes ani odświeżania
// danych, więc na czas builda: zdejmujemy `force-dynamic` ze stron, dodajemy
// generateStaticParams dla /events/[id] i chowamy src/app/api. Po buildzie
// wszystko wraca do stanu wyjściowego (także gdy build się wywali).
//
// Użycie: npm run build:static   →   wrzuć ZAWARTOŚĆ folderu out/ na hosting.

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();

const PAGES_WITH_FORCE_DYNAMIC = [
  'src/app/page.tsx',
  'src/app/events/page.tsx',
  'src/app/arbitrage/page.tsx',
  'src/app/margins/page.tsx',
  'src/app/events/[id]/page.tsx',
];

const STATIC_PARAMS_BLOCK = `
// [build-static] doklejone na czas eksportu — generuje strony wszystkich meczów
import { getAllEvents as __getAllEvents } from "@/lib/data-service";
export const dynamicParams = false;
export async function generateStaticParams() {
  const events = await __getAllEvents();
  return events.map((e) => ({ id: e.id }));
}
`;

// Route Handlers can't be statically exported unless they opt into
// force-static — easier to just hide them from the build like the API dir.
// `src/app/auth/callback` stays in the export: it's now a client page that
// exchanges the OAuth code in the browser, so it works without a server.
const ROUTE_DIRS_TO_HIDE = [
  { dir: path.join(root, 'src', 'app', 'api'), backup: path.join(root, '.static-api-backup') },
];
const fileBackups = new Map();

function patch() {
  for (const rel of PAGES_WITH_FORCE_DYNAMIC) {
    const file = path.join(root, rel);
    const original = fs.readFileSync(file, 'utf-8');
    fileBackups.set(file, original);

    let patched = original.replace(/export const dynamic = "force-dynamic";\r?\n/g, '');
    if (rel.includes('[id]')) patched += STATIC_PARAMS_BLOCK;
    fs.writeFileSync(file, patched, 'utf-8');
  }
  for (const { dir, backup } of ROUTE_DIRS_TO_HIDE) {
    if (fs.existsSync(dir)) fs.renameSync(dir, backup);
  }

  // Stale generated route types still reference the hidden folders —
  // drop them, Next regenerates them on the next dev/build run.
  for (const rel of ['.next/types/validator.ts', '.next/dev/types/validator.ts']) {
    const file = path.join(root, rel);
    if (fs.existsSync(file)) fs.rmSync(file, { force: true });
  }
}

function restore() {
  for (const [file, content] of fileBackups) fs.writeFileSync(file, content, 'utf-8');
  for (const { dir, backup } of ROUTE_DIRS_TO_HIDE) {
    if (fs.existsSync(backup)) {
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
      fs.renameSync(backup, dir);
    }
  }
}

let status = 1;
try {
  patch();
  console.log('[build-static] Pliki przygotowane, buduję eksport...');
  const res = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, STATIC_EXPORT: '1', NEXT_PUBLIC_STATIC_EXPORT: '1' },
  });
  status = res.status ?? 1;
} finally {
  restore();
  console.log('[build-static] Pliki źródłowe przywrócone.');
}

if (status === 0) {
  console.log('\n✓ Gotowe! Wrzuć ZAWARTOŚĆ folderu out/ na hosting (np. przez FTP do public_html).');
  console.log('  Uwaga: wersja statyczna to zamrożony snapshot danych z momentu builda.');
} else {
  console.error('\n✗ Build statyczny nie powiódł się.');
}
process.exit(status);
