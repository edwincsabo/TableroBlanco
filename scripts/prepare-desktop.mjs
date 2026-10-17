import {cp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('desktop-bundle');
await mkdir(root,{recursive:true});
for(const folder of ['dist','electron','licenses','build','shared']){
  const target=path.resolve(root,folder);
  if(!target.startsWith(root+path.sep))throw new Error('Destino de empaquetado inválido.');
  await rm(target,{recursive:true,force:true,maxRetries:5,retryDelay:100});
  await cp(path.resolve(folder),target,{recursive:true,force:true});
}
for(const file of ['LICENSE','THIRD_PARTY_NOTICES.md'])await cp(path.resolve(file),path.join(root,file));
const original=JSON.parse(await readFile('package.json','utf8'));
const manifest=Object.fromEntries(['name','version','description','author','license','type','main'].map(key=>[key,original[key]]));
await writeFile(path.join(root,'package.json'),JSON.stringify(manifest,null,2));
console.log('Aplicación de escritorio preparada con el runtime de interfaz ya compilado.');
