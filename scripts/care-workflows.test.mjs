import {beforeEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {demoFetch,demoSignIn,resetDemo} from '../lib/demo-api.mjs';
import {resetStorageAdapter} from '../lib/demo-storage.mjs';

const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.window={dispatchEvent:()=>true};
const patient='patient-giulia';
const now=()=>new Date().toISOString();
const state=()=>JSON.parse(localStorage.getItem('vins-care-presentation-v1'));
async function call(path,body,method=body?'POST':'GET'){const r=await demoFetch(`/api/backend${path}`,{method,...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,body:await r.json()};}
async function workspace(){const r=await call(`/workspace?patient_id=${patient}`);assert.equal(r.status,200);return r.body;}
const diary=extra=>({patient_id:patient,title:'Osservazione di fantasia',body:'Test del percorso domiciliare',setting:'domicilio',occurred_at:now(),...extra});
const decision=extra=>({patient_id:patient,decision:'accepted',method:'written',signer_name:'Giulia Demo',informed:true,understood:true,...extra});
beforeEach(()=>{memory.clear();resetStorageAdapter();demoSignIn('paziente');});

test('migration preserves bookings and adds care workflows once',async()=>{
 const first=state();assert.equal(first.care_version,2);assert.equal(first.care_ranges.length,0);assert.equal(first.appointments.length,2);
 delete first.care_version;first.users=first.users.filter(u=>u.role!=='fisioterapista');localStorage.setItem('vins-care-presentation-v1',JSON.stringify(first));
 await workspace();await workspace();assert.equal(state().users.filter(u=>u.role==='fisioterapista').length,1);assert.equal(state().appointments.length,2);
});

test('patient, delegated caregiver and professionals receive only assigned patients',async()=>{
 assert.deepEqual((await workspace()).patients.map(p=>p.id),[patient]);
 demoSignIn('infermiere');assert.deepEqual((await workspace()).patients.map(p=>p.id),[patient,'patient-mario']);
 demoSignIn('fisioterapista');assert.deepEqual((await workspace()).patients.map(p=>p.id),[patient]);
 demoSignIn('medico');assert.equal((await workspace()).patients.length,3);
 for(const role of ['admin','segreteria']){demoSignIn(role);const w=await workspace();assert.equal(w.patient,null);assert.equal(w.administrative,true);assert.equal(w.documents,undefined);assert.equal((await call('/workspace/diary',diary())).status,403);}
});

test('unassigned writes and legacy clinical endpoints cannot bypass workspace permissions',async()=>{
 demoSignIn('infermiere');assert.equal((await call('/workspace/diary',diary({patient_id:'patient-anna'}))).status,403);
 demoSignIn('paziente');assert.equal((await call('/workspace/readings',{patient_id:'patient-mario',metric:'peso',value:70,measured_at:now()})).status,403);
 assert.equal((await call('/patients')).status,410);assert.equal((await call('/vitals?patient_id=patient-mario')).status,410);
 resetDemo();assert.equal((await call('/workspace')).status,401);
});

test('diary keeps original notes, adds corrections and requires professional review',async()=>{
 const first=(await call('/workspace/diary',diary({critical:true}))).body;
 const original=first.body;assert.equal(first.status,'to_review');
 assert.equal((await call(`/workspace/diary/${first.id}/review`,{status:'resolved',note:'Invalid patient review'})).status,403);
 const correction=(await call('/workspace/diary',diary({title:'Integrazione',body:'Ulteriore osservazione',correction_of:first.id}))).body;
 assert.equal(correction.correction_of,first.id);
 demoSignIn('infermiere');assert.equal((await call(`/workspace/diary/${first.id}/review`,{status:'nursing_review',note:'Presa in esame dal team'})).status,200);
 assert.equal((await call(`/workspace/diary/${first.id}/review`,{status:'resolved',note:'Non consentito'})).status,400);
 demoSignIn('medico');await call(`/workspace/diary/${first.id}/review`,{status:'resolved',note:'Esempio di gestione clinica'});
 const saved=state().care_diary.find(d=>d.id===first.id);assert.equal(saved.body,original);assert.equal(saved.reviews.length,2);assert.equal(saved.status,'resolved');
});

test('professional drafts stay internal until their author shares them',async()=>{
 demoSignIn('infermiere');const draft=(await call('/workspace/diary',diary({visibility:'team'}))).body;
 demoSignIn('paziente');assert.ok(!(await workspace()).diary.some(d=>d.id===draft.id));
 assert.equal((await call('/workspace/diary',diary({correction_of:draft.id}))).status,400);
 demoSignIn('medico');assert.equal((await call(`/workspace/diary/${draft.id}/publish`,{})).status,403);
 demoSignIn('infermiere');assert.equal((await call(`/workspace/diary/${draft.id}/publish`,{})).status,200);
 demoSignIn('paziente');assert.ok((await workspace()).diary.some(d=>d.id===draft.id));
});

test('physiotherapist reviews use their own professional label',async()=>{
 demoSignIn('fisioterapista');const r=await call('/workspace/diary/diary-1/review',{status:'professional_review',note:'Valutazione di fantasia'});assert.equal(r.status,200);assert.equal(r.body.reviews[0].role,'fisioterapista');
 assert.equal((await call('/workspace/diary/diary-1/review',{status:'nursing_review',note:'Wrong profession'})).status,400);
});

test('documents preserve originals through review and enforce selective sharing',async()=>{
 const doc=(await call('/workspace/documents',{patient_id:patient,title:'Esame fittizio',category:'laboratorio',blob_id:'test-blob',sha256:'a'.repeat(64),mime_type:'application/pdf',size_bytes:100,file_name:'esempio.pdf',visibility:'team',family_visible:false})).body;
 assert.equal(doc.status,'received');demoSignIn('caregiver');assert.ok(!(await workspace()).documents.some(d=>d.id===doc.id));assert.equal((await call(`/workspace/documents/${doc.id}/open`,{})).status,403);
 demoSignIn('infermiere');assert.ok((await workspace()).documents.some(d=>d.id===doc.id));assert.equal((await call(`/workspace/documents/${doc.id}/review`,{note:'Non medico'})).status,403);
 demoSignIn('medico');await call(`/workspace/documents/${doc.id}/review`,{note:'Revisione dimostrativa'});
 const saved=state().care_documents.find(d=>d.id===doc.id);assert.equal(saved.blob_id,'test-blob');assert.equal(saved.sha256,'a'.repeat(64));assert.equal(saved.reviews.length,1);
 demoSignIn('paziente');await call(`/workspace/documents/${doc.id}/sharing`,{visibility:'team',family_visible:true});
 demoSignIn('caregiver');assert.ok((await workspace()).documents.some(d=>d.id===doc.id));await call(`/workspace/documents/${doc.id}/open`,{});assert.ok(state().care_audit.some(a=>a.action==='Esame: consultazione'&&a.actor_id==='user-caregiver'));
 demoSignIn('paziente');await call(`/workspace/documents/${doc.id}/sharing`,{visibility:'referente',family_visible:true});
 demoSignIn('infermiere');assert.equal((await call(`/workspace/documents/${doc.id}/open`,{})).status,403);
 demoSignIn('caregiver');assert.equal((await call(`/workspace/documents/${doc.id}/open`,{})).status,403);
});

test('caregiver cannot upload or obtain restricted consent records',async()=>{
 demoSignIn('caregiver');const w=await workspace();assert.equal(w.consents.length,0);assert.ok(!w.documents.some(d=>d.id==='doc-private'));
 assert.equal((await call('/workspace/documents',{patient_id:patient,title:'Falso upload',blob_id:'x',sha256:'a'.repeat(64),mime_type:'application/pdf',size_bytes:100})).status,403);
 assert.equal((await call('/workspace/consents/consent-demo/decision',decision())).status,403);
});

test('patient-team messages and professional coordination are separate',async()=>{
 const sent=(await call('/workspace/messages',{patient_id:patient,body:'Una domanda di fantasia',channel:'patient_team'})).body;
 demoSignIn('medico');assert.ok((await workspace()).messages.some(m=>m.id===sent.id));await call(`/workspace/messages/${sent.id}/read`,{});
 const internal=(await call('/workspace/messages',{patient_id:patient,body:'Coordinamento riservato',channel:'team'})).body;
 demoSignIn('paziente');assert.ok(!(await workspace()).messages.some(m=>m.id===internal.id));assert.equal((await call(`/workspace/messages/${internal.id}/read`,{})).status,403);
 assert.ok((await workspace()).messages.find(m=>m.id===sent.id).read_by.includes('user-medico'));
});

test('vitals reject missing, malformed and contradictory input without universal clinical thresholds',async()=>{
 assert.equal((await workspace()).ranges.length,0);
 for(const value of ['',null,'not-a-number',101])assert.equal((await call('/workspace/readings',{patient_id:patient,metric:'saturazione',value,measured_at:now()})).status,400);
 assert.equal((await call('/workspace/readings',{patient_id:patient,metric:'pressione',value:120,second_value:130,measured_at:now()})).status,400);
 assert.equal((await call('/workspace/readings',{patient_id:patient,metric:'peso',value:70,measured_at:new Date(Date.now()+3600000).toISOString()})).status,400);
 const r=(await call('/workspace/readings',{patient_id:patient,metric:'frequenza',value:99,measured_at:now(),setting:'ambulatorio'})).body;
 assert.equal(r.flagged,false);assert.equal(r.unit,'bpm');assert.equal(r.setting,'ambulatorio');
});

test('a patient concern links a reading to a reviewable diary event',async()=>{
 const initial=state().care_diary.length;const r=(await call('/workspace/readings',{patient_id:patient,metric:'peso',value:70,measured_at:now(),flagged:true,context:'Dubbio fittizio'})).body;
 assert.equal(r.flagged,true);assert.equal(state().care_diary.length,initial+1);assert.equal(state().care_diary[0].kind,'measurement_concern');assert.equal(state().care_diary[0].status,'to_review');
});

test('personalized monitor limits are physician-only and team review adds a trace',async()=>{
 assert.equal((await call('/workspace/ranges',{patient_id:patient,metric:'frequenza',min:60,max:100})).status,403);
 demoSignIn('medico');await call('/workspace/ranges',{patient_id:patient,metric:'frequenza',min:60,max:100,note:'Limiti esclusivamente fittizi'});
 demoSignIn('paziente');const r=(await call('/workspace/readings',{patient_id:patient,metric:'frequenza',value:101,measured_at:now()})).body;assert.equal(r.flagged,true);assert.ok(r.range_reason);
 demoSignIn('infermiere');await call(`/workspace/readings/${r.id}/review`,{note:'Valutazione di prova'});assert.equal(state().care_readings.find(v=>v.id===r.id).reviews.length,1);
});

test('consent follows clarification, decision, professional verification and revocation',async()=>{
 const original=state().care_consents[0].information;await call('/workspace/consents/consent-demo/question',{question:'Quali sono le alternative?'});
 assert.equal((await call('/workspace/consents/consent-demo/decision',decision())).status,400);
 const q=state().care_consents[0].questions[0];demoSignIn('infermiere');assert.equal((await call('/workspace/consents/consent-demo/answer',{question_id:q.id,answer:'Non consentito'})).status,403);
 demoSignIn('medico');await call('/workspace/consents/consent-demo/answer',{question_id:q.id,answer:'Chiarimento dimostrativo del medico'});
 demoSignIn('paziente');assert.equal((await call('/workspace/consents/consent-demo/decision',decision({understood:false}))).status,400);const accepted=await call('/workspace/consents/consent-demo/decision',decision());assert.equal(accepted.body.status,'to_verify');
 assert.equal((await call('/workspace/consents/consent-demo/decision',decision())).status,409);
 demoSignIn('medico');assert.equal((await call('/workspace/consents/consent-demo/verify',{identity_checked:true,note:'Manca il colloquio'})).status,400);
 await call('/workspace/consents/consent-demo/verify',{identity_checked:true,information_checked:true,note:'Verifica fittizia'});
 demoSignIn('paziente');await call('/workspace/consents/consent-demo/revoke',{});const saved=state().care_consents[0];assert.equal(saved.status,'revoked');assert.equal(saved.information,original);assert.equal(saved.decision.information_version,'1.0');assert.ok(saved.verification);assert.ok(saved.events.length>=6);
});

test('patient may refuse despite unanswered questions and without acceptance declarations',async()=>{
 await call('/workspace/consents/consent-demo/question',{question:'Chiarimento in sospeso'});
 const r=await call('/workspace/consents/consent-demo/decision',decision({decision:'refused',informed:false,understood:false}));assert.equal(r.status,200);assert.equal(r.body.status,'refused');
 demoSignIn('medico');assert.equal((await call('/workspace/consents/consent-demo/verify',{identity_checked:true,information_checked:true,note:'Non può trasformare un rifiuto'})).status,403);
});

test('video consent needs recording permission and evidence is scoped to patient and physician',async()=>{
 assert.equal((await call('/workspace/consents/consent-demo/decision',decision({method:'video'}))).status,400);
 const r=await call('/workspace/consents/consent-demo/decision',decision({method:'video',video_blob_id:'video-local',video_sha256:'b'.repeat(64),video_mime_type:'video/webm',recording_authorized:true}));assert.equal(r.status,200);const evidence=r.body.evidence[0];assert.equal(evidence.blob_id,'video-local');
 demoSignIn('infermiere');assert.deepEqual((await workspace()).consents[0].evidence,[]);assert.equal((await call('/workspace/consents/consent-demo/evidence',{evidence_id:evidence.id})).status,403);
 demoSignIn('medico');assert.equal((await call('/workspace/consents/consent-demo/evidence',{evidence_id:evidence.id})).status,200);
});

test('self-care drafts require publication and caregiver sharing is selective',async()=>{
 demoSignIn('medico');const d=(await call('/workspace/education',{patient_id:patient,title:'Preparazione del colloquio',body:'Istruzioni di fantasia',condition:'Percorso',family_visible:false})).body;
 demoSignIn('paziente');assert.ok(!(await workspace()).education.some(e=>e.id===d.id));
 demoSignIn('medico');await call(`/workspace/education/${d.id}/publish`,{});
 demoSignIn('paziente');assert.ok((await workspace()).education.some(e=>e.id===d.id));await call(`/workspace/education/${d.id}/progress`,{});assert.ok((await workspace()).progress.some(p=>p.resource_id===d.id));
 demoSignIn('caregiver');assert.ok(!(await workspace()).education.some(e=>e.id===d.id));assert.equal((await call(`/workspace/education/${d.id}/progress`,{})).status,400);
});

test('suspension or expiry immediately removes the assigned professional access',async()=>{
 demoSignIn('infermiere');assert.equal((await call('/workspace/team/team-giulia-fisio',{active:false})).status,403);
 demoSignIn('medico');await call('/workspace/team/team-giulia-fisio',{active:false,expires_at:null});
 demoSignIn('fisioterapista');assert.equal((await workspace()).patient,null);assert.equal((await call('/workspace/diary',diary())).status,403);
 demoSignIn('medico');await call('/workspace/team/team-giulia-fisio',{active:true,expires_at:new Date(Date.now()-60000).toISOString()});
 demoSignIn('fisioterapista');assert.equal((await workspace()).patient,null);
 demoSignIn('medico');await call('/workspace/team/team-giulia-fisio',{active:true,expires_at:null});
 demoSignIn('fisioterapista');assert.equal((await workspace()).patient.id,patient);
});

test('booking remains available while clinical handoff requires the assigned physician',async()=>{
 const providers=await call('/booking/providers');assert.ok(providers.body.length>0);const slot=providers.body[0].next_slots[0];
 const a=(await call('/booking/appointments',{slot_id:slot.id,care_access_approved:true})).body;assert.equal(a.status,'confirmed');
 assert.equal((await call(`/booking/appointments/${a.id}/care-handoff`,{})).status,403);
 demoSignIn('admin');assert.equal((await call(`/booking/appointments/${a.id}/care-handoff`,{})).status,403);
 demoSignIn('medico');const taken=await call(`/booking/appointments/${a.id}/care-handoff`,{});assert.equal(taken.status,200);assert.equal(taken.body.patient_id,patient);const count=state().visits.length;await call(`/booking/appointments/${a.id}/care-handoff`,{});assert.equal(state().visits.length,count);
});
