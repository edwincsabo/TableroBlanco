import {useSyncExternalStore} from 'react';
import ui from '../shared/ui.json';
import catalog from '../shared/templates.json';
export type Locale='es'|'en'|'zh-CN';
export const languages: {id:Locale;label:string}[]=[{id:'es',label:'Español'},{id:'en',label:'English'},{id:'zh-CN',label:'中文（简体）'}];
const messages:Record<string,string[]>={...catalog,...ui};
const listeners=new Set<()=>void>();
let locale:Locale='es';
try{const saved=localStorage.getItem('tb-language');if(saved==='en'||saved==='zh-CN')locale=saved;}catch{}
export const getLocale=()=>locale;
export const dateLocale=()=>locale==='es'?'es-CO':locale==='en'?'en-US':'zh-CN';
export const canvasLocale=()=>locale==='es'?'es-ES':locale;
function subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener)};}
export const useLocale=()=>useSyncExternalStore(subscribe,getLocale,getLocale);
export function setLocale(value:Locale){
  if(!languages.some(l=>l.id===value))return;
  localStorage.setItem('tb-language',value);locale=value;document.documentElement.lang=value;
  for(const listener of listeners)listener();
}
const interpolate=(value:string,args:readonly unknown[])=>value.replace(/\{(\d+)\}/g,(match,i)=>i<args.length?String(args[i]):match);
export function t(key:string,args:readonly unknown[]=[]):string{
  if(locale==='es')return interpolate(key,args);
  const entry=messages[key];return interpolate(entry?.[locale==='en'?0:1]??key,args);
}
const patterns=Object.entries(messages).filter(([key])=>/\{\d+\}/.test(key)).map(([key,values])=>{
  const chunks=key.split(/(\{\d+\})/);const ids:number[]=[];
  const source=chunks.map(chunk=>{const found=/^\{(\d+)\}$/.exec(chunk);if(found){ids.push(Number(found[1]));return '([\\s\\S]*?)';}return chunk.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('');
  return {pattern:new RegExp(`^${source}$`),ids,values};
});
/** Only called for built-in template text, never for user-authored content. */
export function templateText(value:string):string{
  if(locale==='es')return value;
  if(messages[value])return t(value);
  for(const item of patterns){const found=item.pattern.exec(value);if(found){const args:unknown[]=[];item.ids.forEach((id,i)=>{args[id]=found[i+1]});return interpolate(item.values[locale==='en'?0:1],args);}}
  if(value.includes('\n'))return value.split('\n').map(templateText).join('\n');
  return value;
}
export function translateNotice(value:string){
  const prefix=value.startsWith('Error: ')?'Error: ':'';const content=prefix?value.slice(7):value;
  return prefix+templateText(content);
}
