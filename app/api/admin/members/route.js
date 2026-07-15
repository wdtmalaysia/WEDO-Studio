import { sql } from '@/lib/db';
import { requireAdmin, genCode } from '@/lib/auth';

export async function GET(req) {
  try {
    await requireAdmin(req);
    const rows = await sql`SELECT id, code, name, role, credits, created_at FROM users ORDER BY id`;
    return Response.json({ members: rows });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(req) {
  try {
    await requireAdmin(req);
    const { name } = await req.json();
    if (!name?.trim()) return Response.json({ error: 'Isi nama member dulu.' }, { status: 400 });
    const code = genCode(name);
    const rows = await sql`INSERT INTO users (code, name) VALUES (${code}, ${name.trim()}) RETURNING id, code, name, credits`;
    return Response.json({ member: rows[0] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
