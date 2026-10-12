import {demoStorageMode} from './demo-storage.mjs';

export function navigateDemo(href:string,fallback:(url:string)=>void,replace=false){
 if(window.location.pathname+window.location.search===href)return;
 if(demoStorageMode()==='memory'){fallback(href);return;}
 if(replace)window.location.replace(href);else window.location.assign(href);
}
