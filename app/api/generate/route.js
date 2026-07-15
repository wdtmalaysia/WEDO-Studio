import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { generateImage } from '@/lib/fal';
import { IMAGE_MODELS } from '@/lib/pricing';

export async function POST(req) {
  try {
    const user = await requireUser(req);
    const { model, prompt, ratio, face } = await req.json();
    const m = IMAGE_MODELS.find(x => x.id === model);
    if (!m) return Response.json({ error: 'Model tak sah.' }, { status: 400 });
    if (!prompt?.trim()) return Response.json({ error: 'Tulis prompt dulu ya.' }, { status: 400 });
    if (user.credits < m.nc) return Response.json({ error: `NC tak cukup — perlukan ${m.nc} NC. Top up dulu ya.` }, { status: 402 });

    const url = await generateImage(model, prompt, ratio, face);

    // Deduct selepas berjaya sahaja — kalau fal fail, NC selamat.
    await sql`UPDATE users SET credits = credits - ${m.nc} WHERE id = ${user.id}`;
    await sql`INSERT INTO ledger (user_id, delta, reason) VALUES (${user.id}, ${-m.nc}, ${'generate:' + model})`;
    await sql`INSERT INTO generations (user_id, model, prompt, image_url, nc_cost) VALUES (${user.id}, ${model}, ${prompt}, ${url}, ${m.nc})`;

    const rows = await sql`SELECT credits FROM users WHERE id = ${user.id}`;
    return Response.json({ url, credits: rows[0].credits });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
