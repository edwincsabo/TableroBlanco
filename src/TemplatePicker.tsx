import {t as tr} from './i18n';
import {useState} from 'react';
import {Search,Star,LayoutTemplate,Lightbulb,Puzzle,ScanSearch,ChartNoAxesCombined,CalendarDays,History,Trophy,Wrench,GraduationCap,Grid2X2,X,ArrowUpRight} from 'lucide-react';
import {templateCatalog,categories,getTemplateScene,normalizeSearch,type CatalogTemplate} from './templateCatalog';
import type {Scene,Board} from './types';
import {useLocale} from './i18n';
const icons=[Lightbulb,Puzzle,ScanSearch,ChartNoAxesCombined,CalendarDays,History,Trophy,Wrench,GraduationCap];

function ScenePreview({template}:{template:CatalogTemplate}){
  const scene=getTemplateScene(template);
  const elements=scene.elements.filter(e=>!e.isDeleted);
  const minX=Math.min(...elements.map(e=>e.x)),minY=Math.min(...elements.map(e=>e.y));
  const maxX=Math.max(...elements.map(e=>e.x+e.width)),maxY=Math.max(...elements.map(e=>e.y+e.height));
  return <svg className="template-scene-preview" aria-hidden="true" viewBox={`${minX-30} ${minY-30} ${maxX-minX+60} ${maxY-minY+60}`}>
    {elements.map(e=>{
      const fill=!e.backgroundColor||e.backgroundColor==='transparent'?'none':e.backgroundColor;
      const style={fill,stroke:e.strokeColor||'none',strokeWidth:e.strokeWidth||1,opacity:(e.opacity??100)/100};
      if(e.type==='rectangle')return <rect key={e.id} x={e.x} y={e.y} width={e.width} height={e.height} rx={e.roundness?12:0} {...style}/>;
      if(e.type==='ellipse')return <ellipse key={e.id} cx={e.x+e.width/2} cy={e.y+e.height/2} rx={e.width/2} ry={e.height/2} {...style}/>;
      if(e.type==='text')return <text key={e.id} x={e.x} y={e.y} fill={e.strokeColor} fontFamily="Segoe UI, Arial, sans-serif" fontSize={e.fontSize} dominantBaseline="hanging">{String(e.text).split('\n').map((row,i)=><tspan key={i} x={e.x} dy={i?e.fontSize*(e.lineHeight||1.25):0}>{row}</tspan>)}</text>;
      if(e.points)return <polyline key={e.id} points={e.points.map((pt:number[])=>`${e.x+pt[0]},${e.y+pt[1]}`).join(' ')} {...style} fill={fill}/>;
      return null;
    })}
  </svg>;
}
export default function TemplatePicker({custom,onChoose}:{custom:Board[];onChoose:(name:string,scene:Scene)=>void}){
  useLocale();
  const [category,setCategory]=useState('recommended');const [search,setSearch]=useState('');
  const query=normalizeSearch(search);
  const matches=(t:CatalogTemplate)=>normalizeSearch([tr(t.name),tr(t.description),tr(t.category),t.name,t.description,t.category,...(t.keywords||[])].join(' ')).includes(query);
  const visible=templateCatalog.filter(t=>query?matches(t):category==='all'||(category==='recommended'?t.recommended:t.categoryId===category));
  const own=custom.filter(t=>!query||normalizeSearch(t.name).includes(query));
  const showOwn=category==='mine'||!!query;
  const count=visible.length+(showOwn?own.length:0);
  const selected=categories.find(c=>c.id===category);
  const title=query?tr("Resultados de búsqueda"):category==='mine'?tr("Mis plantillas"):category==='all'?tr("Todas las plantillas"):(selected?tr(selected.name):undefined)||tr("Recomendado");
  const description=query?tr("Coincidencias para «{0}» en toda la biblioteca.", [search.trim()]):category==='mine'?tr("Tus diseños guardados, listos para reutilizar."):category==='recommended'?tr("Puntos de partida para aprender, planificar y explorar."):(selected?tr(selected.description):undefined)||tr("Encuentra una estructura para cada forma de pensar.");
  function select(id:string){setCategory(id);setSearch('');}
  return <div className="template-browser">
    <nav className="template-categories" aria-label={tr("Categorías de plantillas")}>
      {[{id:'recommended',label:tr("Recomendado"),Icon:Star,count:templateCatalog.filter(t=>t.recommended).length},{id:'all',label:tr("Todas las plantillas"),Icon:Grid2X2,count:templateCatalog.length},{id:'mine',label:tr("Mis plantillas"),Icon:LayoutTemplate,count:custom.length}].map(({id,label,Icon,count})=><button key={id} aria-label={tr("Categoría {0}", [label])} aria-pressed={category===id&&!query} className={category===id&&!query?'selected':''} onClick={()=>select(id)}><Icon size={17}/><span>{label}</span><small>{count}</small></button>)}
      <hr/>
      {categories.map((c,i)=>{const Icon=icons[i];return <button key={c.id} aria-label={tr("Categoría {0}", [tr(c.name)])} aria-pressed={category===c.id&&!query} className={category===c.id&&!query?'selected':''} onClick={()=>select(c.id)}><Icon size={17}/><span>{tr(c.name)}</span><small>{templateCatalog.filter(t=>t.categoryId===c.id).length}</small></button>})}
      <p className="template-local-note">{tr("Todas las plantillas funcionan sin conexión.")}</p>
    </nav>
    <div className="template-content">
      <label className="template-search"><Search size={18}/><input aria-label={tr("Buscar en todas las plantillas")} placeholder={tr("Buscar en todas las plantillas...")} value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button className="icon-btn" title={tr("Limpiar búsqueda")} aria-label={tr("Limpiar búsqueda de plantillas")} onClick={()=>setSearch('')}><X size={16}/></button>}</label>
      <div className="template-results-header"><div><h2>{title}</h2><p>{description}</p></div><span aria-live="polite">{tr('{0} plantillas',[category==='mine'&&!query?own.length:count])}</span></div>
      <div className="template-grid">
        {category!=='mine'||query?visible.map(t=><button key={t.id} className="template-card catalog-card" aria-label={tr("Usar plantilla {0}", [tr(t.name)])} data-template-id={t.id} data-element-count={getTemplateScene(t).elements.length} onClick={()=>onChoose(tr(t.name),structuredClone(getTemplateScene(t)))}><div className="template-preview"><ScenePreview template={t}/></div><span className="eyebrow">{tr(t.category)}</span><strong>{tr(t.name)}</strong><p>{tr(t.description)}</p><ArrowUpRight className="template-arrow" size={17}/></button>):null}
        {showOwn&&own.map(t=><button key={t.id} className="template-card catalog-card" aria-label={tr("Usar mi plantilla {0}", [t.name])} onClick={()=>onChoose(t.name,structuredClone(t.scene))}><div className="template-preview custom">{t.thumbnail?<img src={t.thumbnail} alt=""/>:<LayoutTemplate size={35}/>}</div><span className="eyebrow">{tr("Mi plantilla")}</span><strong>{t.name}</strong><p>{tr("Tu punto de partida personalizado.")}</p></button>)}
      </div>
      {((category==='mine'&&!own.length&&!query)||(query&&!count))&&<div className="template-empty"><LayoutTemplate size={35}/><h3>{query?tr("No encontramos esa plantilla"):tr("Todavía no tienes plantillas propias")}</h3><p>{query?tr("Prueba otro nombre, una categoría o una palabra clave."):tr("En un tablero, abre Opciones del tablero y elige Guardar como plantilla.")}</p>{query&&<button className="secondary" onClick={()=>{setSearch('');setCategory('all')}}>{tr("Ver todas las plantillas")}</button>}</div>}
    </div>
  </div>;
}
