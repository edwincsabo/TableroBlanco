import {templates as originals, palette, text, box, sceneFrom, type Template} from './templates';
import type {Scene} from './types';
import {getLocale} from './i18n';

export const categories = [
  {id:'ideas',name:'Lluvia de ideas',description:'Explora posibilidades y conecta ideas.'},
  {id:'problems',name:'Solución de problemas',description:'Entiende las causas y encuentra caminos de solución.'},
  {id:'design',name:'Diseño e investigación',description:'Conoce a las personas y diseña mejores experiencias.'},
  {id:'strategy',name:'Estrategia',description:'Define una dirección y elige dónde concentrarte.'},
  {id:'projects',name:'Planificación de proyectos',description:'Convierte tus ideas en un plan que puedas seguir.'},
  {id:'retro',name:'Retrospectiva',description:'Aprende de la experiencia y decide qué mejorar.'},
  {id:'games',name:'Juegos',description:'Piensa jugando con actividades sobre el lienzo.'},
  {id:'workshops',name:'Talleres',description:'Prepara sesiones, organiza actividades y registra acuerdos.'},
  {id:'learning',name:'Aprendizaje',description:'Haz visible lo que sabes, descubres y quieres aprender.'}
] as const;
export type CategoryId = typeof categories[number]['id'];
export type CatalogTemplate = Template & {categoryId:CategoryId; recommended?:boolean; keywords?:string[]};
type Items = any[];
const neutral='#f1f5f3';
const heading=(title:string,subtitle?:string):Items=>[text(title,0,-110,38),...(subtitle?[text(subtitle,0,-48,18,'#71817c')]:[])];
const note=(label:string,x:number,y:number,color=palette[0],width=220,height=160)=>box(label,x,y,width,height,color);
const line=(x:number,y:number,dx:number,dy:number,arrow=false,color='#8a9d96')=>({type:arrow?'arrow':'line',x,y,points:[[0,0],[dx,dy]],strokeColor:color,strokeWidth:2,roughness:0,...(arrow?{endArrowhead:'arrow'}:{})});
function lanes(title:string,labels:string[],prompts:string[]=[],rows=2):Scene{
  return sceneFrom([...heading(title),...labels.flatMap((label,i)=>[
    box(label,i*300,0,275,68,palette[i%6]),
    ...Array.from({length:rows},(_,j)=>note(j===0?prompts[i]||'':'',i*300,95+j*170,neutral,275,145))
  ])]);
}
function quadrants(title:string,labels:string[],prompts:string[]=[],colors=palette):Scene{
  return sceneFrom([...heading(title),...labels.flatMap((label,i)=>{
    const x=(i%2)*460,y=Math.floor(i/2)*335;
    return [box(label,x,y,425,65,colors[i%colors.length]),note(prompts[i]||'',x,y+90,neutral,425,210)];
  })]);
}
function canvas(title:string,sections:{label:string;x:number;y:number;w:number;h:number;hint?:string}[]):Scene{
  return sceneFrom([...heading(title),...sections.flatMap((s,i)=>[
    box('',s.x,s.y,s.w,s.h,neutral),box(s.label,s.x,s.y,s.w,58,palette[i%6]),
    ...(s.hint?[text(s.hint,s.x+18,s.y+85,17,'#71817c')]:[])
  ])]);
}
function cards(title:string,labels:string[],columns=3,subtitle?:string):Scene{
  return sceneFrom([...heading(title,subtitle),...labels.map((label,i)=>note(label,(i%columns)*300,Math.floor(i/columns)*220,palette[i%6],270,185))]);
}
function timeline(title:string,labels:string[]):Scene{
  return sceneFrom([...heading(title),line(60,90,labels.length*280-100,0,true),...labels.flatMap((label,i)=>[
    {type:'ellipse',x:i*280+95,y:75,width:30,height:30,backgroundColor:palette[i%6],fillStyle:'solid',strokeColor:'#8a9d96',roughness:0},
    text(label,i*280,0,22),note('Acciones y entregables',i*280,150,neutral,250,180)
  ])]);
}
function grid(title:string,columnNames:string[],rowNames:string[]):Scene{
  const width=230,height=105;
  return sceneFrom([...heading(title),...columnNames.map((name,i)=>box(name,(i+1)*width,0,width-8,70,palette[i%6])),...rowNames.flatMap((name,r)=>[
    box(name,0,90+r*height,width-8,height-8,palette[(r+2)%6]),...columnNames.map((_,c)=>box('',(c+1)*width,90+r*height,width-8,height-8,neutral))
  ])]);
}
const categoryForOriginal:Record<string,CategoryId>={ideas:'ideas',kanban:'projects',swot:'strategy',retro:'retro',week:'projects',mindmap:'ideas',story:'design',goals:'projects',matrix:'strategy'};
function entry(id:string,name:string,categoryId:CategoryId,description:string,make:()=>Scene,recommended=false,keywords:string[]=[]):CatalogTemplate{
  const index=categories.findIndex(c=>c.id===categoryId);
  return {id,name,categoryId,category:categories[index].name,description,make,color:palette[index%6],recommended,keywords};
}
const base:CatalogTemplate[]=originals.filter(t=>t.id!=='welcome').map(t=>({...t,categoryId:categoryForOriginal[t.id],category:categories.find(c=>c.id===categoryForOriginal[t.id])!.name,recommended:['ideas','kanban','swot','retro','mindmap','story'].includes(t.id)}));

export const templateCatalog:CatalogTemplate[]=[...base,
  entry('brainwriting','Brainwriting','ideas','Desarrolla una idea en tres rondas.',()=>grid('Ideas que evolucionan',['Idea 1','Idea 2','Idea 3'],['Ronda 1: proponer','Ronda 2: ampliar','Ronda 3: combinar'])),
  entry('scamper','SCAMPER','ideas','Transforma una idea con siete preguntas.',()=>cards('SCAMPER',['Sustituir\n¿Qué puedo cambiar?','Combinar\n¿Qué puedo unir?','Adaptar\n¿Qué puedo reutilizar?','Modificar\n¿Qué puedo ampliar?','Proponer otros usos\n¿Para qué más sirve?','Eliminar\n¿Qué sobra?','Reordenar\n¿Y si cambio el orden?'],4)),
  entry('crazy-eight','Ocho ideas rápidas','ideas','Explora ocho posibilidades antes de elegir.',()=>cards('Ocho ideas rápidas',Array.from({length:8},(_,i)=>`Idea ${i+1}`),4,'Dibuja o escribe una alternativa en cada espacio.')),
  entry('affinity','Mapa de afinidad','ideas','Agrupa observaciones por temas comunes.',()=>lanes('Encuentra los temas comunes',['Tema 1','Tema 2','Tema 3','Por clasificar'],['Observaciones relacionadas','Ideas parecidas','Patrones que se repiten','Notas sin grupo'],3)),

  entry('five-whys','Los cinco porqués','problems','Profundiza desde el síntoma hasta la causa.',()=>sceneFrom([...heading('Los cinco porqués','Describe el problema y pregunta por qué ocurre.'),...['Problema','¿Por qué? 1','¿Por qué? 2','¿Por qué? 3','¿Por qué? 4','¿Por qué? 5'].flatMap((label,i)=>[box(label,i*220,0,200,62,palette[i%6]),note('',i*220,85,neutral,200,200),...(i<5?[line(i*220+202,185,16,0,true)]:[])]),box('Causa raíz y acción a validar',0,340,1300,120,palette[2])]),true,['causa','raíz']),
  entry('fishbone','Diagrama de causa y efecto','problems','Organiza las posibles causas en una espina de pescado.',()=>sceneFrom([...heading('Causa y efecto'),line(30,320,1040,0,true),box('Problema o efecto',1100,240,270,160,palette[1]),...['Personas','Métodos','Herramientas','Materiales','Entorno','Medición'].flatMap((label,i)=>{const x=80+(i%3)*330,top=i<3;return [line(x,top?80:560,160,top?240:-240),box(label,x-45,top?0:570,210,60,palette[i]),note('',x+5,top?100:390,neutral,170,110)]})]),false,['ishikawa','causas']),
  entry('problem-tree','Árbol del problema','problems','Distingue causas, problema central y consecuencias.',()=>sceneFrom([...heading('Árbol del problema'),box('Problema central',340,240,370,120,palette[1]),...['Consecuencia 1','Consecuencia 2','Consecuencia 3'].flatMap((label,i)=>[note(label,i*350,0,palette[3],300,150),line(i*350+150,150,525-(i*350+150),90,true)]),...['Causa 1','Causa 2','Causa 3'].flatMap((label,i)=>[note(label,i*350,470,palette[2],300,150),line(i*350+150,470,525-(i*350+150),-110,true)])])),
  entry('impact-effort','Impacto y esfuerzo','problems','Ordena las soluciones por valor y dificultad.',()=>quadrants('Impacto y esfuerzo',['Ganancias rápidas','Proyectos importantes','Mejoras pequeñas','Reconsiderar'],['Alto impacto · poco esfuerzo','Alto impacto · mucho esfuerzo','Bajo impacto · poco esfuerzo','Bajo impacto · mucho esfuerzo']),true),
  entry('solutions','Comparar soluciones','problems','Evalúa alternativas con los mismos criterios.',()=>grid('¿Qué solución nos conviene?',['Solución A','Solución B','Solución C'],['Beneficios','Esfuerzo y coste','Riesgos','Evidencia','Decisión'])),
  entry('a3','Resolución de problemas A3','problems','Documenta el problema, la propuesta y su seguimiento.',()=>canvas('Resolución de problemas A3',[{label:'1. Contexto',x:0,y:0,w:430,h:240},{label:'2. Situación actual',x:0,y:260,w:430,h:260},{label:'3. Objetivo',x:450,y:0,w:430,h:240},{label:'4. Causas',x:450,y:260,w:430,h:260},{label:'5. Contramedidas',x:900,y:0,w:430,h:240},{label:'6. Plan y seguimiento',x:900,y:260,w:430,h:260}])),

  entry('empathy','Mapa de empatía','design','Explora qué piensa, siente, dice y hace una persona.',()=>quadrants('Mapa de empatía',['Piensa','Siente','Dice','Hace'],['Creencias y preocupaciones','Emociones y motivaciones','Frases que escuchamos','Comportamientos observados']),true,['usuario','persona']),
  entry('journey','Recorrido de experiencia','design','Relaciona etapas, acciones y oportunidades.',()=>grid('Recorrido de experiencia',['Descubrir','Explorar','Decidir','Usar','Volver'],['Acciones','Pensamientos','Emociones','Dificultades','Oportunidades']),false,['customer journey','cliente','usuario']),
  entry('persona','Ficha de persona','design','Resume el contexto, las metas y las necesidades.',()=>canvas('Una persona, un contexto',[{label:'Nombre y perfil',x:0,y:0,w:350,h:600,hint:'Contexto, actividad y hábitos'},{label:'Metas',x:375,y:0,w:400,h:280},{label:'Necesidades',x:800,y:0,w:400,h:280},{label:'Frustraciones',x:375,y:305,w:400,h:295},{label:'Una frase que la representa',x:800,y:305,w:400,h:295}])),
  entry('experiment','Diseñar un experimento','design','Convierte una hipótesis en una prueba concreta.',()=>lanes('De la hipótesis a la evidencia',['Hipótesis','Prueba','Métrica','Aprendizaje'],['Creemos que…','Lo comprobaremos con…','Esperamos observar…','La evidencia indica…'])),
  entry('service','Mapa del servicio','design','Conecta la experiencia visible con el trabajo interno.',()=>grid('Mapa del servicio',['Antes','Durante','Después'],['Acción de la persona','Interacción visible','Trabajo interno','Sistemas y recursos','Oportunidades']),false,['service blueprint']),

  entry('business-canvas','Modelo de negocio','strategy','Explora cómo se crea y entrega valor.',()=>canvas('Modelo de negocio',[{label:'Socios clave',x:0,y:0,w:250,h:500},{label:'Actividades clave',x:270,y:0,w:250,h:240},{label:'Recursos clave',x:270,y:260,w:250,h:240},{label:'Propuesta de valor',x:540,y:0,w:290,h:500},{label:'Relación con clientes',x:850,y:0,w:250,h:240},{label:'Canales',x:850,y:260,w:250,h:240},{label:'Segmentos de clientes',x:1120,y:0,w:250,h:500},{label:'Estructura de costes',x:0,y:520,w:675,h:190},{label:'Fuentes de ingresos',x:695,y:520,w:675,h:190}]),true,['business model canvas']),
  entry('okr','Objetivos y resultados clave','strategy','Relaciona el propósito con resultados medibles.',()=>canvas('Objetivos y resultados clave',[{label:'Objetivo: ¿qué queremos lograr?',x:0,y:0,w:1180,h:180},{label:'Resultado clave 1',x:0,y:205,w:380,h:290,hint:'Métrica · punto de partida · meta'},{label:'Resultado clave 2',x:400,y:205,w:380,h:290,hint:'Métrica · punto de partida · meta'},{label:'Resultado clave 3',x:800,y:205,w:380,h:290,hint:'Métrica · punto de partida · meta'},{label:'Iniciativas para avanzar',x:0,y:520,w:1180,h:180}])),
  entry('vision','Visión y propósito','strategy','Define por qué importa y hacia dónde avanzar.',()=>lanes('Una dirección compartida',['Propósito','Visión','Principios','Señales de avance'],['¿Por qué existe esta idea?','¿Qué futuro queremos?','¿Cómo tomaremos decisiones?','¿Cómo sabremos que avanzamos?'])),
  entry('pestel','Análisis PESTEL','strategy','Explora los factores del entorno que pueden influir.',()=>cards('Análisis PESTEL',['Político','Económico','Social','Tecnológico','Ecológico','Legal'],3)),

  entry('roadmap','Hoja de ruta','projects','Organiza las iniciativas a lo largo del tiempo.',()=>timeline('Hoja de ruta',['Ahora','Próximo mes','Próximo trimestre','Más adelante']),true,['roadmap','cronograma']),
  entry('raci','Matriz de responsabilidades','projects','Aclara quién realiza, aprueba, consulta y conoce.',()=>grid('Matriz RACI',['Responsable (R)','Aprueba (A)','Consulta (C)','Informado (I)'],['Actividad 1','Actividad 2','Actividad 3','Actividad 4'])),
  entry('milestones','Hitos del proyecto','projects','Visualiza las entregas que marcan el avance.',()=>timeline('Hitos del proyecto',['Inicio','Primer entregable','Validación','Entrega final'])),

  entry('start-stop','Empezar, dejar, continuar','retro','Decide qué prácticas vale la pena cambiar.',()=>lanes('Empezar, dejar, continuar',['Empezar','Dejar de hacer','Continuar'],['Algo que nos falta probar','Algo que ya no ayuda','Algo que queremos mantener']),true),
  entry('four-ls','Las cuatro L','retro','Revisa lo que gustó, faltó, se aprendió y se deseó.',()=>quadrants('Las cuatro L',['Lo que me gustó','Lo que aprendí','Lo que faltó','Lo que deseé'],['Liked','Learned','Lacked','Longed for']),false,['4l','4ls']),
  entry('sailboat','El velero','retro','Identifica el impulso, las anclas y los riesgos.',()=>sceneFrom([...heading('El velero'),line(0,330,1160,0,false,'#93bfd1'),{type:'line',x:430,y:255,points:[[0,0],[310,0],[255,95],[70,95],[0,0]],backgroundColor:'#cdeee3',fillStyle:'solid',strokeColor:'#6f9d8e',roughness:0},{type:'line',x:585,y:250,points:[[0,0],[0,-210],[150,0],[0,0]],backgroundColor:'#d9e6ff',fillStyle:'solid',strokeColor:'#6f9d8e',roughness:0},note('Viento\n¿Qué nos impulsa?',0,0,palette[2],330,200),note('Destino\n¿A dónde queremos llegar?',850,0,palette[0],330,200),note('Anclas\n¿Qué nos frena?',0,410,palette[1],330,200),note('Rocas\n¿Qué riesgos vemos?',850,410,palette[4],330,200)])),
  entry('feelings','Satisfacción, frustración y dudas','retro','Pon en palabras cómo viviste la experiencia.',()=>lanes('¿Cómo vivimos esta experiencia?',['Me dio satisfacción','Me generó frustración','Me dejó preguntas'])),
  entry('starfish','Estrella de mejora','retro','Evalúa cinco direcciones para mejorar el trabajo.',()=>cards('Estrella de mejora',['Hacer más','Hacer menos','Empezar','Dejar','Mantener'],3)),

  entry('tic-tac-toe','Tres en raya','games','Un tablero editable para una pausa breve.',()=>sceneFrom([...heading('Tres en raya','Alterna cruces y círculos con las herramientas de texto o formas.'),line(200,0,0,600),line(400,0,0,600),line(0,200,600,0),line(0,400,600,0),box('Jugador A',680,0,260,130,palette[3]),box('Jugador B',680,160,260,130,palette[1]),box('Marcador',680,350,260,180,neutral)])),
  entry('bingo','Bingo de ideas','games','Crea retos y marca los que vayas completando.',()=>sceneFrom([...heading('Bingo de ideas','Completa las casillas con retos, conceptos o descubrimientos.'),...Array.from({length:25},(_,i)=>box(i===12?'Libre':`Reto ${i+1}`,(i%5)*185,Math.floor(i/5)*150,175,140,i===12?palette[2]:palette[i%6]))])),
  entry('draw-guess','Dibuja y adivina','games','Un espacio de dibujo, pistas y respuestas.',()=>canvas('Dibuja y adivina',[{label:'Zona de dibujo',x:0,y:0,w:800,h:550},{label:'Palabras o conceptos',x:825,y:0,w:300,h:240},{label:'Respuestas',x:825,y:265,w:300,h:285}])),
  entry('word-chain','Cadena de palabras','games','Conecta ideas a partir de una palabra inicial.',()=>sceneFrom([...heading('Cadena de palabras'),...Array.from({length:8},(_,i)=>{const x=(i%4)*310,y=Math.floor(i/4)*250;return [box(i===0?'Palabra inicial':`Asociación ${i}`,x,y,270,150,palette[i%6]),...(i%4<3?[line(x+275,y+75,25,0,true)]:[])]}).flat()])),
  entry('quiz','Preguntas y respuestas','games','Prepara preguntas y compara tus respuestas.',()=>grid('Preguntas y respuestas',['Pregunta','Mi respuesta','Respuesta y explicación'],['Ronda 1','Ronda 2','Ronda 3','Ronda 4','Ronda 5'])),
  entry('connect-dots','Conecta los puntos','games','Traza líneas y descubre una figura.',()=>sceneFrom([...heading('Conecta los puntos','Usa líneas o el lápiz para unir los puntos por orden.'),...[[310,0],[410,210],[650,220],[460,370],[520,600],[310,460],[100,600],[160,370],[-30,220],[210,210]].flatMap(([x,y],i)=>[{type:'ellipse',x,y,width:16,height:16,backgroundColor:'#176c62',fillStyle:'solid',strokeColor:'transparent',roughness:0},text(String(i+1),x+23,y-4,24)]),box('¿Qué figura descubriste?',780,100,330,220,palette[0])])),

  entry('agenda','Agenda de taller','workshops','Define tiempos, actividades y resultados.',()=>grid('Agenda de taller',['Tiempo','Actividad','Objetivo','Materiales'],['Apertura','Exploración','Trabajo práctico','Puesta en común','Cierre']),true),
  entry('check-in','Punto de partida','workshops','Aclara expectativas antes de empezar.',()=>lanes('Antes de empezar',['Cómo llego','Qué espero','Qué puedo aportar','Qué necesito'])),
  entry('parking-lot','Estacionamiento de ideas','workshops','Conserva las preguntas que resolverás después.',()=>lanes('Estacionamiento de ideas',['Preguntas','Ideas para después','Por investigar','Resuelto'])),
  entry('action-plan','Plan de acción','workshops','Cierra una sesión con pasos y responsables.',()=>grid('De la conversación a la acción',['Acción','Responsable','Fecha','Evidencia de avance'],['Compromiso 1','Compromiso 2','Compromiso 3','Compromiso 4'])),
  entry('decision-log','Registro de decisiones','workshops','Documenta una decisión y su razonamiento.',()=>canvas('Registro de decisiones',[{label:'Pregunta que necesitamos resolver',x:0,y:0,w:1080,h:150},{label:'Opciones consideradas',x:0,y:175,w:520,h:280},{label:'Criterios y evidencia',x:550,y:175,w:530,h:280},{label:'Decisión y próximos pasos',x:0,y:480,w:1080,h:200}])),
  entry('workshop-feedback','Evaluación del taller','workshops','Recoge aprendizajes y mejoras para la próxima sesión.',()=>lanes('Una sesión para recordar',['Me llevo','Me sorprendió','Cambiaría','Próxima acción'])),

  entry('five-w-one-h','5 W y un H','learning','Explora un tema con seis preguntas fundamentales.',()=>cards('5 W y un H',['Qué\n¿Qué ocurre?','Quién\n¿Quién participa?','Dónde\n¿Dónde sucede?','Cuándo\n¿Cuándo ocurre?','Por qué\n¿Por qué sucede?','Cómo\n¿Cómo funciona?'],3),true,['5w1h','5 w 1 h','preguntas']),
  entry('learning-brainstorm','Lluvia de ideas para aprender','learning','Conecta lo que ya sabes con lo que quieres descubrir.',()=>cards('Lluvia de ideas',['Lo que ya conozco','Una idea nueva','Una conexión','Una pregunta','Un ejemplo','Algo por explorar'],3)),
  entry('compare-contrast','Comparar y contrastar','learning','Encuentra diferencias y puntos en común.',()=>sceneFrom([...heading('Comparar y contrastar'),{type:'ellipse',x:0,y:90,width:470,height:470,strokeColor:'#5e92d0',backgroundColor:'transparent',strokeWidth:3,roughness:0},{type:'ellipse',x:280,y:90,width:470,height:470,strokeColor:'#d88869',backgroundColor:'transparent',strokeWidth:3,roughness:0},text('Concepto A',60,20,26),text('En común',300,270,22),text('Concepto B',490,20,26),note('',65,210,palette[3],150,120),note('',535,210,palette[1],150,120),note('',310,350,palette[2],130,110),box('Conclusión',830,90,300,70,palette[2]),note('',830,185,neutral,300,340)]),true,['venn','diferencias','similitudes']),
  entry('exit-ticket','Billete de salida','learning','Cierra una actividad con una breve reflexión.',()=>lanes('Billete de salida',['Aprendí','Me pregunto','Voy a aplicar'],['Algo que ahora entiendo','Una duda que sigo teniendo','Una acción concreta'])),
  entry('four-corners','Cuatro esquinas','learning','Explora cuatro posiciones y sus argumentos.',()=>quadrants('Cuatro esquinas',['De acuerdo','En desacuerdo','Depende','Necesito saber más'],['Mis razones y evidencias','Mis razones y evidencias','¿De qué condiciones depende?','¿Qué información me falta?'])),
  entry('glows-grows','Lo mejor y lo mejorable','learning','Reconoce fortalezas y oportunidades de crecimiento.',()=>lanes('Lo mejor y lo mejorable',['Lo mejor','Lo mejorable'],['Algo que funcionó muy bien','Algo que podemos desarrollar'],3)),
  entry('kwl','KWL','learning','Distingue lo que sabes, quieres saber y aprendiste.',()=>lanes('KWL: mi recorrido de aprendizaje',['K · Lo que sé','W · Lo que quiero saber','L · Lo que aprendí']),true,['sqa','sé','quiero','aprendido']),
  entry('learning-kanban','Kanban de aprendizaje','learning','Sigue los temas que quieres estudiar y dominar.',()=>lanes('Kanban de aprendizaje',['Por aprender','Practicando','Lo puedo explicar'],['Tema o habilidad','Ejercicio o experimento','Evidencia de aprendizaje'],3)),
  entry('lesson-plan','Plan de lección','learning','Diseña una sesión desde sus objetivos hasta la evaluación.',()=>canvas('Plan de lección',[{label:'Tema y objetivo',x:0,y:0,w:1080,h:140},{label:'Inicio',x:0,y:165,w:340,h:280},{label:'Desarrollo',x:370,y:165,w:340,h:280},{label:'Cierre',x:740,y:165,w:340,h:280},{label:'Materiales y apoyos',x:0,y:470,w:525,h:170},{label:'Evaluación del aprendizaje',x:555,y:470,w:525,h:170}]))
];

const scenes=new Map<string,Scene>();
export function getTemplateScene(template:CatalogTemplate):Scene{
  const key=`${getLocale()}:${template.id}`;
  let scene=scenes.get(key);
  if(!scene){scene=template.make();scenes.set(key,scene);}
  return scene;
}
export const normalizeSearch=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
