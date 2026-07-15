import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req) {
  try {
    await requireAdmin(req);
    const members = await sql`SELECT COUNT(*)::int AS c FROM users WHERE role = 'member'`;
    const used = await sql`SELECT COALESCE(SUM(nc_cost),0)::int AS c FROM generations`;
    const owed = await sql`SELECT COALESCE(SUM(credits),0)::int AS c FROM users WHERE role = 'member'`;
    const pending = await sql`SELECT COUNT(*)::int AS c FROM topups WHERE status = 'pending'`;
    return Response.json({ members: members[0].c, ncUsed: used[0].c, ncOwed: owed[0].c, pendingTopups: pending[0].c });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
