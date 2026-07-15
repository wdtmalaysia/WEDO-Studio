# WEDO Studio ✨

AI content studio untuk members — niche engine, calendar 7 hari, image studio, IG analyzer, sistem NC credit dengan top up DuitNow QR.

## Deploy ke Vercel (15 minit)

1. **Push ke GitHub** — buat repo baru, push semua file ni.
2. **Import ke Vercel** — vercel.com → Add New → Project → pilih repo.
3. **Sambung database** — dalam project Vercel → Storage → Create Database → **Neon (Postgres)**. `DATABASE_URL` akan auto-set.
4. **Tambah env vars** — Settings → Environment Variables:
   - `FAL_KEY` — dari fal.ai → Dashboard → Keys
   - `ADMIN_CODE` — kod akses admin anda (pilih sendiri, susah diteka)
5. **Deploy**, kemudian buka sekali: `https://APP-ANDA.vercel.app/api/setup?admin=ADMIN_CODE_ANDA` — ini setup database.
6. **Login** dengan `ADMIN_CODE` anda → tab Admin → upload QR DuitNow + set nama bank → tambah member pertama.

## Ubah harga
Semua harga NC & pakej top up dalam satu file: `lib/pricing.js`.

## Model AI
Model IDs fal.ai dalam `lib/fal.js` — **sila verify di fal.ai/models sebelum production** sebab ID boleh berubah. Tukar di situ sahaja.

## Struktur
- `app/page.js` — app utama (login + 6 tab)
- `components/` — satu file per tab
- `app/api/` — semua backend routes
- `lib/` — db, auth, fal, pricing

## Phase 2 (belum dibuat)
- Video generation (Kling/Veo melalui fal — tambah dalam lib/fal.js + Studio)
- Text overlay "100% tepat" (stamp text atas gambar)
- Carousel generator
- Soul / trained character (fal LoRA training)
