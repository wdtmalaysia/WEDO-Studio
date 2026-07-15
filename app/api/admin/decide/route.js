import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req) {
  try {
    await requireAdmin(req);
    const { topupId, action } = await req.json(); // 'approve' | 'reject'
    const rows = await sql`SELECT * FROM topups WHERE id = ${topupId} AND status = 'pending'`;
    if (!rows.length) return Response.json({ error: 'Topup ni dah diproses.' }, { status: 400 });
    const t = rows[0];
    if (action === 'approve') {
      await sql`UPDATE users SET credits = credits + ${t.nc} WHERE id = ${t.user_id}`;
      await sql`INSERT INTO ledger (user_id, delta, reason) VALUES (${t.user_id}, ${t.nc}, ${'topup:' + t.package})`;
      await sql`UPDATE topups SET status = 'approved' WHERE id = ${topupId}`;
    } else {
      await sql`UPDATE topups SET status = 'rejected' WHERE id = ${topupId}`;
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
