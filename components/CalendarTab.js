'use client';
import { useEffect, useState } from 'react';
import { api } from './api';
import Pulse from './Pulse';

export default function CalendarTab({ user, insights, goStudio }) {
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(-1);

  useEffect(() => {
    api('/api/calendar').then(d => setPlan(d.plan)).catch(() => {});
  }, []);

  async function generate() {
    setBusy(true); setErr('');
    try {
      const d = await api('/api/calendar', { method: 'POST', body: JSON.stringify({ insights: insights || null }) });
      setPlan(d.plan); setOpen(0);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>Calendar 7 hari</h2>
      <p className="hint" style={{ margin: '6px 0 4px' }}>Plan ikut niche you — tap mana-mana hari untuk caption & terus ke Studio.</p>
      <Pulse />
      {!user.profile && <div className="msg err">Siapkan niche di tab Setup dulu ya.</div>}
      {insights && <div className="msg ok">Insight IG Analyzer akan digunakan dalam plan baru ✨</div>}
      {err && <div className="msg err">{err}</div>}
      <button className="btn btn-primary" disabled={busy || !user.profile} onClick={generate} style={{ marginBottom: 18 }}>
        {busy ? <span className="spin" /> : plan ? 'Generate plan baru' : 'Generate calendar saya ✨'}
      </button>

      {plan?.days?.map((d, i) => (
        <div key={i} className="daycard" onClick={() => setOpen(open === i ? -1 : i)} style={{ cursor: 'pointer' }}>
          <div className="dow">{d.day}</div>
          <h4>{d.hook}</h4>
          <div><span className="pillbar">{d.pillar}</span><span className="pillbar" style={{ background: 'rgba(255,182,92,.12)', color: 'var(--gold)' }}>{d.format}</span></div>
          {open === i && (
            <div style={{ marginTop: 10 }}>
              <p className="hint" style={{ whiteSpace: 'pre-wrap' }}>{d.caption}</p>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(d.caption); }}>Copy caption</button>
                <button className="btn btn-sm" style={{ background: 'var(--grad)', color: '#2A1420' }} onClick={(e) => { e.stopPropagation(); goStudio(d.image_prompt); }}>Buat visual →</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {!plan && !busy && <div className="card dashed"><p className="hint">Belum ada plan — tekan butang di atas untuk mula.</p></div>}
    </div>
  );
}
