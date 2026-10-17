# Verificación de TableroBlanco 1.2.0

Fecha de entrega: 17 de octubre de 2026. Plataforma verificada: Windows x64.

## Resultado

- Compilación TypeScript y Vite: correcta.
- Pruebas de almacenamiento y geometría: 4 correctas.
- Pruebas de interfaz sobre el código fuente con Electron oficial: 7 casos correctos, incluidos idiomas y plantillas.
- Pruebas contra el ejecutable empaquetado 1.2.0: no ejecutadas debido a la restricción de Windows Device Guard observada anteriormente en 1.1.0 (código de salida 4551). No se modificó la directiva.
- Instalador NSIS y ejecutable portable: generados.
- Paquete inspeccionado sin ejecutarlo: versión 1.2.0, archivos de traducción y recursos locales presentes en app.asar.
- Firma digital: no se proporcionó un certificado comercial; ejecutables sin firma.

## Cobertura ejecutada

1. Guardados concurrentes serializados, persistencia del último cambio y ausencia de temporales sobrantes.
2. Rechazo de identificadores con rutas ajenas al almacenamiento y conservación de archivos dañados.
3. Creación, lectura y eliminación de instantáneas locales.
4. Reconocimiento geométrico de círculos y rectángulos cerrados; rechazo de trazos abiertos.
5. Crear y renombrar tablero, insertar una nota, encontrarla con búsqueda y recuperar su contenido tras reiniciar la aplicación. Peticiones HTTPS bloqueadas durante la prueba y por el runtime empaquetado.
6. Apertura de un archivo `.tablero` mediante argumento de Windows; cierre de la ventana inmediatamente después de un cambio y recuperación posterior del contenido guardado.
7. Crear desde Kanban, buscar texto de la plantilla, dibujar un trazo de resaltador y verificar su transparencia en el archivo guardado; iniciar, pausar y reiniciar el temporizador; activar tema oscuro; guardar y restaurar una copia de seguridad; mover un tablero a papelera y restaurarlo.
8. Insertar imagen PNG y dos páginas PDF; exportar `.tablero`, PNG, SVG y PDF; comprobar estructura o cabecera de los archivos; volver a importar el tablero editable y conservar sus tres imágenes.
9. Comprobar 57 identificadores únicos de plantilla, vistas previas no vacías con dimensiones válidas, nueve categorías con los recuentos esperados (ocho de seis y Aprendizaje de nueve), búsqueda global sin tildes, resultados vacíos y sección de plantillas personales.
10. Crear desde Comparar y contrastar, añadir una nota y después insertar Los cinco porqués en el mismo tablero; encontrar el contenido de ambos diseños y verificar identificadores únicos y referencias válidas de textos y formas en el archivo guardado.

También se corrigió la superposición de los menús de tarjetas en bibliotecas con varias filas y se verificó mover a la papelera y restaurar un tablero después de recuperar una copia de seguridad.

11. Comprobar que existen exactamente tres idiomas, cambiar entre español, inglés y chino simplificado, traducir la interfaz y el catálogo, crear un tablero desde una plantilla en inglés, insertar otra plantilla en chino, conservar una nota multilingüe y el nombre del tablero, reiniciar manteniendo el idioma y volver a español sin cambiar el contenido. Se verificaron nombres, descripciones y textos de vista previa en chino para las 57 plantillas. Este caso se volvió a ejecutar después de la compilación final 1.2.0 y pasó.

Las pruebas funcionales abrieron instancias aisladas de desarrollo, sin modificar el almacenamiento de uso personal. También se inspeccionaron capturas de la biblioteca y del selector de plantillas en chino dentro del editor. Las traducciones fueron preparadas para esta entrega; no se realizó una revisión lingüística externa.

## Límites de verificación

El arranque del ejecutable empaquetado 1.2.0 queda sin verificar por la restricción de Device Guard observada en la entrega anterior. No se ejecutó una instalación en otro equipo ni el asistente de instalación sobre el perfil personal. No se verificaron dispositivos físicos táctiles o lápices digitales, archivos PDF cifrados, todos los posibles documentos o las funciones de Microsoft 365. La aplicación cubre el alcance personal y local descrito en README.md; esta verificación no acredita equivalencia total con Microsoft Whiteboard.

Para repetir las pruebas del código fuente en PowerShell:

```powershell
npm test
npm run test:ui
```

Los casos de idiomas se ejecutan con el runtime oficial de desarrollo. Otros casos admiten `TABLERO_EXECUTABLE` cuando la política del equipo permite el ejecutable. No se debe desactivar Device Guard para probarlo; una distribución aprobada puede requerir firma y autorización del administrador.
