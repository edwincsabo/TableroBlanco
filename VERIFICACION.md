# Verificación de TableroBlanco 1.4.0

Versión con IA opcional para resumir texto seleccionado y proponer tareas mediante OpenAI, OpenRouter o Claude. Las pruebas utilizan claves ficticias y transportes simulados; no se han usado claves personales ni consumido créditos reales de proveedores.

## Verificación local

- TypeScript y compilación Vite: correctos.
- Lógica, almacenamiento, migración, geometría e IA: 27 pruebas correctas.
- Interfaz con el runtime oficial de Electron: 11 pruebas correctas.
- Instalador NSIS y portable para Windows x64: generados correctamente.
- Auditoría de dependencias de producción: cero vulnerabilidades conocidas en la consulta realizada para esta versión.

Un bloqueo temporal del servicio de revisión automática impidió los primeros intentos de ejecutar Electron. Tras reintentarlo por la misma vía autorizada, la suite local completa terminó correctamente. No se eludieron revisiones ni se modificaron las protecciones del equipo.

La comprobación de interfaz y del ejecutable empaquetado se realizará en el flujo de GitHub Actions antes de publicar las descargas. Este informe se actualizará con su resultado. No se presenta una respuesta simulada como una llamada real al proveedor.

## Cobertura de IA

Se comprobaron desactivación inicial, bloqueo sin clave o activación, confirmación de envío, revisión de configuración para no cambiar silenciosamente de proveedor, cifrado y ausencia de claves en el estado público, eliminación de credenciales y persistencia al reiniciar. Los contratos de solicitud de los tres proveedores verifican endpoints, cabeceras, formato estructurado y envío exclusivo de los textos recibidos.

También se comprobaron límites de entrada, respuestas inválidas o truncadas, referencias inexistentes, errores de autenticación y uso sin revelar cuerpos del proveedor, ausencia de reintentos automáticos, cancelación inmediata y durante la solicitud, exclusión de texto no seleccionado y creación de objetos nuevos sin modificar los originales.

Los casos de interfaz cubren configuración con una clave ficticia cifrada por Windows, selección limitada, vista previa editable, descarte de tareas, inserción, reinicio, eliminación de claves, errores y los controles en los tres idiomas. Se conservan las pruebas de pizarra, plantillas, documentos y carpetas sincronizadas.

## Límites

Los adaptadores siguen la documentación oficial consultada para esta versión, con respuestas simuladas representativas. No se certifica el acceso de una cuenta particular, la disponibilidad de todos los modelos, el precio del proveedor ni la exactitud de los resúmenes. Un modelo debe admitir el formato estructurado utilizado por su API. La validación del JSON no demuestra que las tareas propuestas sean correctas.

Las claves se protegen con Electron safeStorage para el usuario de Windows y quedan fuera de los datos de los tableros. Esto no protege contra aplicaciones maliciosas que se ejecuten con ese mismo usuario. Las condiciones de tratamiento y retención del texto dependen del proveedor; store: false no es una garantía de retención cero.

La sincronización de carpetas se comprueba mediante archivos y cambios simulados, sin acceso a cuentas personales. Los ejecutables permanecen sin firma digital comercial. No se cambian las protecciones del equipo ni se ejecuta el instalador sobre el perfil personal del usuario.

Consulta la [guía de IA](docs/IA.es.md), la [guía de carpetas sincronizadas](docs/SINCRONIZACION.md) y el [informe de la versión 1.3.0](docs/VERIFICACION-1.3.0.md).
