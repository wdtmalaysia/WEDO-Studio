import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req) {
  try {
    await requireAdmin(req);
    const { key, value } = await req.json();
    if (!['qr_image', 'bank_label'].includes(key)) return Response.json({ error: 'Setting tak dikenali.' }, { status: 400 });
    await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = ${value}`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
