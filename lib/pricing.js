// ===== NC pricing (edit di sini bila nak ubah harga) =====
export const IMAGE_MODELS = [
  { id: 'nano-banana-pro', label: 'Nano Banana Pro', desc: 'Muka realistik & konsisten dari gambar rujukan', nc: 7, top: true },
  { id: 'nano-banana',     label: 'Nano Banana',     desc: 'Laju & jimat — sesuai untuk draf', nc: 3 },
  { id: 'seedream',        label: 'Seedream 4',      desc: 'ByteDance — aesthetic cantik, sampai 4K', nc: 3 },
];

export const TOPUP_PACKAGES = [
  { id: 'rm50',  rm: 50,  nc: 300,  bonus: 0 },
  { id: 'rm100', rm: 100, nc: 650,  bonus: 50 },
  { id: 'rm150', rm: 150, nc: 1000, bonus: 100 },
];

// LLM actions are free for members (kos ditanggung margin image),
// tapi boleh letak harga NC kalau nak: tukar nilai di bawah.
export const LLM_COSTS = { niche: 0, calendar: 0, analyze: 0 };
