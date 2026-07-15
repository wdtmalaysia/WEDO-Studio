import { sql, initDb } from '@/lib/db';

// Run SEKALI selepas deploy: /api/setup?admin=ADMIN_CODE_ANDA
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('admin') !== process.env.ADMIN_CODE) {
    return Response.json({ error: 'Kod admin salah' }, { status: 403 });
  }
  await initDb();
  const existing = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
  if (!existing.length) {
    await sql`INSERT INTO users (code, name, role, credits) VALUES (${process.env.ADMIN_CODE}, 'Coach Fadhlina', 'admin', 999999)`;
  }
  return Response.json({ ok: true, message: 'Database siap. Log masuk dengan ADMIN_CODE anda.' });
}
