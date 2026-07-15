'use client';
import { useEffect, useState } from 'react';
import { api, compressImage } from './api';
import Pulse from './Pulse';
import { IMAGE_MODELS } from '@/lib/pricing';

const RATIOS = ['4:5', '1:1', '9:16', '16:9'];

export default function StudioTab({ user, setCredits, prefill }) {
  const [model, setModel] = useState('nano-banana-pro');
  const [ratio, setRatio] = useState('4:5');
  const [prompt, setPrompt] = useState(prefill || '');
  const [face, setFace] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [gallery, setGallery] = useState([]);

  useEffect(() => { if (prefill) setPrompt(prefill); }, [prefill]);
  useEffect(() => { api('/api/gallery').then(d => setGallery(d.items)).catch(() => {}); }, []);

  const m = IMAGE_MODELS.find(x => x.id === model);

  async function pickFace(e) {
    const f = e.target.files[0];
    if (f) setFace(await compressImage(f, 900));
  }

  async function generate() {
    setBusy(true); setErr('');
    try {
      const d = await api('/api/generate', { method: 'POST', body: JSON.stringify({ model, prompt, ratio, face }) });
      setCredits(d.credits);
      setGallery(g => [{ id: Date.now(), image_url: d.url, prompt, model, nc_cost: m.nc }, ...g]);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>Studio</h2>
      <p className="hint" style={{ margin: '6px 0 4px' }}>hi, <b style={{ color: 'var(--ink)' }}>{user.name}</b> ✦ apa kita nak create hari ni?</p>
      <Pulse />

      {IMAGE_MODELS.map(x => (
        <button key={x.id} className={`modelcard ${model === x.id ? 'on' : ''}`} onClick={() => setModel(x.id)}>
          <div>
            <h3>{x.label} {x.top && <span className="badge">Top pick</span>}</h3>
            <p className="hint">{x.desc}</p>
          </div>
          <span className="price">{x.nc} NC</span>
        </button>
      ))}

      <div className="card">
        <h3>Ratio</h3>
        <div className="chiprow">
          {RATIOS.map(r => <button key={r} className={`chip ${ratio === r ? 'on' : ''}`} onClick={() => setRatio(r)}>{r}</button>)}
        </div>
      </div>

      <div className="card dashed">
        <h3>👤 Muka rujukan (optional)</h3>
        <p className="hint">Lock muka you — AI ambil wajah sahaja, design gambar tak diambil.</p>
        <label className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>
          {face ? '✓ Gambar dipilih — tukar' : '+ Tambah gambar'}
          <input type="file" accept="image/*" onChange={pickFace} style={{ display: 'none' }} />
        </label>
        {face && <img src={face} alt="face reference" style={{ width: 84, borderRadius: 12, marginTop: 10, display: 'block' }} />}
      </div>

      <div className="card">
        <h3>Prompt</h3>
        <textarea className="prompt" placeholder={'cth: Berjalan tepi pantai waktu pagi, senyum tenang, soft morning light, photorealistic editorial quality'} value={prompt} onChange={e => setPrompt(e.target.value)} style={{ marginTop: 8 }} />
        <p className="small" style={{ marginTop: 8 }}>Tip: prompt detail = hasil lagi cantik. Dari tab Calendar, prompt auto-masuk sini.</p>
      </div>

      {err && <div className="msg err">{err}</div>}
      <button className="btn btn-primary" disabled={busy || !prompt.trim()} onClick={generate}>
        {busy ? <><span className="spin" /> Sedang jana…</> : `Generate — ${m.nc} NC`}
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '26px 0 12px' }}>
        <h3 style={{ fontFamily: 'var(--display)', fontSize: 18 }}>Gallery you</h3>
        <span className="small">{gallery.length} item</span>
      </div>
      {gallery.length ? (
        <div className="gallery">
          {gallery.map(g => (
            <a key={g.id} href={g.image_url} target="_blank" rel="noreferrer"><img src={g.image_url} alt={g.prompt?.slice(0, 40)} /></a>
          ))}
        </div>
      ) : (
        <div className="card dashed"><p className="hint">Belum ada apa-apa — semua yang you create akan muncul sini.</p></div>
      )}
    </div>
  );
}
