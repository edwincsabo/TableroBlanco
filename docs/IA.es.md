# Resumir y proponer tareas con IA

**Español** · [English](AI.en.md) · [简体中文](AI.zh-CN.md)

Disponible desde TableroBlanco 1.4.0 para Windows. El asistente resume el texto seleccionado, propone tareas y señala preguntas abiertas. La IA es opcional y está desactivada por defecto. El dibujo, el guardado, las plantillas y las demás herramientas siguen funcionando sin configurar un proveedor.

## Configurar el proveedor

1. Abre **Configuración → Inteligencia artificial opcional** en la biblioteca, o abre **Resumir y proponer tareas → Configurar IA** en el editor.
2. Elige **OpenAI**, **OpenRouter** o **Claude (Anthropic)**.
3. Revisa el identificador del modelo y escribe uno disponible en tu cuenta que admita respuestas JSON estructuradas. Los valores iniciales son ejemplos editables, no una garantía de acceso: `gpt-4.1-mini`, `openai/gpt-4.1-mini` y `claude-haiku-5-5`, respectivamente.
4. Pega la clave de API del proveedor, marca **Activar IA opcional** y pulsa **Guardar configuración de IA**.

Guardar la configuración no envía solicitudes ni valida la clave con el proveedor. La autenticación, el modelo y sus permisos se comprueban al realizar un análisis. Necesitas acceso a la API y el saldo o la facturación que requiera tu proveedor; la aplicación no incluye créditos ni garantiza que una suscripción de chat los incluya.

Puedes guardar un modelo y una clave por proveedor. Solo se utiliza el proveedor activo. Cambiarlo requiere guardar la configuración y revisar la nueva vista previa antes de enviar contenido.

## Crear una propuesta

1. Selecciona las notas adhesivas, las formas con texto o los objetos de texto que quieras analizar. El texto de una nota se incluye al seleccionar su forma.
2. Pulsa **Resumir y proponer tareas** en la barra inferior.
3. Revisa los textos, el proveedor y el modelo mostrados. El asistente no añade automáticamente el resto del tablero.
4. Pulsa **Enviar y analizar**. El resultado se solicita en el idioma actual de la interfaz: español, inglés o chino simplificado.
5. Revisa y edita el resumen, las tareas y las preguntas. Puedes desmarcar las tareas que no quieras incluir.
6. Pulsa **Insertar como nuevas tarjetas**, o **Descartar propuesta**.

Las tarjetas insertadas son objetos editables del lienzo. Las notas originales se conservan. La respuesta no modifica el tablero hasta que elijas insertarla. No se ejecutan tareas, se asignan personas ni se envían mensajes a terceros.

Las tareas distinguen **Acción mencionada en las notas** de **Sugerencia de IA** y muestran los identificadores de los textos de origen de la vista previa. Esto facilita revisar la propuesta, pero no demuestra que la interpretación sea correcta. Comprueba especialmente responsables, fechas y compromisos: la IA puede equivocarse o sugerir algo que no habías decidido.

## Qué se envía y dónde se guarda

Se envían el texto seleccionado, identificadores temporales como `n1`, las instrucciones de resumen y el esquema del resultado. No se envían automáticamente el nombre del tablero, miniaturas, imágenes, PDF, trazos, historial, rutas de archivos ni textos no seleccionados. No se hace OCR ni se siguen los enlaces escritos en las notas.

La clave se utiliza únicamente para autenticar la solicitud, no como parte del texto del modelo. Las conexiones se realizan desde el proceso principal a los endpoints fijos de los tres proveedores. No se aceptan servidores personalizados ni redirecciones de autenticación.

Las claves se cifran con Electron safeStorage, que utiliza la protección de Windows para el usuario actual, y se guardan en `ai-settings.json` dentro del perfil de la aplicación. Quedan fuera de la biblioteca, los archivos exportados y los respaldos de tableros. No se muestran de nuevo y debes configurarlas por separado en otro equipo. Este cifrado no protege frente a aplicaciones maliciosas que se ejecuten con tu mismo usuario de Windows.

El asistente no crea un historial local de consultas. Si insertas el resultado, pasa a formar parte del tablero y de sus guardados y respaldos habituales, incluida la carpeta sincronizada si la elegiste. El tratamiento y la retención del contenido enviado dependen del proveedor. OpenRouter puede dirigir la solicitud a otro proveedor de modelos. En OpenAI se solicita `store: false`; esto no equivale a una garantía de retención cero.

## Límites y errores

- Entre 1 y 60 objetos de texto, hasta 6000 caracteres cada uno y 20 000 caracteres en total. Una selección más larga se rechaza; no se recorta silenciosamente.
- Hasta 12 tareas y ocho preguntas. Las respuestas se validan antes de mostrarse.
- Tiempo de espera de 60 segundos. Puedes cancelar el análisis o cerrar el asistente.
- Una solicitud por análisis, sin reintentos automáticos. Una cancelación no garantiza que el proveedor deje de procesar o de facturar una solicitud que ya recibió.

Una clave incorrecta, un modelo sin acceso o sin soporte para el formato estructurado, un límite de uso, la falta de conexión o una respuesta inválida muestran un aviso y no insertan contenido. Una configuración guardada no garantiza que todos los modelos del proveedor sean compatibles.

## Desactivar o eliminar la clave

Usa **Desactivar IA** para conservar la clave cifrada sin permitir nuevos análisis. Usa **Eliminar clave guardada** para quitar la credencial de ese proveedor de este equipo; si era el proveedor activo, la IA se desactiva. Eliminarla aquí no revoca la clave en la cuenta del proveedor: hazlo también allí si lo necesitas.

## Referencias de implementación

- [OpenAI: respuestas estructuradas](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).
- [OpenRouter: respuestas estructuradas](https://openrouter.ai/docs/guides/features/structured-outputs).
- [Claude: respuestas estructuradas](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).
- [Electron: safeStorage y alcance del cifrado en Windows](https://www.electronjs.org/docs/latest/api/safe-storage).

[Volver al README](../README.md)
