const DATABASE='vins-care-demo-assets-v2';
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{if(typeof indexedDB==='undefined'){reject(new Error('Archivio locale non disponibile in questo browser.'));return;}const req=indexedDB.open(DATABASE,1);req.onupgradeneeded=()=>req.result.createObjectStore('assets');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(new Error('Non è stato possibile aprire l’archivio locale.'));});}
export async function saveAsset(blob:Blob){
 const bytes=await blob.arrayBuffer();const sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
 const blobId=crypto.randomUUID();const db=await database();
 await new Promise<void>((resolve,reject)=>{const tx=db.transaction('assets','readwrite');tx.objectStore('assets').put(blob,blobId);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('Spazio locale insufficiente o salvataggio non disponibile.'));tx.onabort=()=>reject(new Error('Salvataggio del file interrotto.'));});db.close();return {blob_id:blobId,sha256,mime_type:blob.type,size_bytes:blob.size};
}
export async function loadAsset(blobId:string):Promise<Blob>{const db=await database();const blob=await new Promise<Blob|undefined>((resolve,reject)=>{const req=db.transaction('assets').objectStore('assets').get(blobId);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(new Error('Impossibile leggere il file locale.'));});db.close();if(!blob)throw new Error('Il file non è presente in questo browser. Ripristina la demo o allegalo nuovamente.');return blob;}
export async function deleteAsset(blobId:string){const db=await database();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('assets','readwrite');tx.objectStore('assets').delete(blobId);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('Impossibile rimuovere il file locale.'));});db.close();}
export async function clearAssets(){const db=await database();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('assets','readwrite');tx.objectStore('assets').clear();tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('Impossibile ripristinare l’archivio locale.'));});db.close();}
export async function inspectDiagnostic(file:File){
 if(file.size===0||file.size>10*1024*1024)throw new Error('Scegli un file di prova fino a 10 MB.');
 const header=new Uint8Array(await file.slice(0,12).arrayBuffer());let mime='';
 if(header[0]===0x25&&header[1]===0x50&&header[2]===0x44&&header[3]===0x46&&header[4]===0x2d)mime='application/pdf';
 if(header[0]===0xff&&header[1]===0xd8&&header[2]===0xff)mime='image/jpeg';
 if(header[0]===0x89&&header[1]===0x50&&header[2]===0x4e&&header[3]===0x47&&header[4]===0x0d&&header[5]===0x0a&&header[6]===0x1a&&header[7]===0x0a)mime='image/png';
 if(!mime)throw new Error('Sono ammessi PDF, JPG e PNG. Il contenuto del file deve corrispondere al formato.');
 return new Blob([file],{type:mime});
}
