import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const payload = await req.json();
  const url = process.env.N8N_WEBHOOK_URL;

  if (!url) {
    return NextResponse.json(
      { ok: false, error: 'N8N_WEBHOOK_URL nie jest skonfigurowany' },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const text = await res.text();
    console.log(`[N8N Webhook] ${res.status}: ${text}`);
    
    return NextResponse.json(
      { ok: res.ok, status: res.status },
      { status: res.status }
    );
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error('[N8N Webhook] Error:', error);
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
}
