const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {createLibrary}=require('../electron/library.cjs');
const {createStore}=require('../electron/storage.cjs');
const testRoot=path.resolve('.local-test','library');
const board=(id='shared-board',name='Local')=>({id,name,created:1,updated:1,favorite:false,deleted:false,isTemplate:false,scene:{elements:[],appState:{},files:{}}});
async function fixture(task){
  await fs.mkdir(testRoot,{recursive:true});const root=await fs.mkdtemp(path.join(testRoot,'run-'));
  try{const profile=path.join(root,'profile'),cloud=path.join(root,'cloud');await fs.mkdir(profile);await fs.mkdir(cloud);await task({root,profile,cloud})}
  finally{if(!path.resolve(root).startsWith(testRoot+path.sep))throw Error('Unsafe cleanup');await fs.rm(root,{recursive:true,force:true,maxRetries:10,retryDelay:100})}
}

test('migración verificada conserva origen, historial, destino y configuración tras reiniciar',()=>fixture(async({profile,cloud})=>{
  const library=await createLibrary(profile);const initial=(await library.save(board())).board;
  await library.save({...initial,name:'Mi tablero'});const oldRoot=library.info().path;
  const remote=createStore(cloud);await remote.save(board('other-board','Otro equipo'));
  const prepared=await library.prepare(cloud);assert.equal(prepared.sourceCount,1);assert.equal(prepared.destinationCount,1);
  assert.equal(library.info().path,oldRoot);assert.equal(library.info().lastBackup,null);
  const moved=await library.change(cloud);assert.equal(moved.copied,1);assert.equal(moved.conflicts,0);
  assert.equal(JSON.parse(await fs.readFile(path.join(oldRoot,'shared-board.json'),'utf8')).name,'Mi tablero');
  assert.equal(JSON.parse(await fs.readFile(path.join(moved.lastBackup,'shared-board.json'),'utf8')).name,'Mi tablero');
  const history=await library.history('shared-board');assert.equal(history.length,1);assert.equal((await library.readHistory('shared-board',history[0].id)).name,'Local');
  const restarted=await createLibrary(profile);assert.equal(restarted.info().path,await fs.realpath(cloud));assert.equal(restarted.info().custom,true);
  const listed=await restarted.list();assert.deepEqual(listed.boards.map(b=>b.name).sort(),['Mi tablero','Otro equipo']);
  const current=listed.boards.find(b=>b.id==='shared-board');await restarted.save({...current,name:'Después del cambio'});
  assert.equal(JSON.parse(await fs.readFile(path.join(oldRoot,'shared-board.json'),'utf8')).name,'Mi tablero');
}));

test('migrar IDs iguales con contenidos distintos conserva ambas versiones y su historial',()=>fixture(async({profile,cloud})=>{
  const library=await createLibrary(profile);const first=(await library.save(board())).board;await library.save({...first,name:'Cambios locales'});
  await createStore(cloud).save(board('shared-board','Cambios remotos'));
  const result=await library.change(cloud);assert.equal(result.conflicts,1);
  const boards=(await library.list()).boards;assert.equal(boards.length,2);assert.equal(boards.find(b=>b.id==='shared-board').name,'Cambios remotos');
  const local=boards.find(b=>b.id!=='shared-board');assert(local.name.startsWith('Cambios locales'));assert.equal((await library.history(local.id)).length,1);
}));

test('una versión obsoleta o eliminada por otro equipo se guarda como copia sin sobrescribir',()=>fixture(async({profile,cloud})=>{
  const a=createStore(cloud,{recoveryRoot:path.join(profile,'safety')});const b=createStore(cloud);
  const first=(await a.save(board())).board;const remote=(await b.list()).boards[0];
  const changed=(await b.save({...remote,name:'Remoto'})).board;
  const local=await a.save({...first,name:'Sin conexión'});assert(local.conflict);assert.notEqual(local.board.id,first.id);
  assert.equal((await b.list()).boards.find(board=>board.id===first.id).name,'Remoto');
  await b.remove(changed.id,changed.storageRevision);
  const deletedConflict=await a.save({...first,name:'Después de borrado'});assert(deletedConflict.conflict);assert.notEqual(deletedConflict.board.id,first.id);
  assert.equal(JSON.parse(await fs.readFile(path.join(profile,'safety',`${deletedConflict.board.id}.json`),'utf8')).name,deletedConflict.board.name);
}));

test('carpeta ausente no se recrea ni se sustituye por una biblioteca vacía; hay recuperación local',()=>fixture(async({profile,cloud})=>{
  const library=await createLibrary(profile);await library.save(board());await library.change(cloud);const current=(await library.list()).boards[0];
  await fs.rename(cloud,cloud+'-offline');await assert.rejects(()=>library.list());
  await assert.rejects(()=>library.save({...current,name:'Cambio sin carpeta'}));
  await assert.rejects(()=>fs.stat(cloud),{code:'ENOENT'});
  const recovered=path.join(library.info().recoveryPath,'estados');const locations=await fs.readdir(recovered);
  const copies=await Promise.all(locations.map(async dir=>{try{return JSON.parse(await fs.readFile(path.join(recovered,dir,'shared-board.json'),'utf8'))}catch{return null}}));
  assert(copies.some(board=>board?.name==='Cambio sin carpeta'));
  const restarted=await createLibrary(profile);assert.equal(restarted.info().path,cloud);await assert.rejects(()=>restarted.list());
}));

test('migración aborta con archivos ilegibles o rutas solapadas y conserva la biblioteca activa',()=>fixture(async({profile,cloud})=>{
  const library=await createLibrary(profile);await library.save(board());const original=library.info().path;
  await fs.writeFile(path.join(cloud,'broken.json'),'{bad');await assert.rejects(()=>library.change(cloud),/ilegibles/);
  assert.equal(library.info().path,original);await assert.rejects(()=>fs.readFile(path.join(profile,'storage-settings.json')),{code:'ENOENT'});
  await assert.rejects(()=>library.prepare(profile),/separada/);
  const nested=path.join(original,'nested');await fs.mkdir(nested);await assert.rejects(()=>library.prepare(nested),/separada/);
  assert.equal(await fs.readFile(path.join(cloud,'broken.json'),'utf8'),'{bad');
}));

test('un fallo al confirmar la configuración mantiene el origen activo y el respaldo verificado',()=>fixture(async({profile,cloud})=>{
  const library=await createLibrary(profile);await library.save(board());const original=library.info().path;
  await fs.mkdir(path.join(profile,'storage-settings.json'));
  await assert.rejects(()=>library.change(cloud));assert.equal(library.info().path,original);
  assert.equal((await library.list()).boards[0].name,'Local');assert.equal((await createStore(cloud).list()).boards[0].name,'Local');
  const backupRoot=path.join(library.info().recoveryPath,'migraciones');assert.equal((await fs.readdir(backupRoot)).length,1);
}));

test('copias creadas por el proveedor con ID duplicado tienen identidad estable y no pisan el original',()=>fixture(async({cloud})=>{
  const store=createStore(cloud);await store.save(board());
  const conflictPath=path.join(cloud,'shared-board-PC-conflicted-copy.json');await fs.writeFile(conflictPath,JSON.stringify(board('shared-board','Copia proveedor')));
  const listed=await store.list();assert.equal(new Set(listed.boards.map(b=>b.id)).size,2);
  const copy=listed.boards.find(b=>b.name==='Copia proveedor');assert(copy.id.startsWith('sync-'));
  const edited=(await store.save({...copy,name:'Copia editada'})).board;assert.equal(edited.id,copy.id);
  const restarted=await createStore(cloud).list();assert.equal(restarted.boards.find(b=>b.name==='Copia editada').id,copy.id);
  assert.equal(restarted.boards.find(b=>b.id==='shared-board').name,'Local');
}));

test('una configuración dañada no activa silenciosamente el almacenamiento predeterminado',()=>fixture(async({profile})=>{
  await fs.writeFile(path.join(profile,'storage-settings.json'),'{bad');await assert.rejects(()=>createLibrary(profile),/configuración/);
  assert.equal(await fs.readFile(path.join(profile,'storage-settings.json'),'utf8'),'{bad');
}));
