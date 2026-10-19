import {t as tr} from './i18n';
import {useState,useEffect,useRef,useCallback} from 'react';
import Gallery from './Gallery';
import Editor from './Editor';
import {Toast,Modal} from './components';
import {createBoard,storage,parseBoard,saveFile} from './storage';
import {templates} from './templates';
import type {Board,Scene,LibraryInfo} from './types';
import {useLocale,translateNotice} from './i18n';

export default function App(){
  const locale=useLocale();
  useEffect(()=>{document.documentElement.lang=locale;window.desktop?.setLanguage(locale).catch(()=>{});},[locale]);
  const [boards,setBoards]=useState<Board[]>([]);
  const [active,setActive]=useState<Board|null>(null);
  const [loaded,setLoaded]=useState(false);
  const [dark,setDark]=useState(localStorage.getItem('tb-theme')==='dark');
  const [toast,setToast]=useState<{message:string;error:boolean}|null>(null);
  const [fatal,setFatal]=useState<string|null>(null);
  const [library,setLibrary]=useState<LibraryInfo|null>(null);
  const [externalChange,setExternalChange]=useState(false);
  const [folderWarning,setFolderWarning]=useState<string|null>(null);
  const boardsRef=useRef<Board[]>([]);
  const activeId=useRef<string|null>(null);
  const saving=useRef(0);
  const flush=useRef<null|(()=>Promise<void>)>(null);
  const importInput=useRef<HTMLInputElement>(null);
  const backupInput=useRef<HTMLInputElement>(null);
  const initialized=useRef(false);
  const notify=useCallback((message:string,error=false)=>setToast({message:translateNotice(message),error}),[]);
  const replaceBoards=useCallback((items:Board[])=>{boardsRef.current=items;setBoards(items)},[]);
  const openBoard=useCallback((board:Board)=>{activeId.current=board.id;setExternalChange(false);setActive(board)},[]);
  const leaveBoard=useCallback(()=>{flush.current=null;activeId.current=null;setActive(null);setExternalChange(false)},[]);
  const refresh=useCallback(async()=>{
    const result=await storage.list();
    if(saving.current)return;
    const current=boardsRef.current.find(b=>b.id===activeId.current);
    const disk=result.boards.find(b=>b.id===activeId.current);
    if(current&&current.storageRevision!==disk?.storageRevision)setExternalChange(true);
    replaceBoards(result.boards);
    setFolderWarning(result.errors.length?tr('Hay archivos pendientes o ilegibles en la carpeta: {0}. Se conservan sin cambios.',[result.errors.join(', ')]):null);
  },[replaceBoards]);
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';localStorage.setItem('tb-theme',dark?'dark':'light')},[dark]);
  useEffect(()=>{
    if(initialized.current)return;initialized.current=true;
    window.desktop?.libraryInfo().then(setLibrary).catch(()=>{});
    (async()=>{
      try{
        const result=await storage.list();let initial=result.boards;
        if(!initial.length&&!result.errors.length){const starter=createBoard(tr('Mi primer tablero'),templates.find(t=>t.id==='welcome')!.make());initial=[(await storage.save(starter)).board]}
        replaceBoards(initial);
        if(result.errors.length)setFatal(tr('No se pudieron leer estos archivos: {0}. Se conservaron sin cambios en la carpeta de tableros.',[result.errors.join(', ')]));
      }catch(e){setFatal(tr('No se pudieron cargar los tableros. {0}',[String(e)]))}
      finally{setLoaded(true)}
    })();
  },[replaceBoards]);
  useEffect(()=>{
    if(!loaded||!window.desktop)return;
    let timer:ReturnType<typeof setTimeout>|undefined;let stopped=false;
    const update=async()=>{
      if(stopped)return;
      if(saving.current){timer=setTimeout(update,400);return}
      try{await refresh();if(saving.current)timer=setTimeout(update,400)}
      catch{if(!stopped)setFolderWarning(tr('La carpeta de tableros no está disponible. Reconecta el servicio o la unidad; tus archivos no se han eliminado.'))}
    };
    const unsubscribe=window.desktop.onBoardsChanged(update);
    return()=>{stopped=true;clearTimeout(timer);unsubscribe()};
  },[loaded,refresh]);
  useEffect(()=>{if(toast&&!toast.error){const timer=setTimeout(()=>setToast(null),7000);return()=>clearTimeout(timer)}},[toast]);
  const persist=useCallback(async(board:Board)=>{
    saving.current++;
    try{
      const result=await storage.save(board);const saved=result.board;
      replaceBoards(boardsRef.current.some(b=>b.id===saved.id)?boardsRef.current.map(b=>b.id===saved.id?saved:b):[saved,...boardsRef.current]);
      if(activeId.current===board.id){activeId.current=saved.id;setExternalChange(false)}
      if(result.conflict)notify(tr('Se detectó un conflicto. Tus cambios se guardaron como una copia; la versión de la carpeta se conserva.'),true);
      return saved;
    }finally{saving.current--}
  },[replaceBoards,notify]);
  const create=async(name?:string,scene?:Scene)=>{
    try{const board=createBoard(name,scene?structuredClone(scene):undefined);openBoard(await persist(board))}
    catch(e){notify(tr('No se pudo crear el tablero: {0}',[String(e)]),true)}
  };
  const importData=useCallback(async(data:string)=>{
    try{const board=parseBoard(data);openBoard(await persist(board));notify(tr('Tablero importado. El archivo original se conserva.'))}
    catch(e){notify(String(e),true)}
  },[persist,notify,openBoard]);
  useEffect(()=>loaded?window.desktop?.onOpen(data=>{(async()=>{await flush.current?.();await importData(data)})().catch(e=>notify(String(e),true))}):undefined,[loaded,importData,notify]);
  useEffect(()=>window.desktop?.onClosing(()=>{(async()=>{await flush.current?.();await window.desktop!.closeReady()})().catch(e=>notify(tr('No se pudo guardar antes de cerrar. La aplicación sigue abierta: {0}',[String(e)]),true))}),[notify]);
  const importBoard=async()=>{if(window.desktop){try{const data=await window.desktop.openFile();if(data)await importData(data)}catch(e){notify(String(e),true)}}else importInput.current?.click()};
  const backup=async()=>{
    try{
      await flush.current?.();const result=await storage.list();
      if(result.errors.length)throw new Error(tr('Hay archivos ilegibles. Revisa el aviso antes de crear una copia.'));
      const date=new Date().toISOString().slice(0,10);
      if(await saveFile(`TableroBlanco-respaldo-${date}.json`,JSON.stringify({format:'tableroblanco-backup',version:1,created:Date.now(),boards:result.boards}),'json'))notify(tr('Copia de seguridad guardada.'));
    }catch(e){notify(tr('No se pudo crear la copia: {0}',[String(e)]),true)}
  };
  const restore=async(file:File)=>{
    try{
      const data=JSON.parse(await file.text());
      if(data.format!=='tableroblanco-backup'||!Array.isArray(data.boards))throw new Error(tr('Copia de seguridad inválida.'));
      const imported=data.boards.map((b:any)=>{const parsed=parseBoard(JSON.stringify(b));return {...parsed,favorite:!!b.favorite,isTemplate:!!b.isTemplate,deleted:!!b.deleted,thumbnail:typeof b.thumbnail==='string'?b.thumbnail:undefined}});
      for(const board of imported)await persist(board);
      notify(tr('{0} tableros restaurados como copias.',[imported.length]));
    }catch(e){notify(tr('No se pudo restaurar: {0}',[String(e)]),true)}
  };
  return <>
    {(folderWarning||externalChange)&&<div className="storage-notice" role="status">{folderWarning||tr('La versión de este tablero cambió en la carpeta. Al guardar se conservarán ambas versiones; el lienzo abierto no se reemplazará.')}</div>}
    {!loaded?<div className="loading-screen"><div className="loading-spinner"/><h2>{tr('Abriendo tu espacio…')}</h2></div>:active?
      <Editor key={active.id} board={active} customFolder={!!library?.custom} dark={dark} setDark={setDark} templates={boards.filter(b=>b.isTemplate&&!b.deleted)} onPersist={persist} onBack={leaveBoard} registerFlush={handler=>{flush.current=handler}} onImport={importBoard} notify={notify}/>:
      <Gallery boards={boards} onOpen={openBoard} onCreate={create}
        onUpdate={async b=>{try{await persist({...b,updated:Date.now()})}catch(e){notify(String(e),true)}}}
        onDelete={async board=>{try{await storage.remove(board.id,board.storageRevision);replaceBoards(boardsRef.current.filter(b=>b.id!==board.id));notify(tr('Tablero eliminado.'))}catch(e){notify(String(e),true)}}}
        onImport={importBoard} onBackup={backup} onRestore={()=>backupInput.current?.click()} dark={dark} setDark={setDark}
        library={library} onLibraryChanged={async info=>{setLibrary(info);await refresh()}} notify={notify}/>
    }
    <input hidden ref={importInput} type="file" accept=".tablero,.excalidraw,.json" onChange={async e=>{const f=e.target.files?.[0];if(f)await importData(await f.text());e.target.value=''}}/>
    <input hidden ref={backupInput} type="file" accept=".json" onChange={async e=>{const f=e.target.files?.[0];if(f)await restore(f);e.target.value=''}}/>
    {toast&&<Toast {...toast} onClose={()=>setToast(null)}/>}
    {fatal&&<Modal title={tr('Aviso de almacenamiento')} onClose={()=>setFatal(null)}><p>{fatal}</p><button className="primary" onClick={()=>setFatal(null)}>{tr('Entendido')}</button></Modal>}
  </>;
}
