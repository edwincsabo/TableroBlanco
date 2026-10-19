# Verificación de TableroBlanco 1.2.1

La primera publicación pública se compiló, probó y publicó mediante [GitHub Actions](https://github.com/edwincsabo/TableroBlanco/actions/runs/39057257658). La ejecución terminó correctamente el 17 de octubre de 2026; los enlaces de descarga se comprobaron el 18 de octubre de 2026.

## Entorno y resultados

- Entorno de GitHub: Windows Server 2025 x64, Node.js 24 y Electron 44.9.0.
- Instalación de dependencias con `npm ci`: correcta.
- Auditoría `npm audit --omit=dev --audit-level=high`: cero vulnerabilidades conocidas de producción en esa ejecución.
- Almacenamiento y geometría: cuatro pruebas correctas.
- Compilación TypeScript y Vite: correcta.
- Interfaz con Electron oficial: siete pruebas correctas.
- Empaquetado NSIS y portable: correcto.
- Verificación posterior al empaquetado: siete casos correctos; seis utilizaron el ejecutable empaquetado y el caso de idiomas utilizó el runtime oficial de desarrollo.
- Publicación de la release, la licencia y los hashes: correcta.
- Enlaces públicos del instalador y del portable: HTTP 200. Los hashes de `SHA256SUMS.txt` coinciden con los digests publicados por GitHub.

El informe completo de instalación también indicó ocho avisos moderados en dependencias de desarrollo. El resultado de cero corresponde a dependencias de producción; no se presenta como una auditoría total sin avisos ni como una certificación de seguridad.

## Cobertura funcional

Las pruebas comprobaron guardados concurrentes, recuperación de versiones, rechazo de rutas inválidas, conservación de archivos dañados y reconocimiento de formas. En la interfaz se verificaron creación y renombrado de tableros, notas, búsqueda, persistencia tras reiniciar, apertura de archivos, cierre con cambios pendientes, favoritos, plantillas, resaltador, temporizador, copias de seguridad y papelera.

También se comprobaron imágenes, dos páginas PDF, exportaciones `.tablero`, PNG, SVG y PDF, reimportación editable, 57 diseños con identificadores únicos, nueve categorías y conservación del contenido al insertar otra plantilla. El caso de idiomas comprobó español, inglés y chino simplificado, preferencia persistente, textos de las 57 plantillas en chino y preservación del contenido escrito por el usuario.

## Límites

Los ejecutables no tienen firma digital comercial. Una política de Device Guard bloqueó anteriormente una compilación local; no se modificó esa política. Las pruebas posteriores del binario se realizaron en el entorno de GitHub, donde la ejecución estaba permitida.

No se ejecutó el asistente de instalación sobre el perfil personal del usuario ni se comprobaron todos los equipos Windows, dispositivos táctiles o lápices digitales. Las pruebas automáticas utilizan ratón y teclado. La revisión lingüística no fue realizada por un asesor externo.

La publicación permanece marcada como preliminar. El resultado correcto en GitHub no garantiza que el software sea admitido por la política de seguridad de otra organización.

## Repetir las pruebas

```powershell
npm ci
npm test
npm run build
npm run test:ui
npm run dist
```

Los casos compatibles con un paquete admiten `TABLERO_EXECUTABLE` con su ruta. No desactives protecciones para probarlo. El [informe anterior](VERIFICACION-ANTERIOR.md) conserva el contexto de las primeras entregas locales.
