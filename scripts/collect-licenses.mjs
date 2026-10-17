import {mkdir,readFile,readdir,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('licenses');await mkdir(root,{recursive:true});
const packages=['react','react-dom','lucide-react','idb-keyval','jspdf','pdfjs-dist','electron'];
for(const name of packages){const folder=path.resolve('node_modules',name);for(const file of await readdir(folder)){if(/^(LICEN[CS]E|COPYING|NOTICE)(\.|$)/i.test(file))await copyFile(path.join(folder,file),path.join(root,`${name.replaceAll('/','-')}-${file}`));}}
async function remote(url,target){const response=await fetch(url);if(!response.ok)throw new Error(`${response.status}: ${url}`);await writeFile(path.join(root,target),await response.text(),'utf8');}
await remote('https://raw.githubusercontent.com/excalidraw/excalidraw/v0.18.1/LICENSE','Excalidraw-MIT.txt');
const fonts=['Cascadia','ComicShanns','Excalifont','Liberation','Lilita','Nunito','Virgil','Xiaolai'];
const notices=[];
for(const font of fonts){const url=`https://raw.githubusercontent.com/excalidraw/excalidraw/v0.18.1/packages/excalidraw/fonts/${font}/index.ts`;const response=await fetch(url);if(!response.ok)throw new Error(`No se pudo leer ${font}`);const source=await response.text();const header=source.match(/\/\*\*[\s\S]*?\*\//)?.[0]||source;notices.push(`${font}\nSource: ${url}\n${header}`);}
await writeFile(path.join(root,'Fonts-copyright-and-license-notices.txt'),notices.join('\n\n----------------------------------------\n\n'));
await remote('https://raw.githubusercontent.com/google/fonts/main/ofl/assistant/OFL.txt','Assistant-OFL.txt');
await remote('https://raw.githubusercontent.com/excalidraw/virgil/main/LICENSE.md','Virgil-OFL.txt');
await remote('https://raw.githubusercontent.com/shannpersand/comic-shanns/master/LICENSE','ComicShanns-MIT.txt');
console.log('Licencias de componentes y fuentes conservadas en licenses/.');
