# Contribuir a TableroBlanco

Puedes proponer mejoras, reportar problemas o enviar cambios mediante una pull request. Antes de comenzar una función grande, abre un issue para acordar su alcance.

## Preparar el proyecto

```powershell
git clone https://github.com/edwincsabo/TableroBlanco.git
cd TableroBlanco
npm ci
npm run build
npm run desktop
```

Se necesita Windows x64, Node.js 24 y npm. Node.js solo se necesita para desarrollar o compilar; los usuarios de los ejecutables no tienen que instalarlo.

## Validar un cambio

Ejecuta `npm test` para almacenamiento y geometría. Para un cambio de interfaz ejecuta primero `npm run build` y después `npm run test:ui`. Estas pruebas abren instancias aisladas de Electron; no utilizan los tableros personales.

Describe el problema, el cambio y las pruebas realmente ejecutadas en la pull request. Incluye una captura si cambia la interfaz. No publiques tableros personales, contraseñas, tokens, correos privados ni archivos de configuración de tu equipo.

## Plantillas y traducciones

- El catálogo se define en `src/templateCatalog.ts` y los diseños iniciales en `src/templates.ts`.
- Las traducciones de interfaz están en `shared/ui.json` y las de plantillas en `shared/templates.json`.
- Cada entrada tiene su clave en español y dos valores: inglés y chino simplificado.
- Conserva los marcadores `{0}`, `{1}`, etc. No traduzcas texto escrito por el usuario ni los identificadores internos.

## Licencia de las contribuciones

Al enviar una contribución para incorporarla a este proyecto, confirmas que puedes compartirla y aceptas que se distribuya bajo la licencia de [LICENSE](LICENSE). Conservas los derechos que te correspondan sobre tu trabajo. No incluyas código de terceros sin su licencia y sus avisos.
