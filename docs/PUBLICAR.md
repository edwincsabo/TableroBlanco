# Cómo publicar una nueva versión

El repositorio contiene el código y las instrucciones. La sección **Releases** contiene las descargas instalables. Los archivos grandes `.exe` no se guardan dentro del historial Git.

## Desde tu equipo

1. Actualiza el código y la documentación.
2. Cambia la versión con `node scripts/set-version.mjs 1.2.2`, sustituyendo el número por el que corresponda.
3. Ejecuta `npm test`, `npm run build` y `npm run test:ui`.
4. Ejecuta `npm run dist` para generar los ejecutables.
5. Revisa el instalador y el informe de verificación.
6. Sube el código a GitHub y crea una etiqueta, por ejemplo `v1.2.2`.
7. En **Releases → Draft a new release**, selecciona la etiqueta y adjunta el instalador, el portable, las notas y `SHA256SUMS.txt`.

## Con GitHub Actions

El flujo **Publicar Windows** permite compilar y publicar desde GitHub. En **Actions**, selecciona ese flujo, pulsa **Run workflow** y escribe una etiqueta que coincida con la versión de package.json, por ejemplo `v1.2.1`.

El flujo instala las dependencias fijadas, compila, prueba, empaqueta y crea una release preliminar con el instalador y el portable. Utiliza el token temporal de GitHub Actions, limitado al repositorio. No necesitas crear un token personal ni compartir contraseñas.

No publiques como estable una versión que no hayas podido comprobar en un entorno permitido. Una compilación correcta no equivale a una firma digital ni garantiza compatibilidad con todos los equipos.
