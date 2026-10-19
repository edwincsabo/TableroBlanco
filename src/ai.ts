import type {AIItem,AISummary} from './types';
export const aiErrorMessage=(error:unknown)=>String(error instanceof Error?error.message:error).replace(/^Error invoking remote method 'ai:[^']+': (?:Error: )?/,'').replace(/^Error: /,'');

/** Only text in the explicit selection, including labels bound to selected shapes. */
export function selectedAIText(elements:readonly any[],selected:Record<string,boolean>):AIItem[]{
  return elements.filter(e=>!e.isDeleted&&e.type==='text'&&typeof e.text==='string'&&e.text.trim()&&(selected[e.id]||(e.containerId&&selected[e.containerId])))
    .sort((a,b)=>a.y-b.y||a.x-b.x).map((e,i)=>({id:`n${i+1}`,text:typeof e.originalText==='string'?e.originalText:e.text}));
}
const wrap=(text:string)=>text.split('\n').flatMap(paragraph=>{
  const lines:string[]=[];let line='',width=0;
  for(const word of paragraph.match(/\S+\s*/gu)||[]){
    const units=[...word].reduce((n,c)=>n+(/[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/u.test(c)?2:1),0);
    if(width+units>36&&line){lines.push(line.trimEnd());line='';width=0}
    for(const c of word){const size=/[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/u.test(c)?2:1;if(width+size>36){lines.push(line.trimEnd());line='';width=0}line+=c;width+=size}
  }
  lines.push(line.trimEnd());return lines;
}).join('\n');
export function proposalElements(result:AISummary,labels:{title:string;summary:string;tasks:string;questions:string;explicit:string;suggested:string;sources:string}):any[]{
  const elements:any[]=[{type:'text',x:0,y:-90,text:labels.title,fontSize:30,fontFamily:2,strokeColor:'#243b36'}];
  const card=(value:string,x:number,y:number,color:string)=>{
    const content=wrap(value);const height=Math.max(150,content.split('\n').length*24+60);
    elements.push({type:'rectangle',x,y,width:380,height,backgroundColor:color,strokeColor:'transparent',fillStyle:'solid',roughness:0,roundness:{type:3},label:{text:content,fontSize:18,fontFamily:2,strokeColor:'#243b36',textAlign:'left',verticalAlign:'middle'}});return height+24;
  };
  let summaryY=0;
  const summaryCharacters=[...result.summary];
  for(let i=0;i<summaryCharacters.length;i+=700)summaryY+=card(`${i===0?labels.summary+'\n\n':''}${summaryCharacters.slice(i,i+700).join('')}`,0,summaryY,'#d9e6ff');
  let taskY=0;
  result.tasks.forEach((task,i)=>{taskY+=card(`${labels.tasks} ${i+1} · ${task.kind==='explicit'?labels.explicit:labels.suggested}\n\n${task.title}${task.details?'\n'+task.details:''}\n\n${labels.sources}: ${task.sourceIds.join(', ')}`,420,taskY,'#cdeee3')});
  if(result.questions.length)card(labels.questions+'\n\n'+result.questions.map((q,i)=>`${i+1}. ${q}`).join('\n\n'),840,0,'#fff1a8');
  return elements;
}
