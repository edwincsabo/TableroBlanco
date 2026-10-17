const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {createStore,validateBoard}=require('../electron/storage.cjs');
const testRoot=path.resolve('.local-test','storage');
async function temporary(){await fs.mkdir(testRoot,{recursive:true});return fs.mkdtemp(path.join(testRoot,'run-'));}
async function clean(root){if(!path.resolve(root).startsWith(testRoot+path.sep))throw new Error('Unsafe test cleanup');await fs.rm(root,{recursive:true,force:true,maxRetries:10,retryDelay:100});}
const board=(id='test-board')=>({id,name:'Prueba',created:1,updated:1,favorite:false,deleted:false,isTemplate:false,scene:{elements:[],appState:{},files:{}}});
test('los guardados concurrentes se serializan y conserva la última versión',async()=>{
  const root=await temporary();try{const store=createStore(root);await Promise.all(Array.from({length:25},(_,i)=>store.save({...board(),name:`Versión ${i}`})));const result=await store.list();assert.equal(result.boards.length,1);assert.equal(result.boards[0].name,'Versión 24');assert.equal(result.errors.length,0);assert.equal((await fs.readdir(root)).some(n=>n.endsWith('.tmp')),false)}finally{await clean(root)}
});
test('rechaza rutas fuera del almacenamiento e identifica archivos dañados sin eliminarlos',async()=>{
  const root=await temporary();try{const store=createStore(root);assert.throws(()=>validateBoard(board('../escape')));await assert.rejects(()=>store.save(board('../escape')));await fs.writeFile(path.join(root,'damaged.json'),'{invalid');await store.save(board());const result=await store.list();assert.equal(result.boards.length,1);assert.deepEqual(result.errors,['damaged.json']);assert.equal(await fs.readFile(path.join(root,'damaged.json'),'utf8'),'{invalid')}finally{await clean(root)}
});
test('las instantáneas preservan el contenido y se pueden recuperar',async()=>{
  const root=await temporary();try{const store=createStore(root);await store.save(board());await store.save({...board(),name:'Nueva versión'});const versions=await store.history('test-board');assert.equal(versions.length,1);const previous=await store.readHistory('test-board',versions[0].id);assert.equal(previous.name,'Prueba');await assert.rejects(()=>store.readHistory('test-board','../escape.json'));await store.remove('test-board');assert.equal((await store.list()).boards.length,0)}finally{await clean(root)}
});
test('el reconocimiento distingue formas cerradas de trazos abiertos',async()=>{
  const {recognizeShape}=await import('../src/geometry.ts');
  const circle=Array.from({length:65},(_,i)=>[50+50*Math.cos(i*Math.PI/32),50+50*Math.sin(i*Math.PI/32)]);
  assert.equal(recognizeShape(circle,100,100),'ellipse');
  const rectangle=[];for(let i=0;i<=20;i++)rectangle.push([i*5,0]);for(let i=1;i<=20;i++)rectangle.push([100,i*5]);for(let i=1;i<=20;i++)rectangle.push([100-i*5,100]);for(let i=1;i<=20;i++)rectangle.push([0,100-i*5]);
  assert.equal(recognizeShape(rectangle,100,100),'rectangle');assert.equal(recognizeShape(circle.slice(0,40),100,100),null);
});
