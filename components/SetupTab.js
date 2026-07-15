'use client';
import { useState } from 'react';
import { api } from './api';
import Pulse from './Pulse';

export default function SetupTab({ user, onProfile }) {
  const [mode, setMode] = useState(user.profile ? 'done' : 'pick');
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const profile = user.profile;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(m) {
    setBusy(true); setErr('');
    try {
      const { profile } = await api('/api/niche', { method: 'POST', body: JSON.stringify({ mode: m, form }) });
      onProfile(profile);
      setMode('done');
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  if (mode === 'done' && profile) {
    return (
      <div>
        <h2 style={{ fontSize: 24 }}>Niche you dah siap ✨</h2>
        <Pulse />
        <div className="card">
          <h3>Niche</h3>
          <p>{profile.niche}</p>
          <p className="hint" style={{ marginTop: 8 }}><b>Audience:</b> {profile.audience}</p>
          <p className="hint" style={{ marginTop: 4 }}><b>Tone:</b> {profile.tone}</p>
          <div className="chiprow" style={{ marginTop: 10 }}>
            {(profile.pillars || []).map((p) => <span key={p} className="pillbar">{p}</span>)}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { setMode('pick'); setForm({}); }}>Ubah niche</button>
      </div>
    );
  }

  if (mode === 'pick') {
    return (
      <div>
        <h2 style={{ fontSize: 24 }}>Jom setup brand you</h2>
        <p className="hint" style={{ margin: '6px 0 4px' }}>Sekali sahaja — lepas ni calendar & prompt semua ikut niche you.</p>
        <Pulse />
        <button className="modelcard" onClick={() => setMode('wizard')}>
          <div><h3>Saya baru nak mula 🌱</h3><p className="hint">Jawab 5 soalan ringkas — AI bina niche untuk you</p></div>
        </button>
        <button className="modelcard" onClick={() => setMode('express')}>
          <div><h3>Saya dah ada niche 💪</h3><p className="hint">Terus isi niche & pillars sendiri</p></div>
        </button>
      </div>
    );
  }

  if (mode === 'express') {
    return (
      <div>
        <h2 style={{ fontSize: 22 }}>Isi niche you</h2>
        <Pulse />
        <div className="card">
          <label className="hint">Niche statement</label>
          <input placeholder="cth: Fitness coach untuk working moms yang sibuk" onChange={set('niche')} style={{ margin: '6px 0 12px' }} />
          <label className="hint">Target audience</label>
          <input placeholder="cth: wanita berkerjaya 28-45 tahun" onChange={set('audience')} style={{ margin: '6px 0 12px' }} />
          <label className="hint">Content pillars (asingkan dengan koma)</label>
          <input placeholder="cth: Tips workout, Resepi sihat, Mindset, Testimoni" onChange={set('pillars')} style={{ margin: '6px 0 12px' }} />
          <label className="hint">Tone</label>
          <input placeholder="cth: santai, warm, macam kawan" onChange={set('tone')} style={{ margin: '6px 0 4px' }} />
        </div>
        {err && <div className="msg err">{err}</div>}
        <button className="btn btn-primary" disabled={busy || !form.niche} onClick={() => submit('express')}>
          {busy ? <span className="spin" /> : 'Simpan niche'}
        </button>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setMode('pick')}>Kembali</button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 22 }}>5 soalan je 🌱</h2>
      <Pulse />
      <div className="card">
        <label className="hint">1. Apa bidang / kerja you?</label>
        <input placeholder="cth: coach senaman, jual skincare, ajar mengaji" onChange={set('field')} style={{ margin: '6px 0 12px' }} />
        <label className="hint">2. Siapa yang you nak bantu?</label>
        <input placeholder="cth: ibu bekerja yang tak ada masa" onChange={set('helps')} style={{ margin: '6px 0 12px' }} />
        <label className="hint">3. Masalah apa yang you solve?</label>
        <input placeholder="cth: nak sihat tapi tak tahu mula dari mana" onChange={set('problem')} style={{ margin: '6px 0 12px' }} />
        <label className="hint">4. Personaliti you macam mana?</label>
        <input placeholder="cth: santai & suka bergurau / tegas tapi caring" onChange={set('personality')} style={{ margin: '6px 0 12px' }} />
        <label className="hint">5. Platform utama?</label>
        <input placeholder="cth: Instagram" onChange={set('platform')} style={{ margin: '6px 0 4px' }} />
      </div>
      {err && <div className="msg err">{err}</div>}
      <button className="btn btn-primary" disabled={busy || !form.field} onClick={() => submit('wizard')}>
        {busy ? <span className="spin" /> : 'Generate niche saya ✨'}
      </button>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setMode('pick')}>Kembali</button>
    </div>
  );
}
