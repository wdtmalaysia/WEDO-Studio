import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req) {
  try {
    await requireAdmin(req);
    const rows = await sql`SELECT t.id, t.package, t.amount_rm, t.nc, t.receipt, t.status, t.created_at, u.name, u.id AS user_id
      FROM topups t JOIN users u ON u.id = t.user_id ORDER BY t.id DESC LIMIT 50`;
    return Response.json({ topups: rows });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
