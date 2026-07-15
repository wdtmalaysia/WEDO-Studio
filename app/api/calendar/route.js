import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { llm, parseJson } from '@/lib/fal';

export async function GET(req) {
  try {
    const user = await requireUser(req);
    const rows = await sql`SELECT days, created_at FROM plans WHERE user_id = ${user.id} ORDER BY id DESC LIMIT 1`;
    return Response.json({ plan: rows[0] || null });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(req) {
  try {
    const user = await requireUser(req);
    const { insights } = await req.json().catch(() => ({}));
    const profile = user.profile;
    if (!profile) return Response.json({ error: 'Siapkan niche di tab Setup dulu ya.' }, { status: 400 });

    const sys = 'You are a Malaysian social media strategist. Write in natural Manglish (BM+English mix, warm, friend energy — bukan guru energy). Output ONLY valid JSON array, no markdown.';
    const prompt = `Bina content calendar 7 hari untuk creator ini:
Niche: ${profile.niche}
Audience: ${profile.audience}
Content pillars: ${(profile.pillars || []).join(', ')}
Tone: ${profile.tone}
${insights ? `\nInsight dari analisis Instagram dia (guna untuk improve plan):\n${insights}` : ''}

Setiap hari perlu ada: pillar (pilih dari pillars di atas), format (poster/quote/carousel idea/reel idea), hook (tajuk menarik dalam Manglish), caption (draf caption pendek 3-6 baris dalam Manglish, warm & relatable), image_prompt (prompt English untuk AI image generator — describe scene, lighting, mood, photorealistic, SESUAI dengan niche dia).

Output JSON array TEPAT 7 items:
[{"day":"Isnin","pillar":"...","format":"...","hook":"...","caption":"...","image_prompt":"..."}]`;
    const out = await llm(sys, prompt);
    const days = parseJson(out);

    await sql`INSERT INTO plans (user_id, days) VALUES (${user.id}, ${JSON.stringify(days)})`;
    return Response.json({ plan: { days } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
