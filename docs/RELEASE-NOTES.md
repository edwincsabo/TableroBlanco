# TableroBlanco 1.3.0 — Carpetas sincronizadas

TableroBlanco para Windows x64, con 57 plantillas y tres idiomas: español, inglés y chino simplificado.

## Novedades

- Elige la ubicación de tus tableros desde **Configuración → Ubicación de los tableros → Cambiar carpeta**. Puede ser una carpeta dedicada de OneDrive, Google Drive u otro cliente instalado.
- Copia verificada de tableros e historial, conservación del origen y respaldo local antes de cambiar de ubicación.
- Actualización automática de la biblioteca cuando llegan cambios externos, sin reemplazar el lienzo abierto.
- Copias separadas cuando se detectan revisiones en conflicto, para conservar ambas versiones.
- Recuperación local del último estado enviado a guardar y su predecesor; acceso desde Configuración.
- Configuración y guía de sincronización en español, inglés y chino simplificado.

La sincronización la realiza el cliente externo y requiere su propia cuenta. **Guardado en la carpeta** no confirma una subida a la nube. Mantén la biblioteca disponible sin conexión, espera a que el proveedor termine antes de cambiar de equipo y evita editar el mismo tablero simultáneamente. No hay combinación automática de dibujos ni colaboración en tiempo real.

Guías: [Español](https://github.com/edwincsabo/TableroBlanco/blob/main/docs/SINCRONIZACION.md) · [English](https://github.com/edwincsabo/TableroBlanco/blob/main/docs/SYNC.en.md) · [简体中文](https://github.com/edwincsabo/TableroBlanco/blob/main/docs/SYNC.zh-CN.md).

## Descargas

- **Instalador.exe**: instalación para el usuario actual, carpeta configurable y accesos directos.
- **Portable.exe**: ejecución sin instalación. Los datos se guardan en el perfil del usuario o en la biblioteca elegida en Configuración.
- **SHA256SUMS.txt**: hashes de los ejecutables para comprobar la integridad.

No se necesita Node.js para usar los ejecutables. Esta es una publicación preliminar y sin firma digital comercial. Una compilación correcta no garantiza que la política de seguridad de tu organización permita su ejecución. No desactives protecciones para probarla.

## Licencia

El código propio utiliza TableroBlanco No-Sale License 1.0: permite uso empresarial y servicios comerciales, y prohíbe la venta del programa o de versiones modificadas que contengan su código. Los componentes de terceros conservan sus licencias. Lee LICENSE antes de redistribuir.

La licencia se utiliza desde la primera publicación pública, versión 1.2.1. Los paquetes locales anteriores conservan MIT.

## English

Choose a dedicated synchronized folder in **Settings → Boards location → Change folder**. Boards and history are copied and verified before switching, with the original files preserved and an independent local recovery copy. External changes refresh the library; detected conflicts keep both versions. An installed provider client handles synchronization. Keep files available offline and wait for uploads before switching computers. This is not real-time collaboration.

## 简体中文

在**设置 → 白板位置 → 更改文件夹**中选择专用同步文件夹。启用新位置前，会复制并验证白板及其历史记录，保留原始文件并创建独立的本地恢复副本。外部更改会刷新白板库，检测到冲突时会保留两个版本。同步由已安装的服务提供商客户端完成。请将文件设为可离线使用，并在切换电脑前等待上传完成。本功能不提供实时协作。
