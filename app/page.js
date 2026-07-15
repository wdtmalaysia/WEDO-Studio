'use client';
import { useEffect, useState } from 'react';
import { api } from '@/components/api';
import Pulse from '@/components/Pulse';
import SetupTab from '@/components/SetupTab';
import CalendarTab from '@/components/CalendarTab';
import StudioTab from '@/components/StudioTab';
import AnalyzerTab from '@/components/AnalyzerTab';
import TopupTab from '@/components/TopupTab';
import AdminTab from '@/components/AdminTab';

const TABS = [
  { id: 'setup',    label: 'Setup',    ico: '🌱' },
  { id: 'calendar', label: 'Calendar', ico: '🗓️' },
  { id: 'studio',   label: 'Studio',   ico: '✨' },
  { id: 'analyzer', label: 'Analyzer', ico: '🔍' },
  { id: 'topup',    label: 'Top Up',   ico: '💳' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState('studio');
  const [insights, setInsights] = useState('');
  const [prefillPrompt, setPrefillPrompt] = useState('');

  // Auto-login kalau kod ada dalam localStorage
  useEffect(() => {
    const code = localStorage.getItem('wedo_code');
    if (!code) { setChecking(false); return; }
    api('/api/login', { method: 'POST', body: JSON.stringify({ code }) })
      .then(d => { setUser(d.user); setTab(d.user.profile ? 'studio' : 'setup'); })
      .catch(() => localStorage.removeItem('wedo_code'))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <div className="shell" style={{ paddingTop: 120, textAlign: 'center' }}><span className="spin" /></div>;
  if (!user) return <Login onLogin={(u) => { setUser(u); setTab(u.profile ? 'studio' : 'setup'); }} />;

  const tabs = user.role === 'admin' ? [...TABS, { id: 'admin', label: 'Admin', ico: '👑' }] : TABS;

  return (
    <div className="shell">
      <div className="topbar">
        <span className="brand">WEDO<em>studio</em></span>
        <span className="nc-pill" onClick={() => setTab('topup')} style={{ cursor: 'pointer' }}>
          {user.credits} NC <span className="plus">+</span>
        </span>
      </div>

      {tab === 'setup' && <SetupTab user={user} onProfile={(p) => setUser({ ...user, profile: p })} />}
      {tab === 'calendar' && <CalendarTab user={user} insights={insights} goStudio={(p) => { setPrefillPrompt(p); setTab('studio'); }} />}
      {tab === 'studio' && <StudioTab user={user} setCredits={(c) => setUser({ ...user, credits: c })} prefill={prefillPrompt} />}
      {tab === 'analyzer' && <AnalyzerTab onInsights={setInsights} goCalendar={() => setTab('calendar')} />}
      {tab === 'topup' && <TopupTab user={user} />}
      {tab === 'admin' && user.role === 'admin' && <AdminTab />}

      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => { localStorage.removeItem('wedo_code'); setUser(null); }}>Log keluar</button>
      </div>

      <nav className="tabs">
        <div className="tabs-inner">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              <span className="ico">{t.ico}</span>{t.label}<span className="bar" />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Login({ onLogin }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true); setErr('');
    try {
      const d = await api('/api/login', { method: 'POST', body: JSON.stringify({ code: code.trim() }) });
      localStorage.setItem('wedo_code', code.trim());
      onLogin(d.user);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <div className="shell">
      <div className="login-hero">
        <h1>WEDO<em>studio</em></h1>
        <Pulse />
        <p>Niche, calendar, visual — semua dalam satu studio.<br />Content cantik, tanpa tekanan. ✨</p>
      </div>
      <div className="card">
        <label className="hint">Kod akses you</label>
        <input placeholder="cth: ayu-x7k2m9" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} style={{ margin: '8px 0 4px' }} />
        {err && <div className="msg err">{err}</div>}
        <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={busy || !code.trim()} onClick={go}>
          {busy ? <span className="spin" /> : 'Masuk studio'}
        </button>
        <p className="small" style={{ marginTop: 12, textAlign: 'center' }}>Tak ada kod? DM Coach Fadhlina untuk akses ✨</p>
      </div>
    </div>
  );
}
