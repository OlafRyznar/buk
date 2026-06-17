import { NextResponse } from 'next/server';
import { readEventAlerts, addEventAlert, removeEventAlert, EventAlertType } from '@/lib/event-alerts';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const eventId = new URL(req.url).searchParams.get('eventId');
  const alerts = readEventAlerts();
  return NextResponse.json(eventId ? alerts.filter(a => a.eventId === eventId) : alerts);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ?? '';
  if (!email) {
    return NextResponse.json({ success: false, message: 'Musisz być zalogowany.' }, { status: 401 });
  }

  const body = await req.json();

  const type: EventAlertType = body.type;
  if (!body.eventId || !type) {
    return NextResponse.json({ success: false, message: 'Brak wymaganych danych.' }, { status: 400 });
  }

  if (type === 'before-kickoff' && !(Number(body.minutesBefore) > 0)) {
    return NextResponse.json({ success: false, message: 'Podaj liczbę minut.' }, { status: 400 });
  }
  if (type === 'at-time' && !body.atTime) {
    return NextResponse.json({ success: false, message: 'Podaj godzinę.' }, { status: 400 });
  }
  if (type === 'odds-threshold' && (!body.outcomeName || !(Number(body.thresholdPrice) > 1))) {
    return NextResponse.json({ success: false, message: 'Wybierz wynik i podaj kurs.' }, { status: 400 });
  }

  const alert = addEventAlert({
    eventId: body.eventId,
    eventName: body.eventName || '',
    sportTitle: body.sportTitle || '',
    email,
    type,
    minutesBefore: type === 'before-kickoff' ? Number(body.minutesBefore) : undefined,
    atTime: type === 'at-time' ? new Date(body.atTime).toISOString() : undefined,
    outcomeName: type === 'odds-threshold' ? body.outcomeName : undefined,
    thresholdPrice: type === 'odds-threshold' ? Number(body.thresholdPrice) : undefined,
  });

  return NextResponse.json({ success: true, alert });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ success: false }, { status: 400 });
  removeEventAlert(id);
  return NextResponse.json({ success: true });
}
