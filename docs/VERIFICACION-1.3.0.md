# Verificación de TableroBlanco 1.3.0

Versión con selección de carpeta para la biblioteca, migración verificada, detección de cambios externos, copias por conflicto y recuperación local. La revisión local se realizó el 18 de octubre de 2026 con perfiles de demostración, sin cambiar la ubicación de los tableros personales del usuario.

## Comprobación local

- TypeScript y compilación Vite: correctos.
- Almacenamiento, migración y geometría: 12 pruebas correctas.
- Interfaz con el runtime oficial de Electron: nueve pruebas correctas.
- Auditoría de dependencias de producción: cero vulnerabilidades conocidas en la consulta realizada para esta versión.
- Generación local del instalador NSIS y del portable para Windows x64: correcta.
- Documentación en español, inglés y chino simplificado: enlaces locales y comandos de desarrollo comprobados.

Las pruebas de carpeta sincronizada también se ejecutan con una ventana estrecha, comprobando que el indicador de guardado sigue visible. La prueba de idiomas respeta TABLERO_EXECUTABLE, igual que los otros casos.

## Cobertura de la función de carpetas

Las pruebas comprobaron copia de tableros e historial, conservación del origen, unión con una biblioteca de destino, conflictos de identificadores, persistencia de la ubicación tras reiniciar, revisión obsoleta, borrado externo, carpeta desconectada, recuperación local y conservación de archivos ilegibles. También verificaron que las carpetas solapadas se rechazan, que una configuración dañada no activa otra biblioteca y que un fallo al confirmar la configuración mantiene el origen activo.

En la interfaz se comprobaron selección y confirmación de carpeta, cancelación sin cambios, aviso de modificación externa sin reemplazar el lienzo, creación de una copia por conflicto, continuación de la edición en esa copia, llegada de un tablero externo, desconexión y reconexión y los controles en inglés y chino. Se conservaron las pruebas de dibujo, notas, plantillas, exportación, PDF, copias de seguridad y recuperación tras reiniciar.

## Paquete publicado

La [ejecución final de GitHub Actions](https://github.com/edwincsabo/TableroBlanco/actions/runs/39193858185) terminó correctamente el 18 de octubre de 2026 en horario de Colombia (19 de octubre en UTC), con el código del commit `387ed8ffba4eb76d6d2294ecf5bb90b6e0964545`.

- Dependencias de producción: cero vulnerabilidades conocidas en la auditoría de esa ejecución.
- Almacenamiento, migración y geometría: 12 pruebas correctas.
- Interfaz con Electron oficial: nueve pruebas correctas.
- Empaquetado del instalador y del portable: correcto.
- Interfaz con el ejecutable empaquetado: nueve pruebas correctas, incluida la selección de carpeta y los tres idiomas.
- [Release v1.3.0](https://github.com/edwincsabo/TableroBlanco/releases/tag/v1.3.0): publicada como preliminar, con instalador, portable, licencia, avisos de terceros y hashes.
- Descargas públicas del instalador y del portable: HTTP 200. Los valores de SHA256SUMS.txt coinciden con los digests de los archivos publicados por GitHub.

Una ejecución anterior detectó que el diseño compacto ocultaba el indicador de guardado. Se corrigió y se repitió el flujo completo; el resultado indicado corresponde a la ejecución final.

## Límites

Los cambios de otros equipos y la desconexión se simularon mediante archivos y carpetas locales. No se inició sesión en cuentas personales ni se certificó una transferencia real con OneDrive, Google Drive u otro proveedor. El cliente externo debe permitir lectura y escritura normal, tener permisos y espacio suficiente y mantener la carpeta disponible sin conexión.

La comprobación de revisiones reduce sobrescrituras, pero no constituye un bloqueo distribuido ni una combinación automática de dibujos. No se garantiza resolver todas las carreras entre clientes de sincronización. El indicador de guardado confirma una escritura local y no el fin de una subida a la nube.

Los ejecutables no tienen firma digital comercial. Una política de Device Guard bloqueó una compilación local anterior; no se modificaron las protecciones del equipo. No se ejecutó el instalador sobre el perfil personal ni se verificaron todos los dispositivos táctiles o lápices digitales. La revisión lingüística no fue realizada por un asesor externo.

## Repetir las pruebas

```powershell
npm ci
npm test
npm run build
npm run test:ui
npm run dist
```

Las pruebas de interfaz aceptan TABLERO_EXECUTABLE con la ruta al ejecutable extraído. El [informe de la versión 1.2.1](VERIFICACION-1.2.1.md) conserva la verificación de la primera publicación pública.
