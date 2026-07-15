import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req) {
  try {
    await requireAdmin(req);
    const { userId, delta, reason } = await req.json();
    await sql`UPDATE users SET credits = credits + ${delta} WHERE id = ${userId}`;
    await sql`INSERT INTO ledger (user_id, delta, reason) VALUES (${userId}, ${delta}, ${reason || 'admin adjust'})`;
    const rows = await sql`SELECT credits FROM users WHERE id = ${userId}`;
    return Response.json({ credits: rows[0].credits });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
