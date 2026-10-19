import {useEffect,useRef,useState} from 'react';
import {Modal} from './components';
import AISettings from './AISettings';
import {getLocale,t as tr} from './i18n';
import type {AIInfo,AIItem,AISummary} from './types';
import {aiErrorMessage} from './ai';

export default function AIAssistant({items,onClose,onInsert,notify}:{items:AIItem[];onClose:()=>void;onInsert:(result:AISummary)=>void;notify:(message:string,error?:boolean)=>void}){
  const [info,setInfo]=useState<AIInfo|null>(null),[settings,setSettings]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<AISummary|null>(null),[included,setIncluded]=useState<boolean[]>([]);
  const request=useRef<string|null>(null);const alive=useRef(true);
  const [questionText,setQuestionText]=useState('');
  useEffect(()=>{alive.current=true;window.desktop?.aiInfo().then(value=>{if(alive.current)setInfo(value)}).catch(e=>{if(alive.current)setError(aiErrorMessage(e))});return()=>{alive.current=false;if(request.current)window.desktop?.aiCancel(request.current).catch(()=>{})}},[]);
  const profile=info?.providers.find(p=>p.id===info.provider);const total=items.reduce((n,item)=>n+item.text.length,0);
  const valid=items.length>0&&items.length<=60&&total<=20000&&items.every(item=>item.text.length<=6000);
  const questions=questionText.split('\n').map(q=>q.trim()).filter(Boolean);
  const validQuestions=questions.length<=8&&questions.every(q=>q.length<=400);
  const run=async()=>{
    if(!window.desktop||!info?.ready||!valid||busy)return;
    const id=crypto.randomUUID();request.current=id;setBusy(true);setError('');
    try{const answer=await window.desktop.aiAnalyze({items,locale:getLocale(),confirmed:true,configurationRevision:info.revision,requestId:id});if(alive.current){setResult(answer.result);setQuestionText(answer.result.questions.join('\n'));setIncluded(answer.result.tasks.map(()=>true))}}
    catch(e){if(alive.current)setError(aiErrorMessage(e))}
    finally{if(request.current===id)request.current=null;if(alive.current)setBusy(false)}
  };
  const cancel=async()=>{if(request.current)await window.desktop?.aiCancel(request.current).catch(e=>setError(aiErrorMessage(e)))};
  return <Modal wide title={tr('Resumir y proponer tareas')} onClose={onClose}>
    <div className="ai-assistant">
      {settings?<><AISettings notify={notify} onSaved={setInfo}/><button className="secondary" onClick={()=>setSettings(false)}>{tr('Volver al asistente')}</button></>:<>
        {!info?.ready&&<div className="ai-callout"><p>{tr('Configura una clave y activa la IA antes de usar el asistente.')}</p><button className="primary" onClick={()=>setSettings(true)}>{tr('Configurar IA')}</button></div>}
        {info?.ready&&<p className="ai-provider">{tr('Proveedor: {0} · Modelo: {1}',[profile?.name,profile?.model])}<button className="text-btn" disabled={busy} onClick={()=>setSettings(true)}>{tr('Cambiar configuración')}</button></p>}
        {error&&<p className="ai-error" role="alert">{error}</p>}
        {!result?<>
          <p>{tr('Se enviarán únicamente estas {0} notas o textos ({1} caracteres). Revisa la selección antes de continuar.',[items.length,total])}</p>
          {!valid&&<p className="ai-error" role="alert">{tr('Selecciona entre 1 y 60 notas o textos, con un máximo de 6000 caracteres por texto y 20 000 en total. No se analizan imágenes ni páginas PDF.')}</p>}
          <div className="ai-source-list">{items.map(item=><label className="field-label" key={item.id}>{tr('Texto {0}',[item.id])}<textarea readOnly value={item.text} rows={Math.min(5,Math.max(2,item.text.split('\n').length))}/></label>)}</div>
          <p className="small muted">{tr('El texto se procesará fuera de tu equipo según las condiciones del proveedor. OpenRouter puede dirigirlo a otro proveedor de modelos. La solicitud puede generar cargos; no hay reintentos automáticos.')}</p>
          <div className="modal-actions">{busy?<><button className="secondary" onClick={cancel}>{tr('Cancelar análisis')}</button><span role="status">{tr('Analizando selección…')}</span></>:<button className="primary" disabled={!info?.ready||!valid} onClick={run}>{tr('Enviar y analizar')}</button>}</div>
        </>:<>
          <p className="ai-callout">{tr('Propuesta generada por IA: revisa y edita antes de insertarla. Puede contener errores. Las notas originales se conservarán.')}</p>
          <label className="field-label">{tr('Resumen de IA')}<textarea aria-label={tr('Resumen de IA')} rows={5} maxLength={6000} value={result.summary} onChange={e=>setResult({...result,summary:e.target.value})}/></label>
          <h3>{tr('Tareas propuestas')}</h3>
          {!result.tasks.length&&<p className="muted">{tr('No se identificaron tareas en esta selección.')}</p>}
          <div className="ai-task-list">{result.tasks.map((task,i)=><article className="ai-task" key={i}>
            <label className="ai-enable"><input type="checkbox" aria-label={tr('Incluir tarea {0}',[i+1])} checked={included[i]??false} onChange={e=>setIncluded(included.map((v,j)=>j===i?e.target.checked:v))}/><strong>{tr('Tarea {0}',[i+1])}</strong><span className="ai-task-kind">{task.kind==='explicit'?tr('Acción mencionada en las notas'):tr('Sugerencia de IA')}</span></label>
            <label className="field-label">{tr('Título de tarea {0}',[i+1])}<input aria-label={tr('Título de tarea {0}',[i+1])} maxLength={180} value={task.title} onChange={e=>setResult({...result,tasks:result.tasks.map((t,j)=>j===i?{...t,title:e.target.value}:t)})}/></label>
            <label className="field-label">{tr('Detalles de tarea {0}',[i+1])}<textarea aria-label={tr('Detalles de tarea {0}',[i+1])} rows={2} maxLength={1500} value={task.details} onChange={e=>setResult({...result,tasks:result.tasks.map((t,j)=>j===i?{...t,details:e.target.value}:t)})}/></label>
            <p className="small muted">{tr('Textos de origen: {0}',[task.sourceIds.join(', ')])}</p>
          </article>)}</div>
          <label className="field-label">{tr('Preguntas abiertas (una por línea)')}<textarea aria-label={tr('Preguntas abiertas (una por línea)')} rows={3} maxLength={3207} value={questionText} onChange={e=>setQuestionText(e.target.value)}/></label>
          {!validQuestions&&<p className="ai-error">{tr('Usa como máximo ocho preguntas de 400 caracteres cada una.')}</p>}
          <div className="modal-actions"><button className="secondary" onClick={onClose}>{tr('Descartar propuesta')}</button><button className="primary" disabled={!validQuestions||!result.summary.trim()||result.tasks.some((t,i)=>included[i]&&!t.title.trim())} onClick={()=>{onInsert({...result,questions,tasks:result.tasks.filter((_,i)=>included[i])});onClose()}}>{tr('Insertar como nuevas tarjetas')}</button></div>
        </>}
      </>}
    </div>
  </Modal>;
}
