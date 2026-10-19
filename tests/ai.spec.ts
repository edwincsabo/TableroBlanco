import {test,expect,_electron as electron} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
const apps:any[]=[];
const fakeKey='TEST-ONLY-not-a-real-provider-key';
async function launch(profile:string){const app=await electron.launch({...(process.env.TABLERO_EXECUTABLE?{executablePath:process.env.TABLERO_EXECUTABLE,args:[]}:{args:['.']}),env:{...process.env,TABLERO_TEST_DATA:profile,ELECTRON_RUN_AS_NODE:undefined} as any});apps.push(app);return {app,page:await app.firstWindow()}}
test.afterEach(async()=>{for(const app of apps.splice(0))await app.close().catch(()=>{})});
async function addNote(page:any,text:string){await page.getByRole('button',{name:'Notas adhesivas',exact:true}).click();await page.getByLabel('Contenido de la nota').fill(text);await page.getByRole('button',{name:'Añadir nota',exact:true}).click();await page.getByRole('button',{name:'Cerrar panel',exact:true}).click()}

test('IA opcional: clave cifrada, selección privada, vista previa editable, inserción y reinicio',async()=>{
  const profile=path.resolve('.local-test',`ai-ui-${Date.now()}`);await fs.mkdir(profile,{recursive:true});const {app,page}=await launch(profile);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await app.evaluate(()=>{(globalThis as any).aiCaptured=[];(globalThis as any).fetch=async(url:string,options:any)=>{
    (globalThis as any).aiCaptured.push({url,body:JSON.parse(options.body),authorization:options.headers.Authorization});
    const value={summary:'Resumen de prueba a revisar.',tasks:[{title:'Preparar propuesta inicial',details:'Acción tomada del texto seleccionado.',kind:'explicit',sourceIds:['n1']},{title:'Confirmar próximos pasos',details:'Una sugerencia para revisar.',kind:'suggested',sourceIds:['n1']}],questions:['¿Qué falta acordar?']};
    return new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}]}),{status:200});
  }});
  expect((await page.evaluate(()=>window.desktop!.aiInfo())).ready).toBe(false);
  await page.getByRole('button',{name:'Crear un tablero',exact:true}).click();await page.getByLabel('Nombre del tablero').fill('Nombre privado que no se envía');
  await addNote(page,'NO ENVIAR: nota privada fuera de la selección');
  await addNote(page,'Preparar propuesta de lanzamiento. No hay fecha ni responsable acordados.');
  await page.getByRole('button',{name:'Resumir y proponer tareas',exact:true}).click();const assistant=page.getByRole('dialog',{name:'Resumir y proponer tareas',exact:true});
  await expect(assistant.getByRole('button',{name:'Enviar y analizar',exact:true})).toBeDisabled();
  expect(await app.evaluate(()=>(globalThis as any).aiCaptured.length)).toBe(0);
  await expect(assistant).toContainText('estas 1 notas o textos');await expect(assistant.locator('.ai-source-list textarea')).toHaveCount(1);await expect(assistant.locator('.ai-source-list textarea')).toHaveValue('Preparar propuesta de lanzamiento. No hay fecha ni responsable acordados.');
  await assistant.getByRole('button',{name:'Configurar IA',exact:true}).click();await assistant.getByLabel('Clave de API',{exact:true}).fill(fakeKey);await assistant.getByLabel('Activar IA opcional',{exact:true}).check();
  await assistant.getByRole('button',{name:'Guardar configuración de IA',exact:true}).click();await expect(assistant.getByLabel('Clave de API',{exact:true})).toHaveValue('');
  expect(await app.evaluate(()=>(globalThis as any).aiCaptured.length)).toBe(0);
  const stored=await fs.readFile(path.join(profile,'ai-settings.json'),'utf8');expect(stored).not.toContain(fakeKey);expect(JSON.parse(stored).profiles.openai.encryptedKey).toBeTruthy();
  await assistant.getByRole('button',{name:'Volver al asistente',exact:true}).click();await expect(assistant.getByRole('button',{name:'Enviar y analizar',exact:true})).toBeEnabled();
  await expect.poll(async()=>{const stored=await page.evaluate(()=>window.desktop!.list());return stored.boards.find(b=>b.name==='Nombre privado que no se envía')?.scene.elements.some((e:any)=>e.originalText?.includes('Preparar propuesta'))}).toBe(true);
  const before=await page.evaluate(()=>window.desktop!.list());const original=before.boards.find(b=>b.name==='Nombre privado que no se envía')!;
  await assistant.getByRole('button',{name:'Enviar y analizar',exact:true}).click();await expect(assistant.getByLabel('Resumen de IA',{exact:true})).toHaveValue('Resumen de prueba a revisar.');
  const captured=await app.evaluate(()=>(globalThis as any).aiCaptured);expect(captured).toHaveLength(1);expect(captured[0].url).toBe('https://api.openai.com/v1/responses');
  const sent=JSON.stringify(captured[0].body);expect(sent).toContain('Preparar propuesta de lanzamiento');expect(sent).not.toContain('NO ENVIAR');expect(sent).not.toContain('Nombre privado');expect(sent).not.toContain(fakeKey);expect(sent).not.toContain('thumbnail');expect(sent).not.toContain('files');
  const whilePreview=await page.evaluate(()=>window.desktop!.list());expect(whilePreview.boards.find(b=>b.id===original.id)!.scene.elements).toEqual(original.scene.elements);
  await assistant.getByLabel('Resumen de IA',{exact:true}).fill('Resumen revisado por mí');await assistant.getByLabel('Título de tarea 1',{exact:true}).fill('Acción revisada por mí');await assistant.getByLabel('Incluir tarea 2',{exact:true}).uncheck();
  await assistant.getByLabel('Preguntas abiertas (una por línea)',{exact:true}).fill('Pregunta editada\nSegunda pregunta');
  await page.screenshot({path:'.local-test/09-asistente-ia.png',fullPage:true});
  await assistant.getByRole('button',{name:'Insertar como nuevas tarjetas',exact:true}).click();await expect(assistant).not.toBeVisible();
  await page.getByRole('button',{name:'Volver a mis tableros',exact:true}).click();await expect(page.getByRole('button',{name:'Abrir Nombre privado que no se envía',exact:true})).toBeVisible();
  const after=await page.evaluate(()=>window.desktop!.list());const edited=after.boards.find(b=>b.id===original.id)!;const allText=edited.scene.elements.map((e:any)=>e.originalText||e.text||'').join('\n');
  expect(allText).toContain('NO ENVIAR');expect(allText).toContain('Preparar propuesta de lanzamiento');expect(allText).toContain('Resumen revisado');expect(allText).toContain('Acción revisada');expect(allText).not.toContain('Confirmar próximos pasos');expect(JSON.stringify(after)).not.toContain(fakeKey);
  await app.close();const restarted=await launch(profile);const status=await restarted.page.evaluate(()=>window.desktop!.aiInfo());expect(status.ready).toBe(true);expect(JSON.stringify(status)).not.toContain(fakeKey);
  await restarted.page.getByRole('button',{name:'Configuración',exact:true}).first().click();await restarted.page.getByRole('button',{name:'Eliminar clave guardada',exact:true}).click();await expect.poll(()=>restarted.page.evaluate(()=>window.desktop!.aiInfo())).toMatchObject({ready:false,enabled:false});
  expect(JSON.parse(await fs.readFile(path.join(profile,'ai-settings.json'),'utf8')).profiles.openai.encryptedKey).toBeNull();expect(errors).toEqual([]);
});

test('respuesta inválida o clave rechazada conserva el tablero; controles traducidos y tres proveedores',async()=>{
  const profile=path.resolve('.local-test',`ai-errors-${Date.now()}`);await fs.mkdir(profile,{recursive:true});const {app,page}=await launch(profile);
  await page.getByRole('button',{name:'Crear un tablero',exact:true}).click();await addNote(page,'Una nota que debe conservarse');
  await page.getByRole('button',{name:'Resumir y proponer tareas',exact:true}).click();const assistant=page.getByRole('dialog',{name:'Resumir y proponer tareas',exact:true});await assistant.getByRole('button',{name:'Configurar IA',exact:true}).click();
  await expect(assistant.getByLabel('Proveedor de IA',{exact:true}).locator('option')).toHaveCount(3);await assistant.getByLabel('Proveedor de IA',{exact:true}).selectOption('claude');await expect(assistant.getByLabel('Modelo de IA',{exact:true})).toHaveValue('claude-haiku-5-5');
  await assistant.getByLabel('Proveedor de IA',{exact:true}).selectOption('openrouter');await expect(assistant.getByLabel('Modelo de IA',{exact:true})).toHaveValue('openai/gpt-4.1-mini');
  await assistant.getByLabel('Clave de API',{exact:true}).fill(fakeKey);await assistant.getByLabel('Activar IA opcional',{exact:true}).check();await assistant.getByRole('button',{name:'Guardar configuración de IA',exact:true}).click();await expect(assistant.getByLabel('Clave de API',{exact:true})).toHaveValue('');await assistant.getByRole('button',{name:'Volver al asistente',exact:true}).click();
  await app.evaluate(()=>{(globalThis as any).fetch=async()=>new Response('sensitive-provider-body',{status:401})});
  await assistant.getByRole('button',{name:'Enviar y analizar',exact:true}).click();await expect(assistant.getByRole('alert')).toContainText('rechazó la clave');await expect(assistant).not.toContainText('sensitive-provider-body');await expect(assistant.getByRole('button',{name:'Insertar como nuevas tarjetas',exact:true})).not.toBeVisible();
  await app.evaluate(()=>{(globalThis as any).fetch=async()=>new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'not valid JSON'}}]}),{status:200})});
  await assistant.getByRole('button',{name:'Enviar y analizar',exact:true}).click();await expect(assistant.getByRole('alert')).toContainText('no válida');await assistant.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.getByLabel('Idioma de la aplicación',{exact:true}).selectOption('en');await page.getByRole('button',{name:'Summarize and propose tasks',exact:true}).click();await expect(page.getByRole('button',{name:'Send and analyze',exact:true})).toBeVisible();await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.getByLabel('Application language',{exact:true}).selectOption('zh-CN');await page.getByRole('button',{name:'总结并提出任务',exact:true}).click();await expect(page.getByRole('button',{name:'发送并分析',exact:true})).toBeVisible();await page.getByRole('button',{name:'更改设置',exact:true}).click();await expect(page.getByLabel('API 密钥',{exact:true})).toHaveValue('');
  await page.getByRole('button',{name:'停用 AI',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.desktop!.aiInfo())).toMatchObject({enabled:false,ready:false});
});
