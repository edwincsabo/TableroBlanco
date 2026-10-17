import {t as tr} from './i18n';
import {useState,useEffect,useRef,useCallback} from 'react';
import Gallery from './Gallery';
import Editor from './Editor';
import {Toast,Modal} from './components';
import {createBoard,storage,parseBoard,saveFile} from './storage';
import {templates} from './templates';
import type {Board,Scene} from './types';
import {useLocale,getLocale,translateNotice} from './i18n';
export default function App(){
  const locale=useLocale();
  useEffect(()=>{document.documentElement.lang=locale;window.desktop?.setLanguage(locale).catch(()=>{});},[locale]);
  const [boards,setBoards]=useState<Board[]>([]);const [active,setActive]=useState<Board|null>(null);const [loaded,setLoaded]=useState(false);const [dark,setDark]=useState(localStorage.getItem('tb-theme')==='dark');const [toast,setToast]=useState<{message:string;error:boolean}|null>(null);const [fatal,setFatal]=useState<string|null>(null);
  const flush=useRef<null|(()=>Promise<void>)>(null);const importInput=useRef<HTMLInputElement>(null);const backupInput=useRef<HTMLInputElement>(null);const initialized=useRef(false);
  const notify=useCallback((message:string,error=false)=>setToast({message:translateNotice(message),error}),[]);
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';localStorage.setItem('tb-theme',dark?'dark':'light')},[dark]);
  useEffect(()=>{if(initialized.current)return;initialized.current=true;(async()=>{try{const result=await storage.list();let initial=result.boards;if(!initial.length&&!result.errors.length){const starter=createBoard(tr("Mi primer tablero"),templates.find(t=>t.id==='welcome')!.make());await storage.save(starter);initial=[starter]}setBoards(initial);if(result.errors.length)setFatal(tr("No se pudieron leer estos archivos: {0}. Se conservaron sin cambios en la carpeta de tableros.", [result.errors.join(', ')]))}catch(e){setFatal(tr("No se pudieron cargar los tableros. {0}", [String(e)]))}finally{setLoaded(true)}})()},[]);
  useEffect(()=>{if(toast&&!toast.error){const timer=setTimeout(()=>setToast(null),5000);return()=>clearTimeout(timer)}},[toast]);
  const persist=useCallback(async(board:Board)=>{await storage.save(board);setBoards(old=>old.some(b=>b.id===board.id)?old.map(b=>b.id===board.id?board:b):[board,...old])},[]);
  const create=async(name?:string,scene?:Scene)=>{try{const board=createBoard(name,scene?structuredClone(scene):undefined);await persist(board);setActive(board)}catch(e){notify(tr("No se pudo crear el tablero: {0}", [String(e)]),true)}};
  const importData=useCallback(async(data:string)=>{try{const board=parseBoard(data);await persist(board);setActive(board);notify(tr("Tablero importado. El archivo original se conserva."))}catch(e){notify(String(e),true)}},[persist,notify]);
  useEffect(()=>loaded?window.desktop?.onOpen(data=>{(async()=>{await flush.current?.();await importData(data)})().catch(e=>notify(String(e),true))}):undefined,[loaded,importData,notify]);
  useEffect(()=>window.desktop?.onClosing(()=>{(async()=>{await flush.current?.();await window.desktop!.closeReady()})().catch(e=>notify(tr("No se pudo guardar antes de cerrar. La aplicación sigue abierta: {0}", [String(e)]),true))}),[notify]);
  const importBoard=async()=>{if(window.desktop){try{const data=await window.desktop.openFile();if(data)await importData(data)}catch(e){notify(String(e),true)}}else importInput.current?.click()};
  const backup=async()=>{try{await flush.current?.();const result=await storage.list();if(result.errors.length)throw new Error(tr("Hay archivos ilegibles. Revisa el aviso antes de crear una copia."));const date=new Date().toISOString().slice(0,10);if(await saveFile(`TableroBlanco-respaldo-${date}.json`,JSON.stringify({format:'tableroblanco-backup',version:1,created:Date.now(),boards:result.boards}),'json'))notify(tr("Copia de seguridad guardada."))}catch(e){notify(tr("No se pudo crear la copia: {0}", [String(e)]),true)}};
  const restore=async(file:File)=>{try{const data=JSON.parse(await file.text());if(data.format!=='tableroblanco-backup'||!Array.isArray(data.boards))throw new Error(tr("Copia de seguridad inválida."));const imported=data.boards.map((b:any)=>{const parsed=parseBoard(JSON.stringify(b));return {...parsed,favorite:!!b.favorite,isTemplate:!!b.isTemplate,deleted:!!b.deleted,thumbnail:typeof b.thumbnail==='string'?b.thumbnail:undefined}});for(const board of imported)await persist(board);notify(tr("{0} tableros restaurados como copias.", [imported.length]))}catch(e){notify(tr("No se pudo restaurar: {0}", [String(e)]),true)}};
  return <>{!loaded?<div className="loading-screen"><div className="loading-spinner"/><h2>{tr("Abriendo tu espacio…")}</h2></div>:active?<Editor key={active.id} board={active} dark={dark} setDark={setDark} templates={boards.filter(b=>b.isTemplate&&!b.deleted)} onPersist={persist} onBack={()=>{flush.current=null;setActive(null)}} registerFlush={handler=>{flush.current=handler}} onImport={importBoard} notify={notify}/>:<Gallery boards={boards} onOpen={setActive} onCreate={create} onUpdate={async b=>{try{await persist({...b,updated:Date.now()})}catch(e){notify(String(e),true)}}} onDelete={async id=>{await storage.remove(id);setBoards(old=>old.filter(b=>b.id!==id));notify(tr("Tablero eliminado."))}} onImport={importBoard} onBackup={backup} onRestore={()=>backupInput.current?.click()} dark={dark} setDark={setDark}/>}
  <input hidden ref={importInput} type="file" accept=".tablero,.excalidraw,.json" onChange={async e=>{const f=e.target.files?.[0];if(f)await importData(await f.text());e.target.value=''}}/>
  <input hidden ref={backupInput} type="file" accept=".json" onChange={async e=>{const f=e.target.files?.[0];if(f)await restore(f);e.target.value=''}}/>
  {toast&&<Toast {...toast} onClose={()=>setToast(null)}/>}{fatal&&<Modal title={tr("Aviso de almacenamiento")} onClose={()=>setFatal(null)}><p>{fatal}</p><button className="primary" onClick={()=>setFatal(null)}>{tr("Entendido")}</button></Modal>}</>
}
