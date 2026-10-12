import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';
import {demoStorage,demoStorageMode,resetStorageAdapter} from '../lib/demo-storage.mjs';
import {demoFetch,demoSignIn} from '../lib/demo-api.mjs';

const localData=new Map(),sessionData=new Map();
const storage=map=>({getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)});
function blocked(){throw new DOMException('Storage blocked','SecurityError');}
function assignStorage(name,value){Object.defineProperty(globalThis,name,{configurable:true,value,writable:true});}
beforeEach(()=>{localData.clear();sessionData.clear();resetStorageAdapter();assignStorage('localStorage',storage(localData));assignStorage('sessionStorage',storage(sessionData));globalThis.window={dispatchEvent(){},location:{pathname:'/',search:'',assign(){},replace(){}}};});
async function call(path,body){const r=await demoFetch(path,body?{method:'POST',body:JSON.stringify(body)}:{});return {status:r.status,body:await r.json()};}
const require=createRequire(import.meta.url);
function compile(sourcePath){const output=ts.transpileModule(readFileSync(new URL(sourcePath,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;const module={exports:{}};const importer=name=>name.includes('demo-storage')?{demoStorage,demoStorageMode}:name==='next/link'?{default:props=>React.createElement('a',props)}:require(name);new Function('require','exports','module',output)(importer,module.exports,module);return module.exports;}

test('blocked local and session storage do not crash startup, actions or profile switching',async()=>{
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get:blocked});Object.defineProperty(globalThis,'sessionStorage',{configurable:true,get:blocked});
 assert.doesNotThrow(()=>demoSignIn('paziente'));assert.equal(demoStorageMode(),'memory');
 assert.equal((await call('/workspace')).status,200);
 const note=await call('/workspace/diary',{patient_id:'patient-giulia',title:'Prova archivio bloccato',body:'Dato fittizio',setting:'domicilio',occurred_at:new Date().toISOString()});assert.equal(note.status,200);
 demoSignIn('medico');const w=await call('/workspace');assert.ok(w.body.diary.some(d=>d.id===note.body.id));assert.equal(w.body.capabilities.clinician,true);
});

test('full local storage falls back to the session and survives a page restart',async()=>{
 const local=storage(localData);local.setItem('vins-care-presentation-v1','old-invalid-state');local.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError');};assignStorage('localStorage',local);
 demoSignIn('medico');assert.equal(demoStorageMode(),'session');resetStorageAdapter();
 assert.equal(JSON.parse(demoStorage.getItem('loggedUser')).role,'medico');assert.equal((await call('/workspace')).body.patients.length,3);
});

test('corrupt or incomplete saved demo state is recovered instead of breaking the pages',async()=>{
 for(const value of ['broken-json','null',JSON.stringify({care_version:2,users:[],patients:[],providers:[],appointments:[],therapies:[],tasks:[],events:[],visits:[]})]){
  resetStorageAdapter();localData.set('vins-care-presentation-v1',value);demoSignIn('paziente');assert.equal((await call('/workspace')).body.patient.id,'patient-giulia');
 }
 demoStorage.setItem('loggedUser','broken-json');assert.equal((await call('/workspace')).status,401);demoSignIn('paziente');assert.equal((await call('/workspace')).status,200);
});

test('document and diary links are native anchors usable without client route interception',()=>{
 const Link=compile('../components/NavLink.tsx').default;
 for(const href of ['/cartella','/diario','/documenti','/consensi','/monitoraggio','/autocura','/messaggi','/team','/prenotazioni']){
  const element=Link({href,children:'Apri',className:'button'});assert.equal(element.type,'a');assert.equal(element.props.onClick,undefined);assert.equal(element.props.href,href);
  assert.match(renderToStaticMarkup(element),new RegExp('href="'+href+'"'));
 }
});

test('profile and login navigation use the browser while preserving the current page when appropriate',()=>{
 const {navigateDemo}=compile('../lib/demo-navigation.ts');const visited=[];window.location.assign=href=>visited.push(['assign',href]);window.location.replace=href=>visited.push(['replace',href]);const fallback=href=>visited.push(['fallback',href]);
 navigateDemo('/',fallback);assert.equal(visited.length,0);navigateDemo('/diario',fallback);navigateDemo('/login',fallback,true);assert.deepEqual(visited,[['assign','/diario'],['replace','/login']]);
});

test('memory-only navigation preserves the active demonstration through the client router',()=>{
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get:blocked});Object.defineProperty(globalThis,'sessionStorage',{configurable:true,get:blocked});demoSignIn('medico');
 const {navigateDemo}=compile('../lib/demo-navigation.ts');const visited=[];window.location.assign=()=>assert.fail('Must preserve the memory-only demo');navigateDemo('/diario',href=>visited.push(href));assert.deepEqual(visited,['/diario']);
});
