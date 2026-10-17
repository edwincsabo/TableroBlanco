# TableroBlanco

Pizarra personal para Windows x64. Dibuja, organiza ideas, utiliza plantillas y anota documentos sin crear una cuenta ni depender de un servicio en la nube.

**Español · English · 中文（简体）**

[Descargar para Windows](https://github.com/edwincsabo/TableroBlanco/releases) · [Guía de uso](docs/GUIA.md) · [Licencia](LICENSE) · [Contribuir](CONTRIBUTING.md)

![Biblioteca de plantillas de TableroBlanco](docs/images/plantillas.png)

## Descargar e instalar

1. Abre [Releases](https://github.com/edwincsabo/TableroBlanco/releases).
2. En la versión que quieras utilizar, despliega **Assets**.
3. Descarga `TableroBlanco-1.2.1-Instalador.exe` o el instalador correspondiente a esa versión.
4. Cierra una instancia anterior de TableroBlanco y ejecuta el instalador. Puedes elegir la carpeta y crear accesos directos.

Si prefieres utilizarla sin instalar, descarga `TableroBlanco-1.2.1-Portable.exe`. Los tableros se guardan en el perfil del usuario de Windows, también al usar la versión portable. No necesitas Node.js, npm ni Electron para utilizar estos ejecutables.

La publicación inicial es preliminar y los ejecutables no tienen firma digital comercial. En el entorno local de desarrollo, Device Guard bloqueó una compilación anterior; no se desactivaron protecciones para probarla. Consulta [VERIFICACION.md](VERIFICACION.md) y las notas de cada release. Si tu organización bloquea la ejecución, pide al administrador que la revise.

## Características

- Lienzo con desplazamiento, zoom, selección múltiple, agrupación y ordenación de objetos.
- Lápiz, marcador, resaltador, borrador, puntero láser, regla, formas, líneas, flechas y texto.
- Notas adhesivas, cuadrículas de notas, comentarios como tarjetas, tablas y listas editables.
- Imágenes PNG, JPEG, WebP, GIF y SVG; importación de páginas PDF como imágenes para anotarlas.
- 57 plantillas en nueve categorías, búsqueda global, recomendaciones y plantillas personales.
- Temporizador, búsqueda de texto, modo presentación, fondos y tema claro u oscuro.
- Guardado automático, historial de versiones, favoritos, duplicación y papelera.
- Copias de seguridad completas e importación de `.tablero` y `.excalidraw`.
- Exportación editable `.tablero`, PNG, SVG y PDF.
- Interfaz en español, inglés y chino simplificado, con preferencia de idioma persistente.

## Plantillas

| Categoría | Cantidad |
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

Incluye mapas mentales, Kanban, FODA, SCAMPER, los cinco porqués, mapa de empatía, modelo de negocio, hoja de ruta, retrospectivas, KWL, comparación de conceptos y planes de lección. Puedes crear un tablero a partir de una plantilla o insertarla en uno existente sin reemplazar su contenido.

## Idiomas

Elige **Configuración → Idioma de la aplicación**, o utiliza el selector del editor. El cambio se aplica sin cerrar el tablero y se recuerda al reiniciar.

La interfaz y las plantillas nuevas se traducen. El texto de tus notas, los nombres de tableros existentes y tus plantillas personales conservan el idioma en el que los escribiste.

![Plantillas en chino simplificado](docs/images/idiomas.png)

## Guardado y copias de seguridad

Los tableros se guardan automáticamente en el equipo. Abre su ubicación exacta desde **Configuración → Abrir carpeta de tableros**; normalmente se encuentra en `%APPDATA%\tableroblanco\tableros`.

En Configuración puedes crear una copia completa en JSON y restaurarla en otro equipo. La restauración crea copias y conserva los tableros existentes. Las copias completas no incluyen las instantáneas del historial.

Conserva un respaldo antes de actualizar o trasladar el perfil. La aplicación no sincroniza archivos entre dispositivos.

## Alcance

TableroBlanco es una aplicación independiente, sin afiliación con Microsoft. Está orientada al uso personal y local. No reproduce todas las funciones de Microsoft Whiteboard.

No incluye cuentas, colaboración simultánea, OneDrive, Teams, Loop, Copilot ni importación del formato propietario `.whiteboard`. Los PDF se insertan como imágenes; las tablas y listas son composiciones del lienzo. El reconocimiento de tinta se limita a círculos y rectángulos cerrados. Los GIF se utilizan como imágenes estáticas.

## Código fuente y desarrollo

Requisitos: Windows x64, Node.js 24 y npm.

```powershell
git clone https://github.com/edwincsabo/TableroBlanco.git
cd TableroBlanco
npm ci
npm run build
npm run desktop
```

Para trabajar en la interfaz, ejecuta `npm run dev`. En otra terminal puedes iniciar Electron con:

```powershell
$env:TABLERO_DEV = '1'
npm run desktop
```

Pruebas:

```powershell
npm test
npm run build
npm run test:ui
```

Para generar el instalador y el portable:

```powershell
npm run dist
```

Los resultados se generan en `version-final/<versión>/`. Si Electron no se descargó durante `npm ci`, ejecuta `node node_modules/electron/install.js` antes de compilar el paquete.

## Licencia y uso comercial

El código propio se publica bajo **TableroBlanco No-Sale License 1.0**:

- Puedes usarlo y modificarlo, incluso dentro de empresas.
- Puedes compartir copias gratuitamente.
- Puedes cobrar por soporte, personalización, capacitación, consultoría o servicios de alojamiento.
- No puedes vender el programa, sus licencias ni versiones modificadas que contengan su código.

Lee [LICENSE](LICENSE) y el [resumen en español](docs/LICENCIA.es.md). Es una licencia propia de código disponible con restricción de venta, no una licencia de código abierto aprobada por la OSI. No reemplaza los permisos de versiones anteriores ni las licencias de terceros.

## Agradecimientos y componentes

El lienzo utiliza [Excalidraw](https://github.com/excalidraw/excalidraw). La aplicación se construye con React, TypeScript, Vite, Electron, PDF.js, jsPDF y Lucide. Consulta [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) y [licenses/](licenses/).

## Reportar problemas y contribuir

Usa [Issues](https://github.com/edwincsabo/TableroBlanco/issues) para reportar fallos o proponer mejoras. Incluye la versión, los pasos y el resultado esperado; no publiques datos privados ni tableros personales.

Consulta [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) y [cómo publicar nuevas versiones](docs/PUBLICAR.md).
