'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import StatusBadge from '@/components/StatusBadge';
import { apiFetch, formatDateTime, readApiError } from '@/lib/api';
import type { User } from '@/lib/types';
import { useSession } from '@/hooks/useSession';

export default function UsersPage() {
  const { user, checking } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'infermiere' });

  const load = useCallback(async () => {
    const response = await apiFetch('/users');
    if (!response.ok) throw new Error(await readApiError(response));
    setUsers(await response.json());
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    load().catch((reason) => setError(reason instanceof Error ? reason.message : 'Errore di caricamento'));
  }, [load, user]);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    try {
      setError(''); setSuccess('');
      const response = await apiFetch('/users', { method: 'POST', body: JSON.stringify(form) });
      if (!response.ok) throw new Error(await readApiError(response));
      setForm({ full_name: '', email: '', password: '', role: 'infermiere' });
      setSuccess('Utente creato. Può ora essere assegnato ai pazienti.');
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Errore'); }
  }

  async function toggleUser(target: User) {
    try {
      setError(''); setSuccess('');
      const response = await apiFetch(`/users/${target.id}`, {
        method: 'PATCH', body: JSON.stringify({ is_active: !target.is_active }),
      });
      if (!response.ok) throw new Error(await readApiError(response));
      setSuccess(target.is_active ? 'Utente disattivato.' : 'Utente riattivato.');
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Errore'); }
  }


  async function changeRole(target: User, role: string) {
    try {
      setError(''); setSuccess('');
      const response = await apiFetch(`/users/${target.id}`, {
        method: 'PATCH', body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error(await readApiError(response));
      setSuccess('Ruolo aggiornato. Il nuovo ruolo sarà applicato al prossimo accesso.');
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Errore'); }
  }

  async function resetPassword(target: User) {
    const password = window.prompt(`Nuova password per ${target.full_name} (minimo 8 caratteri):`);
    if (!password) return;
    try {
      const response = await apiFetch(`/users/${target.id}/reset-password`, {
        method: 'POST', body: JSON.stringify({ new_password: password }),
      });
      if (!response.ok) throw new Error(await readApiError(response));
      setSuccess('Password aggiornata.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Errore'); }
  }

  if (checking || !user) return <main className="page">Controllo accesso...</main>;
  if (user.role !== 'admin') return <AppShell user={user}><main className="page"><div className="notice error">Sezione riservata all’amministratore.</div></main></AppShell>;

  return (
    <AppShell user={user}>
      <main className="page">
        <header className="page-header"><div><h1>Utenti e ruoli</h1><p>Gestione degli account. Le assegnazioni ai pazienti si effettuano nella cartella del paziente.</p></div></header>
        {error && <div className="notice error">{error}</div>}
        {success && <div className="notice success">{success}</div>}

        <section className="card" style={{ marginBottom: 22 }}>
          <h2>Nuovo utente</h2>
          <form onSubmit={createUser} className="form-grid">
            <div className="field"><label>Nome completo</label><input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="field"><label>Password iniziale</label><input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="field"><label>Ruolo</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="admin">Amministratore</option><option value="medico">Medico</option><option value="infermiere">Infermiere</option><option value="caregiver">Caregiver</option><option value="segreteria">Segreteria</option><option value="paziente" disabled>Paziente (portale)</option></select></div>
            <div className="field full"><button className="button">Crea account</button></div>
          </form>
        </section>

        <section className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Utente</th><th>Ruolo</th><th>Stato</th><th>Ultimo accesso</th><th>Azioni</th></tr></thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.full_name}</strong><br /><small>{item.email}</small></td>
                    <td><select aria-label={`Ruolo di ${item.full_name}`} disabled={item.role === "paziente"} value={item.role} onChange={(e) => changeRole(item, e.target.value)}><option value="admin">Admin</option><option value="medico">Medico</option><option value="infermiere">Infermiere</option><option value="caregiver">Caregiver</option><option value="segreteria">Segreteria</option><option value="paziente" disabled>Paziente (portale)</option></select></td>
                    <td><StatusBadge value={item.is_active ? 'active' : 'revoked'} /></td>
                    <td>{formatDateTime(item.last_login_at)}</td>
                    <td><div className="row"><button className="button secondary small" type="button" onClick={() => toggleUser(item)}>{item.is_active ? 'Disattiva' : 'Riattiva'}</button><button className="button ghost small" type="button" onClick={() => resetPassword(item)}>Reset password</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
