import {demoStorage} from './demo-storage.mjs';
import { demoFetch } from './demo-api.mjs';
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || '/api/backend';

export type UserRole = 'admin' | 'medico' | 'infermiere' | 'caregiver' | 'paziente' | 'segreteria' | 'fisioterapista';

export type LoggedUser = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
};

export function getStoredUser(): LoggedUser | null {
  if (typeof window === 'undefined') return null;
  const raw = demoStorage.getItem('loggedUser');
  if (!raw) return null;
  try {
    const user=JSON.parse(raw);
    if(!user||typeof user.id!=='string'||typeof user.full_name!=='string'||!['admin','medico','infermiere','caregiver','paziente','segreteria','fisioterapista'].includes(user.role))return null;
    return user as LoggedUser;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  demoStorage.removeItem('accessToken');
  demoStorage.removeItem('loggedUser');
  window.dispatchEvent(new Event('app-medica-session-change'));
}

type ApiResponse = Omit<Response, 'json'> & { json(): Promise<any> };
export async function apiFetch(path: string, init: RequestInit = {}): Promise<ApiResponse> {
  const token =
    typeof window !== 'undefined' ? demoStorage.getItem('accessToken') : null;
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return await demoFetch(path, { ...init, headers }) as ApiResponse;
}

export async function readApiError(response: Pick<Response, 'json'>): Promise<string> {
  try {
    const data = await response.json() as { detail?: string | { msg?: string }[]; message?: string };
    const detail = data.detail;
    if (Array.isArray(detail)) return detail.map((v: { msg?: string }) => v.msg || 'Dato non valido').join('; ');
    return typeof detail === 'string' ? detail : data.message || 'Operazione non riuscita';
  } catch {
    return 'Operazione non riuscita';
  }
}

export function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
