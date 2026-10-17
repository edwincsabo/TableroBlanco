import ts from 'typescript';
import {readFile,writeFile} from 'node:fs/promises';
const messages={...JSON.parse(await readFile('shared/templates.json','utf8')),...JSON.parse(await readFile('shared/ui.json','utf8'))};
const files=['App.tsx','Gallery.tsx','Editor.tsx','components.tsx','TemplatePicker.tsx','storage.ts'];
for(const file of files){
  let content=await readFile(`src/${file}`,'utf8');if(content.includes("import {t as tr} from './i18n'")){console.log(`${file}: ya localizado`);continue;}const source=ts.createSourceFile(file,content,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const edits=[];
  function visit(node){
    if(ts.isFunctionDeclaration(node)&&node.name?.text==='Logo')return;
    if(ts.isJsxText(node)){
      const original=node.text;const key=original.replace(/\s+/g,' ').trim();
      if(messages[key]){const lead=/^\s/.test(original)?' ':'';const tail=/\s$/.test(original)?' ':'';edits.push([node.getStart(source),node.end,`{${lead?JSON.stringify(lead)+' + ':''}t(${JSON.stringify(key)})${tail?' + '+JSON.stringify(tail):''}}`]);}return;
    }
    if(ts.isTemplateExpression(node)){
      const key=node.head.text+node.templateSpans.map((span,i)=>`{${i}}`+span.literal.text).join('');
      if(messages[key]){edits.push([node.getStart(source),node.end,`t(${JSON.stringify(key)}, [${node.templateSpans.map(span=>ts.visitNode(span.expression,child=>child).getText(source)).join(', ')}])`]);return;}
    }
    if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)){
      const parent=node.parent;
      if(messages[node.text]&&!ts.isLiteralTypeNode(parent)&&!(ts.isPropertyAssignment(parent)&&parent.name===node)&&!ts.isImportDeclaration(parent)){
        const call=`t(${JSON.stringify(node.text)})`;edits.push([node.getStart(source),node.end,ts.isJsxAttribute(parent)?`{${call}}`:call]);return;
      }
    }
    ts.forEachChild(node,visit);
  }
  visit(source);for(const [start,end,replacement] of edits.sort((a,b)=>b[0]-a[0]))content=content.slice(0,start)+replacement+content.slice(end);
  content="import {t} from './i18n';\n"+content;await writeFile(`src/${file}`,content);console.log(`${file}: ${edits.length} textos localizados`);
}
