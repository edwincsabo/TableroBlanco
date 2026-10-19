import {test,expect,_electron as electron} from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
const applications:any[]=[];
const launch=async(data:string,extra:string[]=[])=>electron.launch({...(process.env.TABLERO_EXECUTABLE?{executablePath:process.env.TABLERO_EXECUTABLE,args:extra}:{args:['.',...extra]}),env:{...process.env,TABLERO_TEST_DATA:data,ELECTRON_RUN_AS_NODE:undefined} as any});
test.afterEach(async()=>{for(const application of applications.splice(0))await application.close().catch(()=>{});});
test('flujo Windows: crear, editar, guardar, reiniciar y recuperar un tablero sin red',async()=>{
  const data=path.resolve('.local-test',`ui-${Date.now()}`);await fs.mkdir(data,{recursive:true});
  const app=await launch(data);applications.push(app);
  const page=await app.firstWindow();const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**/*',route=>route.abort());
  await expect(page.getByRole('heading',{name:'Dale espacio a tus ideas.'})).toBeVisible();
  await page.screenshot({path:'.local-test/01-biblioteca.png',fullPage:true});
  await page.getByRole('button',{name:'Crear un tablero',exact:true}).click();
  await expect(page.getByLabel('Nombre del tablero')).toBeVisible();
  await page.getByLabel('Nombre del tablero').fill('Proyecto de prueba');
  await page.getByRole('button',{name:'Notas adhesivas',exact:true}).click();
  await page.getByLabel('Contenido de la nota').fill('Una idea que debe sobrevivir al reinicio');
  await page.getByRole('button',{name:'Añadir nota',exact:true}).click();
  await page.getByRole('button',{name:'Cerrar panel',exact:true}).click();
  await page.getByRole('button',{name:'Buscar en el tablero',exact:true}).click();
  await page.getByLabel('Buscar texto en lienzo').fill('sobrevivir');
  await expect(page.getByText('1 resultados', {exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Cerrar panel',exact:true}).click();
  await page.screenshot({path:'.local-test/02-editor.png',fullPage:true});
  await expect.poll(async()=>{const names=await fs.readdir(path.join(data,'tableros'));for(const n of names.filter(n=>n.endsWith('.json'))){const b=JSON.parse(await fs.readFile(path.join(data,'tableros',n),'utf8'));if(b.name==='Proyecto de prueba')return b.scene.elements.some((e:any)=>e.text?.includes('sobrevivir'))}return false}).toBe(true);
  await page.getByRole('button',{name:'Volver a mis tableros',exact:true}).click();
  await expect(page.getByRole('button',{name:'Abrir Proyecto de prueba'})).toBeVisible();
  await app.close();
  const next=await launch(data);applications.push(next);
  const reopened=await next.firstWindow();await reopened.route('https://**/*',route=>route.abort());
  await reopened.getByRole('button',{name:'Abrir Proyecto de prueba'}).click();
  await reopened.getByRole('button',{name:'Buscar en el tablero',exact:true}).click();await reopened.getByLabel('Buscar texto en lienzo').fill('sobrevivir');await expect(reopened.getByText('1 resultados',{exact:true})).toBeVisible();
  await reopened.getByRole('button',{name:'Cerrar panel',exact:true}).click();
  await reopened.getByRole('button',{name:'Opciones del tablero',exact:true}).click();
  await reopened.getByRole('button',{name:'Alternar cuadrícula',exact:true}).click();
  await reopened.getByRole('button',{name:'Guardar como plantilla',exact:true}).click();await expect(reopened.getByRole('status').filter({hasText:'Plantilla guardada'})).toBeVisible();
  await reopened.getByRole('button',{name:'Cerrar panel',exact:true}).click();
  await reopened.getByRole('button',{name:'Volver a mis tableros',exact:true}).click();
  await expect(reopened.getByRole('button',{name:'Abrir Proyecto de prueba',exact:true})).toBeVisible();await reopened.getByRole('button',{name:'Plantillas',exact:true}).click();await reopened.getByRole('button',{name:'Categoría Mis plantillas',exact:true}).click();await expect(reopened.getByText('Mi plantilla',{exact:true})).toBeVisible();
  await next.close();assertNoErrors(errors);
});
function assertNoErrors(errors:string[]){expect(errors).toEqual([])}

test('abrir un archivo desde Windows y cerrar con cambios pendientes',async()=>{
  const data=path.resolve('.local-test',`opening-${Date.now()}`);await fs.mkdir(data,{recursive:true});const documentPath=path.join(data,'entrada.tablero');await fs.writeFile(documentPath,JSON.stringify({format:'tableroblanco',name:'Desde un archivo',scene:{elements:[],appState:{viewBackgroundColor:'#ffffff'},files:{}}}));
  const app=await launch(data,[documentPath]);applications.push(app);const page=await app.firstWindow();await expect(page.getByLabel('Nombre del tablero')).toHaveValue('Desde un archivo');
  await page.getByRole('button',{name:'Notas adhesivas',exact:true}).click();await page.getByLabel('Contenido de la nota').fill('Guardado al cerrar la ventana');await page.getByRole('button',{name:'Añadir nota',exact:true}).click();
  const closed=app.waitForEvent('close');await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].close());await closed;
  const next=await launch(data);applications.push(next);const reopened=await next.firstWindow();await reopened.getByRole('button',{name:'Abrir Desde un archivo',exact:true}).click();await reopened.getByRole('button',{name:'Buscar en el tablero',exact:true}).click();await reopened.getByLabel('Buscar texto en lienzo').fill('Guardado al cerrar');await expect(reopened.getByText('1 resultados',{exact:true})).toBeVisible();await next.close();
});

test('plantillas, resaltador, temporizador, copias de seguridad y papelera',async()=>{
  const data=path.resolve('.local-test',`features-${Date.now()}`);await fs.mkdir(data,{recursive:true});const app=await launch(data);applications.push(app);const page=await app.firstWindow();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await app.evaluate(({dialog},folder)=>{dialog.showSaveDialog=(async(_window:any,options:any)=>({canceled:false,filePath:folder+'/'+options.defaultPath})) as any},data);
  await page.getByRole('button',{name:'Kanban personal Planificación',exact:false}).click();await expect(page.getByLabel('Nombre del tablero')).toHaveValue('Kanban personal');
  await page.getByRole('button',{name:'Buscar en el tablero',exact:true}).click();await page.getByLabel('Buscar texto en lienzo').fill('Por hacer');await expect(page.getByText('1 resultados',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Cerrar panel',exact:true}).click();
  await page.getByRole('button',{name:'Lápices y resaltador',exact:true}).click();await page.getByRole('button',{name:'Resaltador',exact:true}).click();
  await page.mouse.move(700,350);await page.mouse.down();await page.mouse.move(820,375,{steps:20});await page.mouse.up();
  await page.getByRole('button',{name:'Temporizador',exact:true}).click();await page.getByLabel('Duración en minutos').fill('1');await page.getByRole('button',{name:'Iniciar',exact:true}).click();await expect(page.getByRole('button',{name:'Pausar',exact:true})).toBeVisible();await page.getByRole('button',{name:'Pausar',exact:true}).click();await page.getByRole('button',{name:'Reiniciar temporizador',exact:true}).click();await page.getByRole('button',{name:'Cerrar panel',exact:true}).click();
  await page.getByRole('button',{name:'Volver a mis tableros',exact:true}).click();await page.getByRole('button',{name:'Configuración',exact:true}).first().click();await page.getByRole('button',{name:'Oscuro',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.getByRole('button',{name:'Crear copia de seguridad completa',exact:true}).click();await expect(page.getByText('Copia de seguridad guardada.',{exact:true})).toBeVisible();
  const backupName=(await fs.readdir(data)).find(name=>name.startsWith('TableroBlanco-respaldo-'))!;const backupPath=path.join(data,backupName);const backup=JSON.parse(await fs.readFile(backupPath,'utf8'));expect(backup.boards).toHaveLength(2);const kanban=backup.boards.find((b:any)=>b.name==='Kanban personal');expect(kanban.scene.elements.some((e:any)=>e.type==='freedraw'&&e.opacity===30)).toBe(true);
  await page.locator('input[type=file][accept=".json"]').setInputFiles(backupPath);await expect(page.getByText('2 tableros restaurados como copias.',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  await expect(page.getByRole('button',{name:'Abrir Kanban personal',exact:true})).toHaveCount(2);await page.getByRole('button',{name:'Opciones de Kanban personal',exact:true}).first().click();await page.getByRole('button',{name:'Mover a papelera',exact:true}).click();await page.getByRole('button',{name:'Papelera',exact:true}).click();await expect(page.getByRole('heading',{name:/^Papelera/})).toBeVisible();await expect(page.getByRole('button',{name:'Opciones de Kanban personal',exact:true})).toBeVisible();await page.getByRole('button',{name:'Opciones de Kanban personal',exact:true}).click();await page.getByRole('button',{name:'Restaurar',exact:true}).click();await expect(page.getByText('La papelera está vacía',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:/Mis tableros/}).click();await page.screenshot({path:'.local-test/04-tema-oscuro.png',fullPage:true});await app.close();assertNoErrors(errors);
});

test('imágenes, páginas PDF, exportación en cuatro formatos e importación editable',async()=>{
  const data=path.resolve('.local-test',`formats-${Date.now()}`);await fs.mkdir(data,{recursive:true});
  const {jsPDF}=await import('jspdf');const document=new jsPDF();document.text('Documento de prueba sin conexión',20,30);document.addPage();document.text('Segunda página',20,30);const pdfPath=path.join(data,'entrada.pdf');await fs.writeFile(pdfPath,new Uint8Array(document.output('arraybuffer')));
  const app=await launch(data);const page=await app.firstWindow();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  applications.push(app);
  await app.evaluate(({dialog},folder)=>{dialog.showSaveDialog=(async(_window:any,options:any)=>({canceled:false,filePath:folder+'/'+options.defaultPath})) as any},data);
  await page.getByRole('button',{name:'Crear un tablero',exact:true}).click();await page.getByLabel('Nombre del tablero').fill('Formatos');
  await page.locator('input[type=file][accept^="image/png"]').setInputFiles(path.resolve('build/icon.png'));
  await expect(page.getByText('Insertando imágenes…',{exact:true})).not.toBeVisible();
  await page.locator('input[type=file][accept="application/pdf"]').setInputFiles(pdfPath);
  await expect(page.getByRole('dialog',{name:'Insertar páginas PDF'})).toBeVisible();await page.getByLabel('Páginas del PDF').fill('1-2');await page.getByRole('button',{name:'Insertar páginas',exact:true}).click();await expect(page.getByRole('dialog',{name:'Insertar páginas PDF'})).not.toBeVisible().catch(async error=>{throw new Error(error.message+'\n'+(await page.locator('.toast').allTextContents()).join('\n'))});
  await expect(page.getByText('Páginas insertadas. Puedes dibujar y escribir sobre ellas.',{exact:true})).toBeVisible();
  for(const label of ['Tablero editable','Imagen PNG','Imagen vectorial','Documento PDF']){await page.getByRole('button',{name:'Exportar',exact:true}).click();await page.getByRole('button',{name:new RegExp(label)}).click();await expect(page.getByText('Preparando exportación…',{exact:true})).not.toBeVisible();}
  await expect.poll(async()=>{return (await fs.readdir(data)).filter(n=>/^Formatos\.(tablero|png|svg|pdf)$/.test(n)).length}).toBe(4);
  const editable=JSON.parse(await fs.readFile(path.join(data,'Formatos.tablero'),'utf8'));expect(editable.scene.elements.filter((e:any)=>e.type==='image')).toHaveLength(3);expect(Object.keys(editable.scene.files)).toHaveLength(3);
  expect((await fs.readFile(path.join(data,'Formatos.pdf'))).subarray(0,4).toString()).toBe('%PDF');expect((await fs.readFile(path.join(data,'Formatos.png'))).subarray(1,4).toString()).toBe('PNG');expect(await fs.readFile(path.join(data,'Formatos.svg'),'utf8')).toContain('<svg');
  await app.evaluate(({dialog},filename)=>{dialog.showOpenDialog=(async()=>({canceled:false,filePaths:[filename]})) as any},path.join(data,'Formatos.tablero'));
  await page.getByRole('button',{name:'Volver a mis tableros',exact:true}).click();await page.getByRole('button',{name:'Importar',exact:true}).click();await expect(page.getByLabel('Nombre del tablero')).toHaveValue('Formatos');
  await page.getByRole('button',{name:'Volver a mis tableros',exact:true}).click();await expect(page.getByRole('button',{name:'Abrir Formatos',exact:true})).toHaveCount(2);
  await page.screenshot({path:'.local-test/03-importacion.png',fullPage:true});await app.close();assertNoErrors(errors);
});
