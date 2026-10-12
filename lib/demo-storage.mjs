// Browser storage can be denied inside embedded pages or private browsing.
// Keep the presentation usable, without treating a failed write as a reset.
const memory=new Map();
const volatileKeys=new Set();
let mode='local';
const local=()=>globalThis.localStorage;
const session=()=>globalThis.sessionStorage;
function remember(key,value){if(value===null)memory.delete(key);else memory.set(key,String(value));}
export const demoStorage={
 getItem(key){
  if(volatileKeys.has(key))return memory.get(key)??null;
  try{const value=session().getItem(key);if(value!==null){remember(key,value);mode='session';return value;}}
  catch{}
  try{const value=local().getItem(key);if(value!==null){remember(key,value);return value;}}
  catch{mode='memory';}
  return memory.get(key)??null;
 },
 setItem(key,value){
  remember(key,value);
  try{local().setItem(key,String(value));volatileKeys.delete(key);mode='local';try{session().removeItem(key);}catch{}return;}
  catch{volatileKeys.add(key);}
  try{session().setItem(key,String(value));mode='session';}catch{mode='memory';}
 },
 removeItem(key){
  remember(key,null);volatileKeys.add(key);
  try{local().removeItem(key);}catch{}
  try{session().removeItem(key);}catch{}
 },
};
export function demoStorageMode(){return mode;}
// Clear only in-memory state when restarting the demonstration or testing.
export function resetStorageAdapter(){memory.clear();volatileKeys.clear();mode='local';}
