# TableroBlanco 1.4.0 — Asistente de IA opcional

Pizarra para Windows x64, con 57 plantillas, tres idiomas y carpeta de biblioteca configurable.

## Novedades

- **Resumir y proponer tareas** a partir de las notas y textos seleccionados, con resumen, tareas y preguntas abiertas.
- Compatibilidad con **OpenAI**, **OpenRouter** y **Claude (Anthropic)** mediante una clave propia y un modelo compatible con respuestas estructuradas.
- IA desactivada por defecto: requiere guardar una clave y activarla explícitamente.
- Vista previa del texto, proveedor y modelo antes de pulsar **Enviar y analizar**.
- Respuesta editable antes de insertar nuevas tarjetas. Las notas originales se conservan y las tareas distinguen acciones mencionadas de sugerencias.
- Claves cifradas para el usuario de Windows, fuera de la biblioteca sincronizada, exportaciones y respaldos de tableros. Se pueden eliminar o conservar con la IA desactivada.
- Límites de selección, validación de respuestas, cancelación, tiempo de espera y errores sin reintentos automáticos.
- Configuración, asistente y documentación en español, inglés y chino simplificado.

El proveedor procesa el texto seleccionado fuera del equipo y puede cobrar por el uso de su API. La aplicación no incluye claves ni créditos y no analiza imágenes o PDF. OpenRouter puede dirigir el texto a otro proveedor de modelos. Revisa la propuesta: puede contener errores. Las herramientas de pizarra siguen funcionando sin configurar IA.

Guías: [Español](https://github.com/edwincsabo/TableroBlanco/blob/main/docs/IA.es.md) · [English](https://github.com/edwincsabo/TableroBlanco/blob/main/docs/AI.en.md) · [简体中文](https://github.com/edwincsabo/TableroBlanco/blob/main/docs/AI.zh-CN.md).

## Descargas

- **Instalador.exe**: instalación para el usuario actual, carpeta configurable y accesos directos.
- **Portable.exe**: ejecución sin instalación. Los datos se guardan en el perfil de Windows o en la biblioteca elegida; las claves permanecen en el perfil local.
- **SHA256SUMS.txt**: hashes de los ejecutables para verificar la integridad.

No necesitas Node.js para utilizar los ejecutables. La publicación es preliminar y no tiene firma digital comercial. Mantén las protecciones de Windows activas y respalda tus tableros antes de actualizar.

## Licencia

El código propio utiliza TableroBlanco No-Sale License 1.0: permite el uso empresarial y los servicios comerciales, y prohíbe vender el programa o versiones modificadas que contengan su código. Los componentes de terceros conservan sus licencias. Consulta LICENSE.

## English

Optional AI summarizes selected text and proposes tasks using your own OpenAI, OpenRouter or Claude API key. AI is off by default and requires explicit configuration and activation. Review the exact texts and provider before sending, then edit or discard the proposal before inserting new cards. Keys are encrypted for the Windows user and excluded from board exports, backups and the synchronized library. Providers may charge for usage; no credits are included. No images or PDFs are analyzed. Ordinary whiteboard tools still work without AI.

## 简体中文

可选 AI 助手使用您自己的 OpenAI、OpenRouter 或 Claude API 密钥总结所选文字并提出任务。AI 默认停用，需要主动配置并启用。发送前可核对文字和服务提供商，收到建议后可编辑、放弃或插入为新卡片。密钥为当前 Windows 用户加密，不包含在白板导出文件、备份或同步白板库中。服务提供商可能收取使用费用，应用不提供使用额度。不分析图片或 PDF。无需配置 AI，仍可使用其他白板工具。
