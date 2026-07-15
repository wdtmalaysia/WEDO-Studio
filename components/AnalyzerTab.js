'use client';
import { useState } from 'react';
import { api, compressImage } from './api';
import Pulse from './Pulse';

export default function AnalyzerTab({ onInsights, goCalendar }) {
  const [imgs, setImgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState('');

  async function pick(e) {
    const files = [...e.target.files].slice(0, 3);
    const out = [];
    for (const f of files) out.push(await compressImage(f, 1100));
    setImgs(out);
  }

  async function analyze() {
    setBusy(true); setErr('');
    try {
      const d = await api('/api/analyze', { method: 'POST', body: JSON.stringify({ images: imgs }) });
      setResult(d.analysis);
      onInsights(d.analysis);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>IG Analyzer</h2>
      <p className="hint" style={{ margin: '6px 0 4px' }}>Screenshot profile / insights / top posts you — AI baca & bagi cadangan.</p>
      <Pulse />
      <div className="card dashed">
        <label className="btn btn-ghost" style={{ width: '100%' }}>
          📸 Pilih screenshot (max 3)
          <input type="file" accept="image/*" multiple onChange={pick} style={{ display: 'none' }} />
        </label>
        {imgs.length > 0 && (
          <div className="gallery" style={{ marginTop: 12 }}>
            {imgs.map((s, i) => <img key={i} src={s} alt={`screenshot ${i + 1}`} />)}
          </div>
        )}
      </div>
      {err && <div className="msg err">{err}</div>}
      <button className="btn btn-primary" disabled={busy || !imgs.length} onClick={analyze}>
        {busy ? <span className="spin" /> : 'Analyze Instagram saya 🔍'}
      </button>
      {result && (
        <div className="card" style={{ marginTop: 14 }}>
          <h3>Hasil analisis</h3>
          <p className="hint" style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{result}</p>
          <button className="btn btn-sm" style={{ background: 'var(--grad)', color: '#2A1420', marginTop: 14 }} onClick={goCalendar}>
            Update calendar dengan insight ni →
          </button>
        </div>
      )}
    </div>
  );
}
