import { neon } from '@neondatabase/serverless';

// Lazy connection + cuba beberapa nama env var yang biasa digunakan
// oleh integrasi Neon/Vercel.
let _client = null;
function getClient() {
  if (!_client) {
    const url =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.NEON_DATABASE_URL ||
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.POSTGRES_URL_NON_POOLING;
    if (!url) {
      throw new Error(
        'Tiada connection string database. Semak Vercel → Settings → Environment Variables — patut ada DATABASE_URL atau POSTGRES_URL selepas sambung Neon. Lepas tambah, redeploy.'
      );
    }
    _client = neon(url);
  }
  return _client;
}

export function sql(strings, ...values) {
  return getClient()(strings, ...values);
}

export async function initDb() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    credits INT NOT NULL DEFAULT 0,
    profile JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS topups (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    package TEXT, amount_rm INT, nc INT,
    receipt TEXT, status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS generations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    model TEXT, prompt TEXT, image_url TEXT, nc_cost INT,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    days JSONB, created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS ledger (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    delta INT, reason TEXT, created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY, value TEXT
  )`;
}
