import ts from 'typescript';
import {readFile,writeFile} from 'node:fs/promises';
const files=['App.tsx','Gallery.tsx','Editor.tsx','components.tsx','TemplatePicker.tsx','templates.ts','templateCatalog.ts','storage.ts'];
const texts=new Set();
function candidate(s){return !!s.trim()&&(/[ÁÉÍÓÚÑáéíóúñ¿¡]/.test(s)||/^[A-Z]/.test(s)||s.includes(' '))&&!/^[A-Za-z0-9]+(?:\/[A-Za-z0-9]+)+$/.test(s)&&!['NFD','PNG','SVG','Esc','V / P / T / E','R / O / A','Ctrl + Z / Ctrl + Shift + Z','Ctrl + C / Ctrl + V','Ctrl + D','Ctrl + G / Ctrl + Shift + G','Ctrl + S','Ctrl + Shift + E','TableroBlanco'].includes(s);}
for(const file of files){const source=ts.createSourceFile(file,await readFile(`src/${file}`,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);function visit(node){let value;if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))value=node.text;else if(ts.isJsxText(node))value=node.text.replace(/\s+/g,' ').trim();else if(ts.isTemplateExpression(node))value=node.head.text+node.templateSpans.map((span,i)=>`{${i}}`+span.literal.text).join('');if(value&&candidate(value))texts.add(value);ts.forEachChild(node,visit)}visit(source);}
await writeFile('.local-test/translation-keys.json',JSON.stringify([...texts].sort(),null,2));console.log(`${texts.size} textos encontrados`);
