'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
export default function Page(){const router=useRouter();useEffect(()=>{router.replace('/diario');},[router]);return <main className='page'>Apertura del percorso di cura…</main>;}
