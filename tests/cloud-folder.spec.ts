import {test,expect,_electron as electron} from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const applications:any[]=[];
const launch=async(data:string)=>{
  const app=await electron.launch({...(process.env.TABLERO_EXECUTABLE?{executablePath:process.env.TABLERO_EXECUTABLE,args:[]}:{args:['.']}),env:{...process.env,TABLERO_TEST_DATA:data,ELECTRON_RUN_AS_NODE:undefined} as any});applications.push(app);return {app,page:await app.firstWindow()};
};
test.afterEach(async()=>{for(const app of applications.splice(0))await app.close().catch(()=>{})});
async function boards(folder:string){return Promise.all((await fs.readdir(folder)).filter(n=>n.endsWith('.json')).map(async name=>({file:path.join(folder,name),board:JSON.parse(await fs.readFile(path.join(folder,name),'utf8'))})))}

test('carpeta sincronizada: migración, cambios externos, conflicto, reinicio y desconexión',async()=>{
  const root=path.resolve('.local-test',`cloud-ui-${Date.now()}`),profile=path.join(root,'profile'),cloud=path.join(root,'OneDrive','TableroBlanco');
  await fs.mkdir(profile,{recursive:true});await fs.mkdir(cloud,{recursive:true});
  const {app,page}=await launch(profile);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.getByRole('button',{name:'Crear un tablero',exact:true}).click();await page.getByLabel('Nombre del tablero').fill('Proyecto sincronizado');
  await page.getByRole('button',{name:'Volver a mis tableros',exact:true}).click();
  await app.evaluate(({dialog},folder)=>{dialog.showOpenDialog=(async()=>({canceled:false,filePaths:[folder]})) as any},cloud);
  await page.getByRole('button',{name:'Configuración',exact:true}).first().click();await page.getByRole('button',{name:'Cambiar carpeta',exact:true}).click();
  const confirmation=page.getByRole('dialog',{name:'Cambiar ubicación de los tableros',exact:true});await expect(confirmation).toBeVisible();await expect(confirmation).toContainText(cloud);
  await expect(confirmation).toContainText('2 tableros');await confirmation.getByRole('button',{name:'Copiar y usar carpeta',exact:true}).click();
  await expect(confirmation).not.toBeVisible();await expect(page.getByText('Carpeta actualizada.',{exact:false})).toBeVisible();
  await expect.poll(async()=>JSON.parse(await fs.readFile(path.join(profile,'storage-settings.json'),'utf8')).root).toBe(cloud);
  const info=await page.evaluate(()=>window.desktop!.libraryInfo());expect(info.custom).toBe(true);expect(info.lastBackup).toBeTruthy();
  await expect(page.locator('.library-path').first()).toHaveText(cloud);await page.screenshot({path:'.local-test/08-carpeta-sincronizada.png',fullPage:true});
  await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.getByRole('button',{name:'Abrir Proyecto sincronizado',exact:true}).click();
  await page.getByLabel('Nombre del tablero').fill('Proyecto sincronizado listo');
  await expect.poll(async()=>(await boards(cloud)).some(b=>b.board.name==='Proyecto sincronizado listo')).toBe(true);
  await expect(page.getByText('Guardado en la carpeta',{exact:true})).toBeVisible();
  const original=(await boards(cloud)).find(b=>b.board.name==='Proyecto sincronizado listo')!;
  await fs.writeFile(original.file,JSON.stringify({...original.board,name:'Desde otro equipo',updated:Date.now()}));
  await expect(page.locator('.storage-notice')).toContainText('cambió en la carpeta',{timeout:15000});
  await expect(page.getByLabel('Nombre del tablero')).toHaveValue('Proyecto sincronizado listo');
  await page.getByLabel('Nombre del tablero').fill('Mis cambios locales');
  await page.getByRole('button',{name:'Notas adhesivas',exact:true}).click();await page.getByLabel('Contenido de la nota').fill('Mi contenido se conserva aunque otro equipo guarde');await page.getByRole('button',{name:'Añadir nota',exact:true}).click();await page.getByRole('button',{name:'Cerrar panel',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Se detectó un conflicto');
  await expect.poll(async()=>{const all=await boards(cloud);return all.some(b=>b.board.id!==original.board.id&&b.board.scene.elements.some((e:any)=>e.text?.includes('Mi contenido se conserva')))}).toBe(true);
  expect(JSON.parse(await fs.readFile(original.file,'utf8')).name).toBe('Desde otro equipo');
  await page.getByLabel('Nombre del tablero').fill('Sigo trabajando en mi copia');await page.getByRole('button',{name:'Volver a mis tableros',exact:true}).click();
  await expect(page.getByRole('button',{name:'Abrir Desde otro equipo',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Abrir Sigo trabajando en mi copia',exact:true})).toBeVisible();
  expect((await boards(cloud)).length).toBe(3);
  const remoteNew={...original.board,id:randomUUID(),name:'Nuevo desde otro computador',updated:Date.now()};await fs.writeFile(path.join(cloud,`${remoteNew.id}.json`),JSON.stringify(remoteNew));
  await expect(page.getByRole('button',{name:'Abrir Nuevo desde otro computador',exact:true})).toBeVisible({timeout:15000});
  await fs.rename(cloud,cloud+'-offline');await expect(page.locator('.storage-notice')).toContainText('no está disponible',{timeout:15000});
  await expect.poll(async()=>{try{await fs.stat(cloud);return true}catch{return false}}).toBe(false);
  await fs.rename(cloud+'-offline',cloud);await expect(page.locator('.storage-notice')).not.toBeVisible({timeout:15000});
  await app.close();const restarted=await launch(profile);await expect(restarted.page.getByRole('button',{name:'Abrir Sigo trabajando en mi copia',exact:true})).toBeVisible();
  await restarted.page.getByRole('button',{name:'Configuración',exact:true}).first().click();await restarted.page.getByLabel('Idioma de la aplicación').selectOption('en');await expect(restarted.page.getByRole('button',{name:'Change folder',exact:true})).toBeVisible();
  await restarted.page.getByLabel('Application language').selectOption('zh-CN');await expect(restarted.page.getByRole('button',{name:'更改文件夹',exact:true})).toBeVisible();expect(errors).toEqual([]);
});

test('cancelar la selección o la confirmación deja la biblioteca original intacta',async()=>{
  const root=path.resolve('.local-test',`cloud-cancel-${Date.now()}`),profile=path.join(root,'profile'),cloud=path.join(root,'cloud');await fs.mkdir(profile,{recursive:true});await fs.mkdir(cloud);
  const {app,page}=await launch(profile);await expect(page.getByRole('button',{name:'Abrir Mi primer tablero',exact:true})).toBeVisible();
  await app.evaluate(({dialog})=>{dialog.showOpenDialog=(async()=>({canceled:true,filePaths:[]})) as any});
  await page.getByRole('button',{name:'Configuración',exact:true}).first().click();await page.getByRole('button',{name:'Cambiar carpeta',exact:true}).click();
  await expect(page.getByRole('button',{name:'Cambiar carpeta',exact:true})).toBeEnabled();expect((await fs.readdir(profile)).includes('storage-settings.json')).toBe(false);
  await app.evaluate(({dialog},folder)=>{dialog.showOpenDialog=(async()=>({canceled:false,filePaths:[folder]})) as any},cloud);
  await page.getByRole('button',{name:'Cambiar carpeta',exact:true}).click();await page.getByRole('dialog',{name:'Cambiar ubicación de los tableros',exact:true}).getByRole('button',{name:'Cancelar',exact:true}).click();
  await expect(page.getByRole('button',{name:'Cambiar carpeta',exact:true})).toBeVisible();expect((await fs.readdir(profile)).includes('storage-settings.json')).toBe(false);expect(await fs.readdir(cloud)).toEqual([]);
});
