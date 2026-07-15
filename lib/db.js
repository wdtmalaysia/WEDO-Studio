import { neon } from '@neondatabase/serverless';

// Lazy connection — hanya connect masa request, bukan masa build.
// Ini elakkan error "No database connection string" semasa deploy.
let _client = null;
function getClient() {
  if (!_client) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL belum di-set. Tambah Neon Postgres dalam Vercel → Storage.');
    }
    _client = neon(process.env.DATABASE_URL);
  }
  return _client;
}

// Kekalkan cara guna sama: sql`SELECT ...`
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
