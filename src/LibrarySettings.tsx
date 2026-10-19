import {useState} from 'react';
import {FolderOpen,FolderSync,RotateCcw} from 'lucide-react';
import {Modal} from './components';
import {t as tr} from './i18n';
import type {FolderProposal,LibraryInfo} from './types';

export default function LibrarySettings({info,onChanged,notify}:{info:LibraryInfo|null;onChanged:(info:LibraryInfo)=>Promise<void>;notify:(message:string,error?:boolean)=>void}){
  const [proposal,setProposal]=useState<FolderProposal|null>(null);
  const [busy,setBusy]=useState(false);
  if(!window.desktop)return null;
  const choose=async()=>{
    setBusy(true);
    try{const selected=await window.desktop!.chooseFolder();if(selected?.unchanged)notify(tr('Esta ya es la carpeta de tus tableros.'));else setProposal(selected)}
    catch(error){notify(tr('No se pudo cambiar la carpeta. {0}',[String(error)]),true)}
    finally{setBusy(false)}
  };
  const change=async()=>{
    if(!proposal||busy)return;setBusy(true);
    try{
      const result=await window.desktop!.changeFolder(proposal.token);setProposal(null);await onChanged(result);
      notify(tr('Carpeta actualizada. Se copiaron {0} tableros y se conservaron {1} copias por conflicto.',[result.copied,result.conflicts]));
    }catch(error){setProposal(null);notify(tr('No se pudo cambiar la carpeta. {0}',[String(error)]),true)}
    finally{setBusy(false)}
  };
  return <section className="library-settings" aria-label={tr('Ubicación de los tableros')}>
    <h3>{tr('Ubicación de los tableros')}</h3>
    {info&&<p className="library-path" title={info.path}>{info.path}</p>}
    <p className="small muted">{tr('Elige una carpeta dedicada dentro de OneDrive, Google Drive u otro servicio instalado. El proveedor se encarga de sincronizarla; TableroBlanco guarda los archivos en esa carpeta.')}</p>
    <button className="settings-row" disabled={busy} onClick={choose}><FolderSync size={19}/><span>{busy?tr('Comprobando carpeta…'):tr('Cambiar carpeta')}</span></button>
    <button className="settings-row" disabled={busy||!info} onClick={()=>window.desktop!.dataFolder().catch(e=>notify(String(e),true))}><FolderOpen size={19}/><span>{tr('Abrir carpeta de tableros')}</span></button>
    <button className="settings-row" disabled={busy} onClick={()=>window.desktop!.recoveryFolder().catch(e=>notify(String(e),true))}><RotateCcw size={19}/><span>{tr('Abrir recuperación local')}</span></button>
    <p className="small muted">{tr('Mantén esta carpeta disponible sin conexión. Espera a que termine la sincronización antes de cambiar de equipo. Guardado en la carpeta no significa subido a la nube.')}</p>
    {info?.lastBackup&&<p className="small muted">{tr('La última migración conserva una copia local en: {0}',[info.lastBackup])}</p>}
    {proposal&&<Modal title={tr('Cambiar ubicación de los tableros')} onClose={()=>{if(!busy)setProposal(null)}}>
      <p>{tr('Se copiarán {0} tableros y su historial a esta carpeta:',[proposal.sourceCount])}</p>
      <p className="library-path">{proposal.path}</p>
      <p>{tr('La carpeta de destino contiene {0} tableros. Se conservarán; las versiones diferentes se guardarán como copias.',[proposal.destinationCount])}</p>
      <p>{tr('Se verificará la copia y se creará un respaldo local antes de activar la nueva ubicación. La carpeta original conservará sus archivos; después del cambio, solo la nueva ubicación recibirá tus guardados.')}</p>
      <div className="modal-actions"><button className="secondary" disabled={busy} onClick={()=>setProposal(null)}>{tr('Cancelar')}</button><button className="primary" disabled={busy} onClick={change}>{busy?tr('Copiando y verificando…'):tr('Copiar y usar carpeta')}</button></div>
    </Modal>}
  </section>;
}
