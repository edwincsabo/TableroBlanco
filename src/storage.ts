import {t as tr} from './i18n';
import {get,set,del,keys} from 'idb-keyval';
import type {Board,Scene} from './types';
export const blankScene = ():Scene => ({elements:[],appState:{viewBackgroundColor:'#ffffff',gridSize:null},files:{}});
export const createBoard = (name=tr("Tablero sin título"),scene=blankScene(),isTemplate=false):Board => ({id:crypto.randomUUID(),name,created:Date.now(),updated:Date.now(),favorite:false,deleted:false,isTemplate,scene});
export const storage = {
  async list():Promise<{boards:Board[];errors:string[]}> {
    if(window.desktop)return window.desktop.list();
    const boardKeys=(await keys()).filter(k=>String(k).startsWith('board:'));
    return {boards:(await Promise.all(boardKeys.map(k=>get<Board>(k)))).filter(Boolean) as Board[],errors:[]};
  },
  async save(board:Board) {if(window.desktop)await window.desktop.save(board);else await set(`board:${board.id}`,board);},
  async remove(id:string){if(window.desktop)await window.desktop.remove(id);else await del(`board:${id}`);}
};
export function parseBoard(data:string):Board {
  const value=JSON.parse(data);
  const scene=value.scene || (Array.isArray(value.elements)?{elements:value.elements,appState:value.appState||{},files:value.files||{}}:null);
  if(!scene||!Array.isArray(scene.elements)||!scene.files||typeof scene.files!=='object')throw new Error(tr("El archivo no es un tablero compatible. Usa .tablero o .excalidraw."));
  if(scene.elements.some((e:any)=>!e||typeof e.id!=='string'||typeof e.type!=='string'||!Number.isFinite(e.x)||!Number.isFinite(e.y)))throw new Error(tr("El archivo contiene elementos inválidos."));
  return createBoard(typeof value.name==='string'?value.name.slice(0,200):tr("Tablero importado"),{...scene,appState:{...scene.appState,collaborators:new Map()}});
}
export async function saveFile(name:string,data:Blob|string,kind:string) {
  if(window.desktop) return window.desktop.saveFile({name,kind,data:typeof data==='string'?data:Array.from(new Uint8Array(await data.arrayBuffer()))});
  const blob=typeof data==='string'?new Blob([data],{type:'application/json'}):data;
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);return true;
}
