import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { TOPUP_PACKAGES } from '@/lib/pricing';

export async function GET(req) {
  try {
    const user = await requireUser(req);
    const rows = await sql`SELECT id, package, amount_rm, nc, status, created_at FROM topups WHERE user_id = ${user.id} ORDER BY id DESC LIMIT 10`;
    const qr = await sql`SELECT value FROM settings WHERE key = 'qr_image'`;
    const bank = await sql`SELECT value FROM settings WHERE key = 'bank_label'`;
    return Response.json({ topups: rows, qr: qr[0]?.value || null, bank: bank[0]?.value || '' });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(req) {
  try {
    const user = await requireUser(req);
    const { packageId, receipt } = await req.json();
    const pkg = TOPUP_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return Response.json({ error: 'Pakej tak sah.' }, { status: 400 });
    if (!receipt) return Response.json({ error: 'Upload resit dulu ya.' }, { status: 400 });
    await sql`INSERT INTO topups (user_id, package, amount_rm, nc, receipt) VALUES (${user.id}, ${pkg.id}, ${pkg.rm}, ${pkg.nc}, ${receipt})`;
    return Response.json({ ok: true, message: 'Resit dihantar! NC akan masuk selepas coach sahkan pembayaran.' });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
