import { requireUser } from '@/lib/auth';
import { llm, llmVision } from '@/lib/fal';

export async function POST(req) {
  try {
    const user = await requireUser(req);
    const { images } = await req.json(); // array of data URLs (max 3, compressed client-side)
    if (!images?.length) return Response.json({ error: 'Upload screenshot IG dulu ya.' }, { status: 400 });
    const profile = user.profile || {};

    const visionSys = 'You analyze Instagram screenshots for a Malaysian content creator. Be specific and factual about what you see: post topics, formats, engagement numbers if visible, posting patterns.';
    const notes = [];
    for (const img of images.slice(0, 3)) {
      const note = await llmVision(visionSys, 'Describe apa yang you nampak dalam screenshot Instagram ini: jenis content, topik, format, engagement (likes/comments kalau nampak), dan pattern yang menarik.', img);
      notes.push(note);
    }

    const sys = 'You are a Malaysian social media strategist. Write in warm natural Manglish (BM+English), friend energy. Be honest but encouraging.';
    const prompt = `Creator ini punya niche: ${profile.niche || 'belum set'}. Pillars: ${(profile.pillars || []).join(', ') || '-'}.

Nota dari screenshot Instagram dia:
${notes.map((n, i) => `--- Screenshot ${i + 1} ---\n${n}`).join('\n')}

Bagi analisis dalam format ini (guna heading biasa, BUKAN JSON):
1. Apa yang jalan (2-3 poin — content mana perform & kenapa)
2. Apa yang kurang (2-3 poin — gap atau pattern lemah)
3. Cadangan untuk calendar minggu depan (3-4 poin spesifik — topik/format yang patut ditambah)`;
    const analysis = await llm(sys, prompt);

    return Response.json({ analysis });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
