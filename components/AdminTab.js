'use client';
import { useEffect, useState } from 'react';
import { api, compressImage } from './api';
import Pulse from './Pulse';

export default function AdminTab() {
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [topups, setTopups] = useState([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState(null);
  const [viewReceipt, setViewReceipt] = useState(null);

  async function load() {
    try {
      const [s, m, t] = await Promise.all([
        api('/api/admin/stats'), api('/api/admin/members'), api('/api/admin/topups'),
      ]);
      setStats(s); setMembers(m.members); setTopups(t.topups);
    } catch (e) { setMsg({ ok: false, text: e.message }); }
  }
  useEffect(() => { load(); }, []);

  async function addMember() {
    try {
      const d = await api('/api/admin/members', { method: 'POST', body: JSON.stringify({ name }) });
      setMsg({ ok: true, text: `Member ditambah! Kod akses: ${d.member.code}` });
      setName(''); load();
    } catch (e) { setMsg({ ok: false, text: e.message }); }
  }

  async function decide(id, action) {
    try { await api('/api/admin/decide', { method: 'POST', body: JSON.stringify({ topupId: id, action }) }); load(); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
  }

  async function setQr(e) {
    const f = e.target.files[0];
    if (!f) return;
    const data = await compressImage(f, 700);
    await api('/api/admin/settings', { method: 'POST', body: JSON.stringify({ key: 'qr_image', value: data }) });
    setMsg({ ok: true, text: 'QR pembayaran dikemaskini!' });
  }

  async function setBank() {
    const v = prompt('Nama pemegang akaun / bank (dipaparkan atas QR):');
    if (v == null) return;
    await api('/api/admin/settings', { method: 'POST', body: JSON.stringify({ key: 'bank_label', value: v }) });
    setMsg({ ok: true, text: 'Label bank dikemaskini!' });
  }

  function invite(m) {
    const url = window.location.origin;
    const text = `Hi ${m.name}! ✨ Ini akses WEDO Studio you — app AI untuk buat content cantik ikut niche you.\n\nLink: ${url}\nKod akses: ${m.code}\n\nLogin, setup niche, dan jom create! 💪`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  }

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>Admin <em style={{ fontStyle: 'normal', background: 'var(--grad)', WebkitBackgroundClip: 'text', color: 'transparent' }}>panel</em> 👑</h2>
      <p className="hint" style={{ margin: '6px 0 4px' }}>Tambah member, sahkan bayaran, urus credits.</p>
      <Pulse />
      {msg && <div className={`msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}

      {stats && (
        <div className="row" style={{ marginBottom: 14 }}>
          <div className="stat"><b>{stats.members}</b><span>Members</span></div>
          <div className="stat"><b>{stats.ncUsed}</b><span>NC diguna</span></div>
          <div className="stat"><b>{stats.ncOwed}</b><span>NC belum guna</span></div>
        </div>
      )}

      <div className="card">
        <h3>Bayaran menunggu {stats?.pendingTopups ? `(${stats.pendingTopups})` : ''}</h3>
        {topups.filter(t => t.status === 'pending').length === 0 && <p className="hint" style={{ marginTop: 6 }}>Tiada bayaran menunggu — semua clear ✓</p>}
        {topups.filter(t => t.status === 'pending').map(t => (
          <div key={t.id} className="listrow" style={{ flexWrap: 'wrap' }}>
            <span><b>{t.name}</b> — RM{t.amount_rm} → {t.nc} NC</span>
            <span style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewReceipt(t.receipt)}>Resit</button>
              <button className="btn btn-sm" style={{ background: 'var(--mint)', color: '#12332A' }} onClick={() => decide(t.id, 'approve')}>Lulus</button>
              <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff' }} onClick={() => decide(t.id, 'reject')}>Tolak</button>
            </span>
          </div>
        ))}
      </div>

      {viewReceipt && (
        <div className="card" onClick={() => setViewReceipt(null)} style={{ cursor: 'pointer' }}>
          <p className="small">Tap untuk tutup</p>
          <img src={viewReceipt} alt="resit" style={{ width: '100%', borderRadius: 12, marginTop: 8 }} />
        </div>
      )}

      <div className="card">
        <h3>Tambah member</h3>
        <div className="row" style={{ marginTop: 10 }}>
          <input placeholder="Nama, cth: Ayu" value={name} onChange={e => setName(e.target.value)} />
          <button className="btn" style={{ background: 'var(--grad)', color: '#2A1420', flex: '0 0 auto' }} onClick={addMember} disabled={!name.trim()}>Tambah</button>
        </div>
      </div>

      <div className="card">
        <h3>Members ({members.filter(m => m.role === 'member').length})</h3>
        {members.filter(m => m.role === 'member').map(m => (
          <div key={m.id} className="listrow" style={{ flexWrap: 'wrap' }}>
            <span><b>{m.name}</b><br /><span className="small" style={{ fontFamily: 'var(--mono)' }}>{m.code} · {m.credits} NC</span></span>
            <span style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => invite(m)}>💬 Invite</button>
              <button className="btn btn-ghost btn-sm" onClick={async () => {
                const v = window.prompt(`Tambah / tolak NC untuk ${m.name} (cth: 50 atau -20):`);
                if (!v) return;
                await api('/api/admin/credit', { method: 'POST', body: JSON.stringify({ userId: m.id, delta: parseInt(v, 10) }) });
                load();
              }}>± NC</button>
            </span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Tetapan pembayaran</h3>
        <div className="row" style={{ marginTop: 10 }}>
          <label className="btn btn-ghost btn-sm" style={{ textAlign: 'center' }}>
            Upload QR DuitNow
            <input type="file" accept="image/*" onChange={setQr} style={{ display: 'none' }} />
          </label>
          <button className="btn btn-ghost btn-sm" onClick={setBank}>Set nama bank</button>
        </div>
      </div>
    </div>
  );
}
