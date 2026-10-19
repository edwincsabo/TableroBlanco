# Carpetas sincronizadas y recuperación

**Español** · [English](SYNC.en.md) · [简体中文](SYNC.zh-CN.md)

Disponible desde TableroBlanco 1.3.0 para Windows. Puedes guardar tu biblioteca en una carpeta sincronizada por OneDrive, Google Drive u otro cliente de escritorio. TableroBlanco trabaja con los archivos locales; el proveedor se encarga de transferirlos a la nube. No necesitas iniciar sesión dentro de TableroBlanco.

## Configurar una carpeta

1. Instala y configura el cliente de sincronización que prefieras, con tu cuenta del proveedor.
2. Crea una carpeta dedicada, por ejemplo `OneDrive\TableroBlanco` o una carpeta dentro de tu unidad de Google Drive.
3. Configura esa carpeta para que sus archivos estén disponibles sin conexión. En OneDrive puedes usar **Mantener siempre en este dispositivo**. En Google Drive puedes usar una carpeta en espejo o disponible sin conexión.
4. En la biblioteca de TableroBlanco abre **Configuración → Ubicación de los tableros → Cambiar carpeta**.
5. Selecciona la carpeta y revisa la ruta y la cantidad de tableros. Pulsa **Copiar y usar carpeta**.

La aplicación crea un respaldo local, copia los tableros y su historial y verifica el contenido antes de activar la ubicación. Si el destino ya contiene tableros, se conservan. Si un identificador coincide pero el contenido es diferente, la versión que se está copiando se guarda con otro identificador y el nombre termina en **copia por conflicto**.

Los archivos del origen no se eliminan. Después del cambio, solo la nueva ubicación recibe los guardados; la carpeta anterior es una copia del momento de la migración. No elijas una carpeta que contenga a la biblioteca actual ni que esté dentro de ella. Tampoco uses la carpeta de recuperación local como destino.

## Continuar en otro equipo

Instala TableroBlanco y el cliente de sincronización en el otro equipo. Espera a que descargue la biblioteca, hazla disponible sin conexión y selecciona esa carpeta desde Configuración. Los tableros locales de ese equipo se añaden a los del destino conservando ambas bibliotecas.

Antes de cambiar de computador, termina la edición y comprueba en el cliente del proveedor que la sincronización haya finalizado. El indicador **Guardado en la carpeta** confirma una escritura local; no confirma una subida a la nube. TableroBlanco no muestra el estado de transferencia ni la cuota del proveedor.

## Cambios externos y conflictos

La aplicación comprueba los cambios de archivos aproximadamente cada tres segundos y al recuperar el foco. La biblioteca se actualiza automáticamente. Un lienzo abierto no se reemplaza con contenido externo: aparece un aviso si su archivo cambia o desaparece.

Si guardas una revisión obsoleta, tus cambios se guardan en un tablero separado. La versión que llegó a la carpeta se conserva, y puedes abrir ambas desde la biblioteca. No existe combinación automática de objetos ni colaboración simultánea. Las copias de conflicto creadas por un proveedor con nombres de archivo distintos también se muestran como tableros separados.

Estas comprobaciones reducen el riesgo de sobrescritura, pero no son un bloqueo distribuido ni garantizan resolver todas las carreras entre clientes. La sincronización depende del proveedor y de la conexión. Evita editar el mismo tablero en dos equipos a la vez y conserva copias independientes.

## Carpeta desconectada o archivos ilegibles

Si desaparece una carpeta configurada, la aplicación avisa y no cambia silenciosamente a otra biblioteca vacía. Reconecta la unidad o el cliente y espera a que la carpeta vuelva a estar disponible. Los archivos ilegibles se conservan y se indican en el aviso; no se eliminan ni se sustituyen automáticamente.

Si falla el guardado, el editor muestra el error y permite exportar una copia editable. Si hay cambios pendientes al cerrar, la ventana permanece abierta cuando no se pueden guardar. No cambies de carpeta mientras el origen no esté disponible: primero reconéctalo o recupera tus copias.

## Recuperación local y respaldo independiente

Abre **Configuración → Abrir recuperación local**. Esta ubicación permanece en el perfil de Windows, fuera de la biblioteca elegida:

- `migraciones`: copia verificada de los tableros y su historial antes de cambiar de carpeta. `origen.txt` indica de dónde se copiaron.
- `estados`: último estado enviado al guardado y su predecesor por tablero y ubicación. Estos archivos no constituyen un historial completo ni una copia en la nube.

Para recuperar un tablero, usa **Importar** y selecciona su archivo `.json`; se abrirá como una copia con un identificador nuevo. Para recuperar una biblioteca completa, importa sus tableros o utiliza una copia JSON creada desde **Crear copia de seguridad completa**. El respaldo completo exportado no incluye las instantáneas del historial.

La sincronización también puede propagar eliminaciones. Conserva un respaldo independiente de los archivos sincronizados, especialmente antes de actualizar, cambiar de cuenta o reorganizar carpetas.

## Límites y verificación

La función se probó con carpetas de demostración, cambios de archivos que simulan otro equipo, conflictos, reinicios y desconexiones. No se utilizó la cuenta personal del usuario ni se certificó una transferencia real con todos los proveedores. Requiere que el cliente permita lectura y escritura normales de archivos y tenga espacio y permisos suficientes.

[Volver al README](../README.md)
