'use client';
import {demoStorage,demoStorageMode} from '@/lib/demo-storage.mjs';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { demoSignIn, resetDemo } from '@/lib/demo-api.mjs';
import {navigateDemo} from '@/lib/demo-navigation';
import {clearAssets} from '@/lib/care-assets';
export default function DemoToolbar(){
 const router=useRouter();const [role,setRole]=useState('');const [storageMode,setStorageMode]=useState('local');
 useEffect(()=>{const update=()=>{try{setRole(JSON.parse(demoStorage.getItem('loggedUser')||'null')?.role||'');setStorageMode(demoStorageMode());}catch{setRole('');}};update();window.addEventListener('app-medica-session-change',update);return()=>window.removeEventListener('app-medica-session-change',update);},[]);
 function select(value:string){if(!value)return;demoSignIn(value);navigateDemo(['admin','segreteria'].includes(value)?'/agenda':'/',url=>router.push(url));}
 async function reset(){if(!window.confirm('Cancellare e ripristinare tutti i dati e i file locali di prova?'))return;try{await clearAssets();}catch{window.alert('Il browser non ha consentito la cancellazione dei file locali. I dati della prova saranno ripristinati; per eliminare eventuali allegati cancella i dati del sito dalle impostazioni del browser.');}resetDemo();window.location.href='/';}
 return <div className="presentation-bar"><span><strong>DEMO VINS CARE</strong><span className="presentation-explanation"> · Solo dati fittizi · {storageMode==='memory'?'Archivio limitato: prova temporanea in questa pagina':storageMode==='session'?'Prova conservata in questa sessione':'File e prova restano nel browser'}</span></span><div className="presentation-controls"><label htmlFor="demo-role">Esplora come</label><select id="demo-role" value={role} onChange={e=>select(e.target.value)}><option value="" disabled>Scegli un profilo</option><option value="paziente">Paziente</option><option value="medico">Medico referente</option><option value="infermiere">Infermiere</option><option value="fisioterapista">Fisioterapista</option><option value="caregiver">Caregiver delegato</option><option value="segreteria">Segreteria</option><option value="admin">Amministrazione</option></select><button onClick={()=>void reset()}>Ripristina demo</button><a href="/progetto">Logica del progetto</a></div></div>;
}
