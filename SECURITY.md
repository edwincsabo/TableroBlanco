# Seguridad

Antes de abrir un issue, revisa que no incluya tableros personales, datos privados, credenciales o archivos completos de tu perfil de Windows.

Si encuentras una vulnerabilidad, utiliza **Security → Report a vulnerability** si esa opción está disponible. Si no aparece, solicita al mantenedor un canal privado mediante un issue sin describir detalles de explotación ni adjuntar datos sensibles.

Los ejecutables publicados no tienen firma digital comercial. No desactives Device Guard, Microsoft Defender ni otras protecciones para ejecutarlos. Si una política de tu organización los bloquea, solicita la revisión del administrador.

Las versiones preliminares pueden tener limitaciones. Conserva copias de seguridad de tus tableros antes de actualizar.

Antes de publicar 1.2.1 se actualizaron jsPDF y dependencias transitivas señaladas por npm audit. La auditoría de dependencias de producción del 17 de octubre de 2026 informó cero vulnerabilidades conocidas. Esto describe ese resultado y esa fecha; no es una certificación de seguridad ni reemplaza la revisión de nuevos avisos. El flujo de publicación revisa las dependencias y detiene la release si aparecen avisos altos o críticos.
