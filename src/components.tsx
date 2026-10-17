import {t as tr} from './i18n';
import {X, Check, AlertCircle} from 'lucide-react';
import type {ReactNode} from 'react';
export {default as TemplatePicker} from './TemplatePicker';
export function Logo({small=false}:{small?:boolean}){return <div className={`brand ${small?'small':''}`}><span className="brand-mark"><span/><span/><span/></span>{!small&&<span>Tablero<span className="brand-light">Blanco</span></span>}</div>}
export function Modal({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}){return <div className="modal-shade" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section role="dialog" aria-modal="true" aria-label={title} className={`modal ${wide?'wide':''}`}><header><h2>{title}</h2><button className="icon-btn" title={tr("Cerrar")} aria-label={tr("Cerrar")} onClick={onClose}><X size={20}/></button></header>{children}</section></div>}
export function Toast({message,error=false,onClose}:{message:string;error?:boolean;onClose:()=>void}){return <div role={error?'alert':'status'} className={`toast ${error?'error':''}`}>{error?<AlertCircle size={18}/>:<Check size={18}/>}<span>{message}</span><button className="icon-btn" onClick={onClose} aria-label={tr("Cerrar aviso")}><X size={16}/></button></div>}
