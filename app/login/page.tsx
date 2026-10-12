'use client';
import {demoStorage} from '@/lib/demo-storage.mjs';


import { FormEvent, useState } from 'react';
import {navigateDemo} from '@/lib/demo-navigation';
import { useRouter } from 'next/navigation';
import { demoFetch } from '@/lib/demo-api.mjs';
import type { LoggedUser } from '@/lib/api';
import Link from '@/components/NavLink';
import PublicHeader from '@/components/PublicHeader';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('paziente@test.it');
  const [password, setPassword] = useState('PazienteDemo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await demoFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Credenziali non valide');
      const data = await response.json() as { access_token: string; user: LoggedUser };
      demoStorage.setItem('accessToken', data.access_token);
      demoStorage.setItem('loggedUser', JSON.stringify(data.user));
      window.dispatchEvent(new Event('app-medica-session-change'));
      const next = new URLSearchParams(window.location.search).get('next');
      const area = ['segreteria','admin'].includes(data.user.role) ? '/agenda' : '/';
      navigateDemo(next && next.startsWith('/specialisti/') ? next : area,url=>router.push(url));
    } catch {
      setError('Accesso non riuscito. Usa uno degli account di prova.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <><PublicHeader/><main className="auth-content">
      <section className="card login-card">
        <h1>Accedi a Vins Care</h1>
        <p className="muted">Appuntamenti, messaggi e percorso assistenziale.</p>
        <form onSubmit={handleLogin} className="grid" style={{ marginTop: 22 }}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <button type="submit" className="button full" disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
        {error && <div className="notice error" style={{ marginTop: 14 }}>{error}</div>}
        <p>Nuovo paziente? <Link href="/registrati">Crea il tuo account</Link></p>
        <div className="demo-box">
          <strong>Account di prova</strong>
          <div>Paziente: paziente@test.it / PazienteDemo123</div>
          <div>Segreteria: segreteria@test.it / SegreteriaDemo123</div>
          <div>Admin: admin@test.it / admin123</div>
          <div>Medico: medico@test.it / medico123</div>
          <div>Infermiere: infermiere@test.it / infermiere123</div>
          <div>Caregiver: caregiver@test.it / caregiver123</div>
        </div>
      </section>
    </main></>
  );
}
