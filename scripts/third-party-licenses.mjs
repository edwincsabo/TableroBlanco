import {readFile,readdir,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
const lock=JSON.parse(await readFile('package-lock.json','utf8'));
const notices=[];let count=0;
for(const [relative,info] of Object.entries(lock.packages)){
  if(!relative||info.dev||info.devOptional)continue;
  const folder=path.resolve(relative);let metadata;
  try{metadata=JSON.parse(await readFile(path.join(folder,'package.json'),'utf8'));}catch{continue;}
  const sections=[`${metadata.name} ${metadata.version}`,`License: ${metadata.license||info.license||'See package notices'}`,`Source package: ${relative}`];
  for(const name of await readdir(folder)){
    if(!/^(LICEN[CS]E|COPYING|NOTICE|UNLICEN[CS]E)([.\-_]|$)/i.test(name))continue;
    const file=path.join(folder,name);if(!(await stat(file)).isFile())continue;
    sections.push(`\n${name}\n${await readFile(file,'utf8')}`);
  }
  notices.push(sections.join('\n'));count++;
}
await writeFile('licenses/THIRD-PARTY-PACKAGE-NOTICES.txt',notices.join('\n\n============================================================\n\n'));
console.log(`Avisos preservados para ${count} paquetes de producción instalados.`);
