const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {createAIService,validateResult,buildRequest}=require('../electron/ai.cjs');
const testRoot=path.resolve('.local-test','ai');
const fakeKey='TEST-ONLY-not-a-real-provider-key';
const result=()=>({summary:'Planificar el lanzamiento.',tasks:[{title:'Preparar una propuesta',details:'Revisar las notas seleccionadas.',kind:'explicit',sourceIds:['n1']}],questions:['¿Qué falta acordar?']});
const response=(provider,value=result())=>new Response(JSON.stringify(provider==='openai'?{status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}]}:provider==='claude'?{stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify(value)}]}:{choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}]}),{status:200});
function encryption(){const key=crypto.randomBytes(32);return {isEncryptionAvailable:()=>true,encryptString:value=>{const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv),encrypted=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),encrypted])},decryptString:value=>{const decipher=crypto.createDecipheriv('aes-256-gcm',key,value.subarray(0,12));decipher.setAuthTag(value.subarray(12,28));return decipher.update(value.subarray(28),'binary','utf8')+decipher.final('utf8')}}}
async function fixture(task){await fs.mkdir(testRoot,{recursive:true});const root=await fs.mkdtemp(path.join(testRoot,'run-'));try{await task(root)}finally{if(!path.resolve(root).startsWith(testRoot+path.sep))throw Error('Unsafe cleanup');await fs.rm(root,{recursive:true,force:true,maxRetries:5,retryDelay:100})}}
const payload=info=>({items:[{id:'n1',text:'Preparar una propuesta para el lanzamiento.'}],locale:'es',confirmed:true,configurationRevision:info.revision,requestId:crypto.randomUUID()});
async function configure(service,provider='openai'){const info=await service.info();return service.save({provider,model:info.providers.find(p=>p.id===provider).model,key:fakeKey,enabled:true})}

test('IA desactivada por defecto; sin clave, sin activación o sin confirmación no hay red',()=>fixture(async root=>{
  let calls=0;const service=createAIService(root,{safeStorage:encryption(),fetchImpl:async()=>{calls++;return response('openai')}});
  const initial=await service.info();assert.equal(initial.enabled,false);assert.equal(initial.ready,false);assert.equal(calls,0);
  await assert.rejects(()=>service.analyze(payload(initial)),/Configura una clave/);await assert.rejects(()=>service.save({provider:'openai',model:'example',enabled:true}),/Guarda una clave/);
  const saved=await service.save({provider:'openai',model:'gpt-4.1-mini',key:fakeKey,enabled:false});assert.equal(saved.ready,false);
  await assert.rejects(()=>service.analyze(payload(saved)),/Configura una clave/);
  const ready=await configure(service);await assert.rejects(()=>service.analyze({...payload(ready),confirmed:false}),/Confirma/);assert.equal(calls,0);
}));

test('las claves se cifran y nunca regresan en el estado público; reinicio, desactivación y olvido',()=>fixture(async root=>{
  const safeStorage=encryption();const service=createAIService(root,{safeStorage});const ready=await configure(service);
  const raw=await fs.readFile(path.join(root,'ai-settings.json'),'utf8');assert(!raw.includes(fakeKey));assert(!JSON.stringify(ready).includes(fakeKey));assert(!JSON.stringify(ready).includes('encryptedKey'));
  const stored=JSON.parse(raw);assert.equal(safeStorage.decryptString(Buffer.from(stored.profiles.openai.encryptedKey,'base64')),fakeKey);
  const restarted=createAIService(root,{safeStorage});assert.equal((await restarted.info()).ready,true);
  const disabled=await restarted.save({provider:'openai',model:'gpt-4.1-mini',enabled:false});assert(!disabled.ready);assert(disabled.providers[0].hasKey);
  const forgotten=await restarted.forget('openai');assert(!forgotten.providers[0].hasKey);assert(!forgotten.enabled);
}));

test('sin cifrado no guarda claves ni activa la IA',()=>fixture(async root=>{
  const service=createAIService(root,{safeStorage:{isEncryptionAvailable:()=>false}});
  await assert.rejects(()=>configure(service),/sin cifrar/);assert.equal((await service.info()).encryptionAvailable,false);
  await assert.rejects(()=>fs.stat(path.join(root,'ai-settings.json')),{code:'ENOENT'});
}));

for(const provider of ['openai','openrouter','claude'])test(`contrato ${provider}: endpoint, clave, formato, selección exacta y respuesta normalizada`,()=>fixture(async root=>{
  let captured;const service=createAIService(root,{safeStorage:encryption(),fetchImpl:async(url,options)=>{captured={url,options};return response(provider)}});
  const ready=await configure(service,provider);const input=payload(ready);input.items[0].text='Texto elegido. No envíes otras notas.';
  const answer=await service.analyze(input);assert.equal(answer.provider,provider);assert.deepEqual(answer.result,result());
  assert.equal(captured.options.redirect,'error');assert.equal(captured.options.method,'POST');
  const body=JSON.parse(captured.options.body);assert.equal(body.model,ready.providers.find(p=>p.id===provider).model);
  const user=provider==='openai'?body.input[0].content:body.messages.at(-1).content;assert.deepEqual(JSON.parse(user),{notes:input.items});assert(!captured.options.body.includes(fakeKey));
  if(provider==='openai'){assert.equal(captured.url,'https://api.openai.com/v1/responses');assert.equal(captured.options.headers.Authorization,`Bearer ${fakeKey}`);assert.equal(body.store,false);assert.equal(body.text.format.type,'json_schema');assert.equal(body.text.format.strict,true)}
  if(provider==='openrouter'){assert.equal(captured.url,'https://openrouter.ai/api/v1/chat/completions');assert.equal(captured.options.headers.Authorization,`Bearer ${fakeKey}`);assert.equal(body.provider.require_parameters,true);assert.equal(body.response_format.json_schema.strict,true)}
  if(provider==='claude'){assert.equal(captured.url,'https://api.anthropic.com/v1/messages');assert.equal(captured.options.headers['x-api-key'],fakeKey);assert.equal(captured.options.headers['anthropic-version'],'2023-06-01');assert.equal(body.output_config.format.type,'json_schema')}
}));

test('cambiar configuración invalida la vista previa y no envía a otro proveedor sin revisarla',()=>fixture(async root=>{
  let calls=0;const service=createAIService(root,{safeStorage:encryption(),fetchImpl:async()=>{calls++;return response('openai')}});
  const old=await configure(service);await configure(service,'claude');await assert.rejects(()=>service.analyze(payload(old)),/configuración de IA cambió/);assert.equal(calls,0);
}));

test('límites y entradas inválidas se rechazan antes de hacer solicitudes',()=>fixture(async root=>{
  let calls=0;const service=createAIService(root,{safeStorage:encryption(),fetchImpl:async()=>{calls++;return response('openai')}});const info=await configure(service);
  for(const items of [[],[{id:'n1',text:''}],[{id:'n1',text:'a'.repeat(6001)}],[{id:'n1',text:'a'},{id:'n1',text:'b'}],Array.from({length:61},(_,i)=>({id:`n${i+1}`,text:'a'})),Array.from({length:4},(_,i)=>({id:`n${i+1}`,text:'a'.repeat(6000)}))])await assert.rejects(()=>service.analyze({...payload(info),items}));
  await assert.rejects(()=>service.save({provider:'https://untrusted.example',model:'x',key:fakeKey,enabled:true}));assert.equal(calls,0);
}));

test('respuesta mal formada, incompleta o con referencias inventadas no se acepta',()=>fixture(async root=>{
  let mode='foreign';const service=createAIService(root,{safeStorage:encryption(),fetchImpl:async()=>mode==='truncated'?new Response(JSON.stringify({status:'incomplete',output:[]})):mode==='malformed'?new Response('{broken'):response('openai',{...result(),tasks:[{...result().tasks[0],sourceIds:['n99']}]})});const info=await configure(service);
  await assert.rejects(()=>service.analyze(payload(info)),/no válida/);mode='truncated';await assert.rejects(()=>service.analyze(payload(info)),/no completó/);mode='malformed';await assert.rejects(()=>service.analyze(payload(info)),/no válida/);
  assert.throws(()=>validateResult({...result(),tasks:[{...result().tasks[0],extra:'unexpected'}]},new Set(['n1'])));
  assert.throws(()=>validateResult({...result(),tasks:Array(13).fill(result().tasks[0])},new Set(['n1'])));
}));

test('errores del proveedor no revelan claves o contenido y no se reintentan',()=>fixture(async root=>{
  for(const status of [400,401,403,429,500]){
    let calls=0;const service=createAIService(root,{safeStorage:encryption(),fetchImpl:async()=>{calls++;return new Response(`sensitive ${fakeKey} private-note`,{status})}});const info=await configure(service);
    await assert.rejects(()=>service.analyze(payload(info)),error=>!error.message.includes(fakeKey)&&!error.message.includes('private-note'));assert.equal(calls,1);
  }
}));

test('cancelación y análisis simultáneo no insertan resultados ni disparan otra petición',()=>fixture(async root=>{
  let started;const sent=new Promise(resolve=>started=resolve);let calls=0;
  const service=createAIService(root,{safeStorage:encryption(),fetchImpl:async(_url,{signal})=>{calls++;started();return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}))}});const info=await configure(service);const input=payload(info);
  const pending=service.analyze(input);const rejected=assert.rejects(()=>pending,/cancelado/);await sent;await assert.rejects(()=>service.analyze(payload(info)),/en curso/);assert.equal(service.cancel(crypto.randomUUID()),false);assert.equal(service.cancel(input.requestId),true);await rejected;assert.equal(calls,1);
}));

test('tiempo de espera y desconexión usan errores seguros y liberan la solicitud',()=>fixture(async root=>{
  let calls=0;const service=createAIService(root,{safeStorage:encryption(),timeoutMs:15,fetchImpl:async(_url,{signal})=>{calls++;return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error(fakeKey)),{once:true}))}});const info=await configure(service);
  await assert.rejects(()=>service.analyze(payload(info)),/tiempo de espera/);await assert.rejects(()=>service.analyze(payload(info)),/tiempo de espera/);assert.equal(calls,2);
}));

test('cancelar inmediatamente antes de leer la clave impide el envío',()=>fixture(async root=>{
  let calls=0;const service=createAIService(root,{safeStorage:encryption(),fetchImpl:async()=>{calls++;return response('openai')}});const info=await configure(service);const input=payload(info);
  const pending=service.analyze(input);assert.equal(service.cancel(input.requestId),true);await assert.rejects(()=>pending,/cancelado/);assert.equal(calls,0);
}));

test('configuración dañada se conserva y no permite llamadas',()=>fixture(async root=>{
  await fs.writeFile(path.join(root,'ai-settings.json'),'{bad');const service=createAIService(root,{safeStorage:encryption()});await assert.rejects(()=>service.info(),/archivo original/);assert.equal(await fs.readFile(path.join(root,'ai-settings.json'),'utf8'),'{bad');
}));

test('selección de texto respeta etiquetas vinculadas, descartados y contenido privado no seleccionado',async()=>{
  const {selectedAIText,proposalElements}=await import('../src/ai.ts');
  const elements=[{id:'selected-shape',type:'rectangle'},{id:'label',type:'text',containerId:'selected-shape',text:'Seleccionado',x:0,y:1},{id:'private',type:'text',text:'NO ENVIAR',x:0,y:0},{id:'deleted',type:'text',text:'BORRADO',isDeleted:true,x:0,y:0},{id:'image',type:'image',text:'OCR NO PERMITIDO',x:0,y:0}];
  const selected={ 'selected-shape':true,deleted:true,image:true };const input=selectedAIText(elements,selected);assert.deepEqual(input,[{id:'n1',text:'Seleccionado'}]);
  const original=JSON.stringify(elements);const cards=proposalElements(result(),{title:'Propuesta IA',summary:'Resumen',tasks:'Tarea',questions:'Preguntas',explicit:'Mencionada',suggested:'Sugerida',sources:'Origen'});assert.equal(JSON.stringify(elements),original);assert(cards.length>1);assert(cards.some(c=>c.label?.text.includes('Preparar una propuesta')));
});
