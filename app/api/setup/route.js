import { sql, initDb } from '@/lib/db';

// Run SEKALI selepas deploy: /api/setup?admin=ADMIN_CODE_ANDA
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    if (!process.env.ADMIN_CODE) {
      return Response.json({ error: 'ADMIN_CODE belum di-set dalam Vercel → Settings → Environment Variables. Tambah dulu, kemudian redeploy.' }, { status: 500 });
    }
    if (searchParams.get('admin') !== process.env.ADMIN_CODE) {
      return Response.json({ error: 'Kod admin salah — tak sama dengan ADMIN_CODE dalam Vercel.' }, { status: 403 });
    }
    await initDb();
    const existing = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
    if (!existing.length) {
      await sql`INSERT INTO users (code, name, role, credits) VALUES (${process.env.ADMIN_CODE}, 'Coach Fadhlina', 'admin', 999999)`;
    }
    return Response.json({ ok: true, message: 'Database siap! Balik ke halaman utama dan log masuk dengan ADMIN_CODE anda.' });
  } catch (e) {
    // Tunjuk sebab sebenar supaya senang troubleshoot
    return Response.json({ error: e.message }, { status: 500 });
  }
}
