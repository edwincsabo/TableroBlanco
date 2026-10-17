# TableroBlanco 1.2.1

Aplicación de pizarra personal para Windows x64. Funciona sin cuentas, sin servidor y sin conexión. Los tableros se guardan en el equipo. Es una alternativa independiente inspirada en los flujos de trabajo de Whiteboard; no es un producto de Microsoft ni una reproducción idéntica.

## Abrir la aplicación

En `version-final/1.2.1`:

- `TableroBlanco-1.2.1-Instalador.exe`: instala para el usuario actual, permite elegir carpeta y crea accesos en Inicio y el escritorio.
- `TableroBlanco-1.2.1-Portable.exe`: ejecuta la aplicación sin instalarla. Los datos también se guardan en el perfil del usuario, no junto al ejecutable.
- `win-unpacked/TableroBlanco.exe`: versión ya extraída. Conserva toda la carpeta `win-unpacked` si la trasladas.

No necesitas instalar Node.js, npm, Electron ni un navegador para usar los ejecutables. Son compilaciones sin firma digital comercial; Windows puede mostrar el editor como desconocido.

En este entorno, Windows Device Guard bloqueó anteriormente el arranque de la compilación 1.1.0. Por esa restricción, el ejecutable empaquetado 1.2.0 no se volvió a ejecutar aquí. La compilación y las pruebas del código fuente con Electron oficial se verificaron por separado. Consulta `VERIFICACION.md`; no se modificó la política de seguridad del equipo.

## Funciones

- Biblioteca de tableros, búsqueda por nombre, ordenación, favoritos, duplicación y papelera con restauración.
- Lienzo desplazable con zoom, selección múltiple, mover, rotar, cambiar tamaño, agrupar, ordenar y bloquear objetos. Deshacer y rehacer durante la sesión.
- Lápiz, marcador, resaltador, borrador, puntero láser, colores, grosores, transparencia, formas, líneas, flechas, conectores y texto editable.
- Ratón, entrada táctil y lápiz digital mediante el motor del lienzo. El reconocimiento opcional de tinta convierte círculos y rectángulos cerrados; no reconoce escritura manuscrita ni todas las formas posibles.
- Regla desplazable y giratoria que ajusta los trazos de lápiz a su borde inferior.
- Notas adhesivas de seis colores, cuadrícula de notas, sellos, comentarios como tarjetas, tablas y listas de tareas como objetos del lienzo.
- Imágenes PNG, JPEG, WebP, GIF y SVG. Los GIF se utilizan como imagen estática.
- Importación de páginas PDF seleccionadas como imágenes que se pueden anotar. No se edita el texto interno del PDF.
- 57 plantillas en nueve categorías, búsqueda global, recomendaciones y vistas previas de sus objetos; guardar tableros como plantillas personales y volver a insertarlas.
- Buscar texto y notas dentro del tablero y navegar a los resultados.
- Enlaces a páginas web (se abren en el navegador del sistema y pueden requerir internet).
- Temporizador con pausa, reinicio y aviso al finalizar. Modo presentación para ver el tablero sin editarlo.
- Fondos y cuadrícula configurables, tema claro y oscuro.
- Guardado automático, historial local y copias completas de seguridad.
- Importación de `.tablero` y `.excalidraw`; exportación editable `.tablero`, PNG, SVG y PDF de una página.

Las tablas y listas son composiciones editables de formas y texto: no son componentes Loop ni hojas de cálculo. Los comentarios son tarjetas locales, sin hilos entre usuarios. El PDF exportado contiene una imagen del lienzo; SVG conserva la representación vectorial de los objetos que la admiten. PNG/PDF se limitan a 8192 píxeles en su lado mayor para evitar exceder la capacidad de renderizado.

## Idioma de la aplicación

La versión 1.2.0 ofrece **Español**, **English** y **中文（简体）** (chino mandarín escrito con caracteres simplificados). Puedes elegir el idioma desde **Configuración → Idioma de la aplicación**, desde las opciones del tablero o desde el selector de la barra superior del editor.

El cambio se aplica sin cerrar el tablero y se recuerda al reiniciar la aplicación. La interfaz, los mensajes, las herramientas del lienzo, las categorías y las plantillas nuevas se muestran en el idioma seleccionado. Los nombres y textos de tableros existentes, notas y plantillas personales no se traducen ni se reemplazan. Las nuevas plantillas insertadas llevan sus textos en el idioma activo.

El idioma inicial es español. Los ejecutables anteriores se conservan en sus carpetas de entrega. El asistente de instalación también permite elegir español, inglés o chino simplificado; los controles proporcionados por Windows pueden seguir el idioma del sistema.

## Biblioteca de plantillas

La versión 1.1.0 amplía las nueve plantillas originales a 57. El selector se puede abrir desde **Plantillas** en la biblioteca o desde el botón de plantillas dentro del editor. En la biblioteca crea un tablero nuevo; dentro del editor añade el diseño al tablero que ya estás editando, sin sustituir sus objetos.

| Categoría | Plantillas |
| --- | ---: |
| Lluvia de ideas | 6 |
| Solución de problemas | 6 |
| Diseño e investigación | 6 |
| Estrategia | 6 |
| Planificación de proyectos | 6 |
| Retrospectiva | 6 |
| Juegos | 6 |
| Talleres | 6 |
| Aprendizaje | 9 |

Aprendizaje incluye **5 W y un H**, **Lluvia de ideas para aprender**, **Comparar y contrastar**, **Billete de salida**, **Cuatro esquinas**, **Lo mejor y lo mejorable**, **KWL**, **Kanban de aprendizaje** y **Plan de lección**. Las otras categorías incluyen diseños como SCAMPER, los cinco porqués, causa y efecto, mapa de empatía, modelo de negocio, hoja de ruta, velero y agenda de taller.

La búsqueda recorre todas las categorías y las plantillas personales, sin distinguir mayúsculas ni tildes. **Mis plantillas** muestra los diseños guardados desde Opciones del tablero. Los juegos son tableros editables para actividades, sin reglas automáticas ni un sistema de jugadores.

Los diseños son propios e inspirados en estructuras de trabajo conocidas y en la referencia proporcionada. No se afirma que sean reproducciones exactas de las plantillas de Microsoft. La aplicación mantiene el mismo almacenamiento local que la versión 1.0.0; los ejecutables anteriores se conservan en la raíz de `version-final`.

## Guardado y recuperación

Los cambios se guardan tras una pausa de aproximadamente 800 ms. La aplicación espera a que termine el guardado al cerrar la ventana. Si el disco falla, muestra un aviso y mantiene la ventana abierta para que puedas exportar una copia.

Los tableros se almacenan en `%APPDATA%\tableroblanco\tableros`. La ubicación exacta puede abrirse en **Configuración → Abrir carpeta de tableros**. Los archivos JSON se escriben primero en un temporal y se reemplazan de forma atómica, con sincronización del archivo y reintentos ante bloqueos transitorios.

Mientras guardas cambios, se conserva una versión anterior cada cinco minutos, hasta veinte instantáneas automáticas por tablero. En **Opciones del tablero → Historial de versiones** puedes restaurarla. Antes de restaurar se conserva también una instantánea del estado actual. El historial no reemplaza una copia de seguridad externa.

En la biblioteca, **Configuración → Crear copia de seguridad completa** exporta los tableros, las plantillas y la papelera en JSON. Al restaurar se crean copias con identificadores nuevos y se preservan los tableros que ya existían. Las instantáneas del historial no se incluyen en esa copia.

## Atajos

| Acción | Atajo |
| --- | --- |
| Desplazar lienzo | Espacio + arrastrar |
| Zoom | Ctrl + rueda |
| Deshacer / rehacer | Ctrl + Z / Ctrl + Shift + Z |
| Selección / lápiz / texto / borrador | V / P / T / E |
| Rectángulo / elipse / flecha | R / O / A |
| Copiar / pegar / duplicar | Ctrl + C / Ctrl + V / Ctrl + D |
| Agrupar / desagrupar | Ctrl + G / Ctrl + Shift + G |
| Guardar copia editable | Ctrl + S |
| Exportar PNG | Ctrl + Shift + E |
| Cerrar panel o presentación | Esc |

## Alcance de esta versión

Se implementó el uso personal, local y sin cuentas solicitado. No incluye colaboración simultánea, servicios en la nube, OneDrive, Teams, Microsoft Loop, Copilot ni inicio de sesión. No abre el formato propietario `.whiteboard` ni recupera contenido eliminado por Microsoft. Las imágenes previamente exportadas desde Whiteboard se pueden insertar como imágenes, sin recuperar los objetos originales editables.

El objetivo es cubrir las herramientas personales de pizarra descritas arriba. No se certifica equivalencia completa con todas las versiones y funciones de Microsoft Whiteboard. El comportamiento táctil y de presión depende del dispositivo; las pruebas automáticas de esta entrega utilizan ratón y teclado.

## Código y compilación

Requiere Node.js 24 compatible y npm para trabajar con el código fuente:

```powershell
npm ci
npm run build
npm run desktop
```

Para generar el instalador y el ejecutable portable:

```powershell
npm run dist
```

Para desarrollo de la interfaz: `npm run dev`. Para desarrollo con Electron, abre otra terminal, establece `$env:TABLERO_DEV='1'` y ejecuta `npm run desktop`.

Pruebas: `npm test` y, tras compilar, `npm run test:ui`. Las pruebas de interfaz abren instancias aisladas de Electron y almacenan sus archivos bajo `.local-test`, sin tocar los tableros personales.

La aplicación utiliza React, TypeScript, Vite, Electron, Excalidraw, PDF.js y jsPDF. Consulta `THIRD_PARTY_NOTICES.md` y `package-lock.json`.

## Licencia de esta publicación

Consulta [LICENSE](../LICENSE) y [el resumen de uso permitido](LICENCIA.es.md). La licencia específica de la publicación 1.2.1 permite servicios comerciales y prohíbe vender el programa. Los componentes de terceros conservan sus licencias propias.
