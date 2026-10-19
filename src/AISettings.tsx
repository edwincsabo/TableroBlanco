import {useEffect,useState} from 'react';
import {t as tr} from './i18n';
import type {AIInfo,AIProvider} from './types';
import {aiErrorMessage} from './ai';
const docs={openai:'https://developers.openai.com/api/docs/models',openrouter:'https://openrouter.ai/models',claude:'https://platform.claude.com/docs/en/models/overview'};
export default function AISettings({onSaved,notify}:{onSaved?:(info:AIInfo)=>void;notify:(message:string,error?:boolean)=>void}){
  const [info,setInfo]=useState<AIInfo|null>(null),[provider,setProvider]=useState<AIProvider>('openai'),[model,setModel]=useState(''),[key,setKey]=useState(''),[enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const apply=(value:AIInfo)=>{setInfo(value);setProvider(value.provider);setModel(value.providers.find(p=>p.id===value.provider)!.model);setEnabled(value.enabled);setKey('');onSaved?.(value)};
  useEffect(()=>{let alive=true;window.desktop?.aiInfo().then(value=>{if(alive)apply(value)}).catch(e=>{if(alive)setError(aiErrorMessage(e))});return()=>{alive=false}},[]);
  if(!window.desktop)return <p>{tr('El asistente de IA está disponible en la aplicación de Windows.')}</p>;
  const profile=info?.providers.find(p=>p.id===provider);
  const save=async()=>{setBusy(true);setError('');try{apply(await window.desktop!.aiSave({provider,model,key:key.trim()||undefined,enabled}));notify(tr('Configuración de IA guardada. La clave se verificará al realizar una solicitud.'))}catch(e){setError(aiErrorMessage(e))}finally{setBusy(false)}};
  const forget=async()=>{setBusy(true);setError('');try{apply(await window.desktop!.aiForget(provider));notify(tr('Clave eliminada de este equipo.'))}catch(e){setError(aiErrorMessage(e))}finally{setBusy(false)}};
  const disable=async()=>{if(!info)return;setBusy(true);setError('');try{apply(await window.desktop!.aiSave({provider:info.provider,model:info.providers.find(p=>p.id===info.provider)!.model,enabled:false}));notify(tr('IA desactivada.'))}catch(e){setError(aiErrorMessage(e))}finally{setBusy(false)}};
  return <section className="ai-settings" aria-label={tr('Inteligencia artificial opcional')}>
    <h3>{tr('Inteligencia artificial opcional')}</h3>
    <p className="small muted">{tr('La IA está desactivada por defecto. Solo enviará el texto que selecciones cuando pulses Enviar y analizar. El proveedor puede cobrar por el uso de su API.')}</p>
    {error&&<p className="ai-error" role="alert">{error}</p>}
    {info&&<>
      <label className="field-label">{tr('Proveedor de IA')}<select aria-label={tr('Proveedor de IA')} value={provider} disabled={busy} onChange={e=>{const id=e.target.value as AIProvider;setProvider(id);setModel(info.providers.find(p=>p.id===id)!.model);setKey('');setEnabled(info.enabled&&!!info.providers.find(p=>p.id===id)?.hasKey)}}>{info.providers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label className="field-label">{tr('Modelo de IA')}<input aria-label={tr('Modelo de IA')} value={model} maxLength={200} disabled={busy} onChange={e=>setModel(e.target.value)} spellCheck={false}/></label>
      <p className="small muted">{tr('Usa un modelo de texto compatible con respuestas JSON estructuradas y disponible en tu cuenta. Puedes cambiar el identificador.')}</p>
      <button type="button" className="text-btn" onClick={()=>window.desktop!.external(docs[provider]).catch(e=>notify(String(e),true))}>{tr('Consultar modelos del proveedor')}</button>
      <label className="field-label">{tr('Clave de API')}<input type="password" aria-label={tr('Clave de API')} autoComplete="off" spellCheck={false} maxLength={2048} value={key} disabled={busy||!info.encryptionAvailable} placeholder={profile?.hasKey?tr('Clave guardada; escribe otra para reemplazarla'):tr('Pega aquí la clave de tu proveedor')} onChange={e=>setKey(e.target.value)}/></label>
      <p className="small muted">{profile?.hasKey?tr('Hay una clave cifrada guardada para este proveedor.'):tr('Este proveedor todavía no tiene una clave guardada.')}</p>
      <p className="small muted">{tr('Las claves se cifran para tu usuario de Windows y se guardan fuera de la biblioteca, las exportaciones y los respaldos de tableros. No se muestran de nuevo.')}</p>
      {!info.encryptionAvailable&&<p className="ai-error" role="alert">{tr('El cifrado de Windows no está disponible. No se guardará una clave sin cifrar.')}</p>}
      <label className="ai-enable"><input type="checkbox" checked={enabled} aria-label={tr('Activar IA opcional')} disabled={busy||!info.encryptionAvailable||(!profile?.hasKey&&!key.trim())} onChange={e=>setEnabled(e.target.checked)}/><span>{tr('Activar IA opcional')}</span></label>
      <div className="ai-settings-actions"><button className="primary" disabled={busy||!model.trim()} onClick={save}>{busy?tr('Guardando…'):tr('Guardar configuración de IA')}</button>{info.enabled&&<button className="secondary" disabled={busy} onClick={disable}>{tr('Desactivar IA')}</button>}{profile?.hasKey&&<button className="secondary" disabled={busy} onClick={forget}>{tr('Eliminar clave guardada')}</button>}</div>
    </>}
  </section>;
}
