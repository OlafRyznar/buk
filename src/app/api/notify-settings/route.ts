import { NextResponse } from 'next/server';
import { readNotifySettings, writeNotifySettings, NotifySettings } from '@/lib/notify-store';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return NextResponse.json({ ...readNotifySettings(), email: user?.email ?? '' });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ success: false, message: 'Musisz być zalogowany.' }, { status: 401 });
  }

  const body = await req.json();
  // Alerts always go to the currently logged-in account — the client can't
  // redirect them to an arbitrary address.
  const settings: NotifySettings = {
    email: user.email,
    enabled: Boolean(body.enabled),
    minutesBefore: Number(body.minutesBefore) > 0 ? Number(body.minutesBefore) : 30,
  };
  writeNotifySettings(settings);
  return NextResponse.json({ success: true, settings });
}
