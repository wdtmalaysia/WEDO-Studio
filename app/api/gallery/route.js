import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await requireUser(req);
    const rows = await sql`SELECT id, model, prompt, image_url, nc_cost, created_at FROM generations WHERE user_id = ${user.id} ORDER BY id DESC LIMIT 40`;
    return Response.json({ items: rows });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
