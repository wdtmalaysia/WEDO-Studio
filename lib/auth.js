import { sql } from './db';

// Simple access-code auth: client sends code in x-access-code header.
export async function getUser(req) {
  const code = req.headers.get('x-access-code');
  if (!code) return null;
  const rows = await sql`SELECT * FROM users WHERE code = ${code} LIMIT 1`;
  return rows[0] || null;
}

export async function requireUser(req) {
  const u = await getUser(req);
  if (!u) throw Object.assign(new Error('Sila log masuk semula.'), { status: 401 });
  return u;
}

export async function requireAdmin(req) {
  const u = await requireUser(req);
  if (u.role !== 'admin') throw Object.assign(new Error('Admin sahaja.'), { status: 403 });
  return u;
}

export function genCode(name) {
  const base = (name || 'wedo').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'wedo';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}`;
}
