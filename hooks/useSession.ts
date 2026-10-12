'use client';
import {demoStorage} from '@/lib/demo-storage.mjs';


import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { LoggedUser } from '@/lib/api';

const SESSION_EVENT = 'app-medica-session-change';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(SESSION_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(SESSION_EVENT, callback);
  };
}

function getUserSnapshot() {
  return demoStorage.getItem('loggedUser') || '';
}

function getTokenSnapshot() {
  return demoStorage.getItem('accessToken') || '';
}

export function useSession() {
  const router = useRouter();
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const rawUser = useSyncExternalStore(subscribe, getUserSnapshot, () => '');
  const token = useSyncExternalStore(subscribe, getTokenSnapshot, () => '');

  const user = useMemo<LoggedUser | null>(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as LoggedUser;
    } catch {
      return null;
    }
  }, [rawUser]);

  useEffect(() => {
    if (hydrated && (!user || !token)) router.replace('/login');
  }, [hydrated, router, token, user]);

  return { user, checking: !hydrated };
}
