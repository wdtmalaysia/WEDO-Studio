// ===== fal.ai integration =====
// NOTA PENTING: model IDs di bawah ikut pengetahuan semasa build.
// Sila verify di https://fal.ai/models sebelum production — kalau ID berubah,
// tukar DI SINI SAHAJA, semua tempat lain akan ikut.

const FAL_KEY = process.env.FAL_KEY;

export const FAL_IMAGE_MODELS = {
  'nano-banana':     { endpoint: 'fal-ai/nano-banana' },
  'nano-banana-pro': { endpoint: 'fal-ai/nano-banana-pro' },
  'seedream':        { endpoint: 'fal-ai/bytedance/seedream/v4/text-to-image' },
};

// LLM untuk niche/calendar/analyzer — guna any-llm supaya satu API key sahaja.
const LLM_ENDPOINT = 'fal-ai/any-llm';
const LLM_MODEL = 'google/gemini-flash-1.5';
const VISION_ENDPOINT = 'fal-ai/any-llm/vision';

async function falRun(endpoint, body) {
  const res = await fetch(`https://fal.run/${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`fal ${endpoint} failed (${res.status}): ${t.slice(0, 300)}`);
  }
  return res.json();
}

const RATIO_TO_SIZE = {
  '4:5':  { width: 1024, height: 1280 },
  '1:1':  { width: 1024, height: 1024 },
  '9:16': { width: 768,  height: 1365 },
  '16:9': { width: 1365, height: 768 },
};

export async function generateImage(modelId, prompt, ratio, faceDataUrl) {
  const model = FAL_IMAGE_MODELS[modelId];
  if (!model) throw new Error('Model tak dikenali');
  const size = RATIO_TO_SIZE[ratio] || RATIO_TO_SIZE['4:5'];
  const body = { prompt, image_size: size, aspect_ratio: ratio, num_images: 1 };
  if (faceDataUrl) body.image_urls = [faceDataUrl]; // reference face (model yang support)
  const data = await falRun(model.endpoint, body);
  const url = data?.images?.[0]?.url || data?.image?.url || data?.output?.[0]?.url;
  if (!url) throw new Error('Tiada imej dalam respons fal: ' + JSON.stringify(data).slice(0, 200));
  return url;
}

export async function llm(systemPrompt, userPrompt) {
  const data = await falRun(LLM_ENDPOINT, {
    model: LLM_MODEL,
    system_prompt: systemPrompt,
    prompt: userPrompt,
  });
  return data?.output || data?.text || '';
}

export async function llmVision(systemPrompt, userPrompt, imageDataUrl) {
  const data = await falRun(VISION_ENDPOINT, {
    model: LLM_MODEL,
    system_prompt: systemPrompt,
    prompt: userPrompt,
    image_url: imageDataUrl,
  });
  return data?.output || data?.text || '';
}

// Helper: paksa LLM keluarkan JSON bersih
export function parseJson(text) {
  const cleaned = String(text).replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const startArr = cleaned.indexOf('[');
  const s = (startArr !== -1 && (startArr < start || start === -1)) ? startArr : start;
  const e = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  return JSON.parse(cleaned.slice(s, e + 1));
}
