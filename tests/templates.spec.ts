import {test,expect,_electron as electron} from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
const instances:any[]=[];
test.afterEach(async()=>{for(const app of instances.splice(0))await app.close().catch(()=>{});});
async function start(){
  const folder=path.resolve('.local-test',`templates-${Date.now()}`);await fs.mkdir(folder,{recursive:true});
  const app=await electron.launch({...(process.env.TABLERO_EXECUTABLE?{executablePath:process.env.TABLERO_EXECUTABLE,args:[]}:{args:['.']}),env:{...process.env,TABLERO_TEST_DATA:folder,ELECTRON_RUN_AS_NODE:undefined} as any});instances.push(app);
  const page=await app.firstWindow();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));return {app,page,folder,errors};
}

test('57 diseños, nueve categorías, búsqueda global y vistas previas de los objetos reales',async()=>{
  const {page,errors}=await start();await page.getByRole('button',{name:'Plantillas',exact:true}).click();
  await page.getByRole('button',{name:'Categoría Todas las plantillas',exact:true}).click();
  await expect(page.locator('.catalog-card')).toHaveCount(57);
  const summary=await page.locator('.catalog-card').evaluateAll(cards=>cards.map(card=>({id:card.getAttribute('data-template-id'),elements:Number(card.getAttribute('data-element-count')),shapes:card.querySelectorAll('svg.template-scene-preview>*').length,invalid:[...card.querySelectorAll('svg.template-scene-preview [width],svg.template-scene-preview [height]')].some(node=>['width','height'].some(attr=>node.hasAttribute(attr)&&!Number.isFinite(Number(node.getAttribute(attr)))))})));
  expect(new Set(summary.map(s=>s.id)).size).toBe(57);expect(summary.every(s=>s.elements>0&&s.shapes>0&&!s.invalid)).toBe(true);
  const categories=['Lluvia de ideas','Solución de problemas','Diseño e investigación','Estrategia','Planificación de proyectos','Retrospectiva','Juegos','Talleres','Aprendizaje'];
  for(const category of categories){await page.getByRole('button',{name:`Categoría ${category}`,exact:true}).click();await expect(page.locator('.catalog-card')).toHaveCount(category==='Aprendizaje'?9:6);}
  await expect(page.getByRole('button',{name:'Usar plantilla Comparar y contrastar',exact:true}).locator('ellipse')).toHaveCount(2);
  await page.screenshot({path:'.local-test/05-plantillas-aprendizaje.png',fullPage:true});
  await page.getByLabel('Buscar en todas las plantillas').fill('ANALISIS');await expect(page.locator('.catalog-card')).toHaveCount(2);await expect(page.getByRole('button',{name:'Usar plantilla Análisis FODA',exact:true})).toBeVisible();
  await page.getByLabel('Buscar en todas las plantillas').fill('un término inexistente 987');await expect(page.getByText('No encontramos esa plantilla',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Limpiar búsqueda de plantillas',exact:true}).click();await expect(page.locator('.catalog-card')).toHaveCount(9);
  await page.getByRole('button',{name:'Categoría Mis plantillas',exact:true}).click();await expect(page.getByText('Todavía no tienes plantillas propias',{exact:true})).toBeVisible();expect(errors).toEqual([]);
});

test('crear desde una plantilla y añadir otra en el editor conserva contenido y relaciones de texto',async()=>{
  const {page,folder,errors}=await start();await page.getByRole('button',{name:'Plantillas',exact:true}).click();await page.getByRole('button',{name:'Categoría Aprendizaje',exact:true}).click();await page.getByRole('button',{name:'Usar plantilla Comparar y contrastar',exact:true}).click();await expect(page.getByLabel('Nombre del tablero')).toHaveValue('Comparar y contrastar');
  await page.getByRole('button',{name:'Notas adhesivas',exact:true}).click();await page.getByLabel('Contenido de la nota').fill('Conservar esta nota al insertar una plantilla');await page.getByRole('button',{name:'Añadir nota',exact:true}).click();await page.getByRole('button',{name:'Cerrar panel',exact:true}).click();
  await page.getByRole('button',{name:'Plantillas',exact:true}).click();const modal=page.getByRole('dialog',{name:'Empieza con una estructura'});await expect(modal).toBeVisible();await modal.getByRole('button',{name:'Categoría Solución de problemas',exact:true}).click();await page.screenshot({path:'.local-test/06-plantillas-editor.png',fullPage:true});await modal.getByRole('button',{name:'Usar plantilla Los cinco porqués',exact:true}).click();await expect(modal).not.toBeVisible();
  await page.getByRole('button',{name:'Buscar en el tablero',exact:true}).click();await page.getByLabel('Buscar texto en lienzo').fill('Conservar esta nota');await expect(page.getByText('1 resultados',{exact:true})).toBeVisible();await page.getByLabel('Buscar texto en lienzo').fill('Causa raíz');await expect(page.getByText('1 resultados',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Cerrar panel',exact:true}).click();await page.getByRole('button',{name:'Volver a mis tableros',exact:true}).click();
  const boards=await Promise.all((await fs.readdir(path.join(folder,'tableros'))).filter(n=>n.endsWith('.json')).map(async n=>JSON.parse(await fs.readFile(path.join(folder,'tableros',n),'utf8'))));const board=boards.find(b=>b.name==='Comparar y contrastar');expect(board.scene.elements.filter((e:any)=>e.type==='ellipse')).toHaveLength(2);
  const ids=new Set(board.scene.elements.map((e:any)=>e.id));expect(ids.size).toBe(board.scene.elements.length);for(const element of board.scene.elements){if(element.containerId)expect(ids.has(element.containerId)).toBe(true);for(const bound of element.boundElements||[])expect(ids.has(bound.id)).toBe(true);}
  expect(errors).toEqual([]);
});
