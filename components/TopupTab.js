'use client';
import { useEffect, useState } from 'react';
import { api, compressImage } from './api';
import Pulse from './Pulse';
import { TOPUP_PACKAGES, IMAGE_MODELS } from '@/lib/pricing';

export default function TopupTab({ user }) {
  const [pkg, setPkg] = useState('rm50');
  const [receipt, setReceipt] = useState(null);
  const [qr, setQr] = useState(null);
  const [bank, setBank] = useState('');
  const [topups, setTopups] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function load() {
    try {
      const d = await api('/api/topup');
      setTopups(d.topups); setQr(d.qr); setBank(d.bank);
    } catch {}
  }
  useEffect(() => { load(); }, []);

  const p = TOPUP_PACKAGES.find(x => x.id === pkg);

  async function pickReceipt(e) {
    const f = e.target.files[0];
    if (f) setReceipt(await compressImage(f, 1100));
  }

  async function submit() {
    setBusy(true); setMsg(null);
    try {
      const d = await api('/api/topup', { method: 'POST', body: JSON.stringify({ packageId: pkg, receipt }) });
      setMsg({ ok: true, text: d.message });
      setReceipt(null);
      load();
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    setBusy(false);
  }

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>Top up <em style={{ fontStyle: 'normal', background: 'var(--grad)', WebkitBackgroundClip: 'text', color: 'transparent' }}>NC</em></h2>
      <p className="hint" style={{ margin: '6px 0 4px' }}>Baki you: <b style={{ color: 'var(--gold)' }}>{user.credits} NC</b>. Macam prepaid — top up sekali, guna bila-bila.</p>
      <Pulse />

      <div className="row" style={{ marginBottom: 14 }}>
        {TOPUP_PACKAGES.map(x => (
          <button key={x.id} className={`stat ${pkg === x.id ? '' : ''}`} onClick={() => setPkg(x.id)}
            style={{ border: pkg === x.id ? '1px solid var(--coral)' : '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer' }}>
            <b>RM{x.rm}</b>
            <span>{x.nc} NC{x.bonus ? ` (+${x.bonus} free)` : ''}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <h3>Bayar RM{p.rm} → dapat {p.nc} NC</h3>
        {qr ? (
          <div className="qrbox" style={{ marginTop: 12 }}>
            {bank && <p style={{ color: '#222', fontWeight: 700, marginBottom: 8 }}>{bank}</p>}
            <img src={qr} alt="QR pembayaran" />
          </div>
        ) : (
          <p className="hint" style={{ marginTop: 8 }}>QR belum di-set oleh coach — check balik nanti ya.</p>
        )}
        <p className="hint" style={{ marginTop: 12 }}>Scan dengan banking app → bayar <b>RM{p.rm}</b> → screenshot resit → upload bawah.</p>
        <label className="btn btn-ghost" style={{ width: '100%', marginTop: 12, borderStyle: 'dashed' }}>
          {receipt ? '✓ Resit dipilih — tukar' : '📤 Upload resit you'}
          <input type="file" accept="image/*" onChange={pickReceipt} style={{ display: 'none' }} />
        </label>
        {msg && <div className={`msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
        <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={busy || !receipt} onClick={submit}>
          {busy ? <span className="spin" /> : `Hantar bayaran — terima ${p.nc} NC`}
        </button>
        <p className="small" style={{ marginTop: 10 }}>NC masuk selepas coach sahkan pembayaran. Semua bayaran disemak dengan rekod bank.</p>
      </div>

      <div className="card">
        <h3>Senarai harga NC</h3>
        {IMAGE_MODELS.map(x => (
          <div key={x.id} className="listrow"><span>Image — {x.label}</span><span className="price" style={{ fontFamily: 'var(--mono)', color: 'var(--gold)', fontWeight: 700 }}>{x.nc} NC</span></div>
        ))}
        <div className="listrow"><span>Niche, Calendar & IG Analyzer</span><span style={{ color: 'var(--mint)', fontWeight: 700 }}>Percuma</span></div>
      </div>

      {topups.length > 0 && (
        <div className="card">
          <h3>Sejarah top up</h3>
          {topups.map(t => (
            <div key={t.id} className="listrow">
              <span>RM{t.amount_rm} → {t.nc} NC</span>
              <span className={`tag-${t.status}`} style={{ fontWeight: 700, fontSize: 13 }}>
                {t.status === 'pending' ? 'Menunggu' : t.status === 'approved' ? 'Diluluskan ✓' : 'Ditolak'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
