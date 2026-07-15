import { sql } from '@/lib/db';

export async function POST(req) {
  const { code } = await req.json();
  const rows = await sql`SELECT id, code, name, role, credits, profile FROM users WHERE code = ${code} LIMIT 1`;
  if (!rows.length) return Response.json({ error: 'Kod akses tak dijumpai. Semak semula ya.' }, { status: 401 });
  return Response.json({ user: rows[0] });
}
