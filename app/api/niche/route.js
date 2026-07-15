import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { llm, parseJson } from '@/lib/fal';

export async function POST(req) {
  try {
    const user = await requireUser(req);
    const { mode, form } = await req.json();

    let profile;
    if (mode === 'express') {
      profile = {
        niche: form.niche,
        audience: form.audience || '',
        pillars: (form.pillars || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 5),
        tone: form.tone || 'santai & mesra',
      };
      if (!profile.pillars.length) profile.pillars = ['Tips', 'Cerita peribadi', 'Promosi lembut'];
    } else {
      const sys = 'You are a Malaysian content strategist. Reply in Manglish (natural BM+English mix). Output ONLY valid JSON, no markdown.';
      const prompt = `Berdasarkan biodata ini, bina profil niche untuk content creator:
Bidang/kerja: ${form.field}
Siapa yang dia bantu: ${form.helps}
Masalah yang dia solve: ${form.problem}
Personaliti: ${form.personality}
Platform utama: ${form.platform}

Output JSON dengan struktur TEPAT ini:
{"niche": "satu ayat niche statement dalam Manglish", "audience": "describe target audience ringkas", "pillars": ["pillar 1","pillar 2","pillar 3","pillar 4"], "tone": "3-4 perkataan describe tone dia"}`;
      const out = await llm(sys, prompt);
      profile = parseJson(out);
    }

    await sql`UPDATE users SET profile = ${JSON.stringify(profile)} WHERE id = ${user.id}`;
    return Response.json({ profile });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
