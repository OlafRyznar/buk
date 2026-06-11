import { NextResponse } from 'next/server';
import { runScraper } from '@/lib/scraper';
import fs from 'fs';
import path from 'path';

let isSyncing = false;
let lastSyncTime: number | null = null;
let lastSyncCount: number = 0;

export async function POST() {
  if (isSyncing) {
    return NextResponse.json(
      { success: false, message: 'Synchronizacja jest już w toku.' },
      { status: 429 }
    );
  }

  isSyncing = true;

  try {
    const events = await runScraper();
    
    // Write results to src/lib/scraped-data.json
    const filePath = path.join(process.cwd(), 'src', 'lib', 'scraped-data.json');
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2), 'utf-8');
    
    lastSyncTime = Date.now();
    lastSyncCount = events.length;

    return NextResponse.json({
      success: true,
      count: events.length,
      timestamp: lastSyncTime
    });
  } catch (error) {
    console.error('Error during synchronization API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Wystąpił błąd podczas synchronizacji.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  } finally {
    isSyncing = false;
  }
}

export async function GET() {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'scraped-data.json');
  let exists = false;
  let fileTime: number | null = null;
  let fileCount = 0;

  try {
    if (fs.existsSync(filePath)) {
      exists = true;
      const stats = fs.statSync(filePath);
      fileTime = stats.mtimeMs;
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      fileCount = Array.isArray(data) ? data.length : 0;
    }
  } catch (e) {
    console.error('Error reading sync status:', e);
  }

  return NextResponse.json({
    isSyncing,
    lastSyncTime: lastSyncTime || fileTime,
    lastSyncCount: lastSyncCount || fileCount,
    hasData: exists
  });
}
