# Verificación de la continuación RA2

Verificado el 6 de noviembre de 2026 con Python 3.12, Django 5.2 y Node.js 24.

- `python manage.py test`: 26 pruebas aprobadas.
- `python manage.py check`: sin problemas detectados.
- `python manage.py makemigrations --check --dry-run`: sin cambios pendientes.
- `npm run build`: compilación Vite correcta.
- `npm run test:e2e`: prueba Playwright de registro, login, recarga, refresh y logout aprobada contra Django real.
- Navegador a 390 px: Dashboard sin desbordamiento horizontal.
- Open-Meteo: se recibieron datos reales de temperatura, humedad y estado del tiempo.
- DataAccess mediante zeep: respuesta real para 125 (`one hundred and twenty five`) y para 42 (`forty two`).

## Disponibilidad y alcance

Las pruebas unitarias del adaptador SOAP simulan al proveedor para que sean reproducibles; las llamadas reales se comprobaron adicionalmente por red. Los proveedores externos requieren Internet y pueden fallar temporalmente. No se ha verificado MySQL en este entorno.

`npm audit --omit=dev` no reportó vulnerabilidades altas ni críticas tras actualizar React Router a 6.30.6. Permanecen dos avisos moderados asociados a React Router v6; la solución publicada requiere migrar a v7, mientras que la actividad exige v6. Este proyecto usa rutas internas fijas y no utiliza hidratación SSR. Antes de un despliegue público se debe revisar la actualización de esa dependencia.

## Evidencias

El PDF adjunto contiene capturas de una cuenta de demostración creada mediante el registro de React. La salida de Console está transcrita y rotulada como tal. Para satisfacer exactamente el entregable del profesor, reemplaza esa transcripción por tu captura de React junto con DevTools.

La publicación por la conexión de GitHub fue rechazada con HTTP 403 por falta de permiso de escritura. El ZIP contiene el código actualizado y ACTUALIZAR_WINDOWS.md explica cómo copiarlo a la carpeta vinculada a tu repositorio y subirlo con tu Git local. No se modificó la rama remota main.
