# Tienda Online con Django React JWT y APIs

## Ejecutar el proyecto completo con Docker Compose

Requiere Docker Desktop en ejecución. Desde la raíz del repositorio, donde está
`docker-compose.yml`, copia `.env.example` a `.env` y reemplaza los valores de
`DJANGO_SECRET_KEY` y `DB_PASSWORD` por claves privadas propias. En PowerShell:

```powershell
Copy-Item .env.example .env
# Edita .env y cambia las dos claves antes de continuar.
docker compose up -d --build
docker ps
```

Abre React en http://localhost:5173 y Swagger en http://localhost:8000/swagger/.
La primera descarga y compilación pueden tardar varios minutos. El backend ejecuta
automáticamente las migraciones cuando MySQL está listo. La base `db` solo se
comunica con Django por la red interna; no ocupa el puerto 3306 de Windows.
El navegador llama a `localhost:8000`, mientras Django llega a MySQL por el
nombre `db` de Compose. `ALLOWED_HOSTS=*` en el ejemplo sirve únicamente para
esta práctica local: cámbialo por hosts concretos antes de publicar el sistema.

Para comprobar la persistencia, registra una cuenta en `/register`, anota su
correo y ejecuta:

```powershell
docker compose down
docker compose up -d
docker ps
```

Vuelve a entrar con la misma cuenta en `/login`. Si el navegador conservó el
token, quizá se abra directamente el dashboard. La sesión del navegador puede
caducar aunque el usuario siga guardado; poder iniciar sesión de nuevo demuestra
que la cuenta persiste. Toma capturas del registro, los comandos y el acceso
después del reinicio para el informe. `docker compose down` conserva el volumen
`mysql_data`; **no uses `docker compose down -v`** para esta prueba. Mantén la
misma clave secreta en `.env` para que los JWT previos sigan siendo válidos.

Si algo falla, ejecuta `docker compose logs db backend frontend --tail=100`.
Para iniciar otra vez usa `docker compose up -d`. El archivo `.env` está
excluido de Git y del contexto de construcción; nunca subas sus claves.

**Conclusión de la práctica:** Compose deja definidas las dependencias, la red,
los puertos, la configuración y el volumen. Otra computadora necesita Docker y
un `.env` privado para levantar React, Django y MySQL con un comando, sin instalar
Python, Node y MySQL por separado.

Continuación de la Práctica 4 y adaptación del manual de las páginas 13 a 35. El backend existente conserva productos, categorías, el usuario personalizado con email y teléfono, Swagger y las correcciones de contraseñas. Se agrega un frontend React con Vite, registro público, sesión persistente, clima externo y un consumidor SOAP en Django.

## Requisitos

- Python 3.12 o superior compatible con Django 5.2 (verificado con Python 3.12).
- Node.js 22.12 o superior y npm.
- Internet para Open-Meteo y DataAccess. SQLite funciona sin instalar un servidor de base de datos; MySQL sigue siendo opcional.

## Instalación en Windows PowerShell

Clona el repositorio o actualiza tu copia. El backend permanece en la raíz para conservar tu instalación y base de datos actuales. El frontend está en `frontend/`.

Primera terminal, desde la carpeta que contiene `manage.py`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:DJANGO_SECRET_KEY = "CLAVE_PRIVADA_LARGA_Y_ALEATORIA_PARA_TU_EQUIPO"
python manage.py migrate
python manage.py runserver
```

Si ya tienes el entorno virtual, actívalo y actualiza las dependencias. No borres `db.sqlite3` ni tu base MySQL. No hay cambios nuevos al modelo de usuario respecto a la Práctica 4. La clave de Django debe mantenerse igual al reiniciar para conservar la validez de los tokens.

Segunda terminal, desde la raíz:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Abre http://127.0.0.1:5173 y elige **Crear una cuenta**. Después entra con tu email y contraseña. No se necesita un administrador para usar el Dashboard.

Para crear un administrador (opcional):

```powershell
python manage.py createsuperuser
```

En macOS/Linux, activa el entorno con `source venv/bin/activate`, usa `export DJANGO_SECRET_KEY='...'` y copia la configuración con `cp .env.example .env`.

## Rutas y estructura

| Ruta | Función | Acceso |
| --- | --- | --- |
| `/` en React | Portada | Público |
| `/login` en React | Login con email y JWT | Público |
| `/register` en React | Registro y validación | Público |
| `/dashboard` en React | Nombre, datos personales, clima y conversión | Sesión válida |
| `POST /api/v1/auth/register/` | Crea una cuenta normal | Público |
| `POST /api/v1/auth/token/` | Obtiene access y refresh | Público |
| `POST /api/v1/auth/token/refresh/` | Renueva access | Refresh válido |
| `GET /api/v1/auth/me/` | Datos personales | JWT |
| `/api/v1/users/` | CRUD de usuarios | Administrador |
| `GET /api/v1/integrations/soap/number-to-words/?number=125` | SOAP desde Django con zeep | JWT |
| `/swagger/` y `/redoc/` | Documentación del backend | Público |

El código del frontend se organiza en `api`, `context`, `hooks`, `layouts`, `routes`, `pages` y `components`. Los layouts común, cliente y Dashboard usan React Router v6. `AuthContext` y `useAuth` comparten el usuario; `useUser` consulta sus datos.

## Cómo funciona la autenticación

React manda email y password a Django, recibe el par JWT y verifica el access con `/auth/me/` antes de abrir el Dashboard. Guarda los tokens en `localStorage` y recupera el usuario al recargar. Si una petición recibe 401, intenta renovar access con refresh una sola vez; si el refresh es inválido, borra la sesión y vuelve al login. Cerrar sesión también borra el almacenamiento local.

Los tokens duran 30 minutos (access) y un día (refresh). Cerrar sesión en este ejercicio borra la copia local; no revoca un token ya emitido en el servidor. `localStorage` sigue el enfoque didáctico del manual: para un despliegue público se debe evaluar el almacenamiento en cookies HttpOnly y las medidas contra XSS/CSRF. Esta configuración de Django es para desarrollo local.

La contraseña nunca forma parte de la respuesta del usuario. Registro valida coincidencia, fortaleza y unicidad, usa `set_password` y no acepta privilegios de administrador. El CRUD administrativo conserva la contraseña si no se envía en PUT/PATCH.

## API externa con fetch

`frontend/src/components/WeatherWidget.jsx` llama directamente con `fetch` a Open-Meteo para mostrar temperatura, humedad, estado del tiempo y hora local de San Luis Río Colorado. No requiere clave para este uso educativo y no comercial. Incluye atribución al proveedor, tiempo límite, estado de carga y botón de reintento. Nunca muestra datos inventados cuando falla la red.

Documentación: https://open-meteo.com/en/docs

## Consumo SOAP real con zeep

El frontend llama al endpoint REST protegido de Django. Django valida el número (entero de 0 a 999999), utiliza `zeep.Client` y ejecuta `NumberToWords` contra el servidor SOAP público de DataAccess. Devuelve JSON para facilitar su uso en React. **Django consume SOAP; este endpoint no publica un servidor SOAP propio.**

Se incluye el contrato oficial en `integrations/wsdl/NumberConversion.wsdl`, obtenido desde el WSDL del proveedor. La copia local evita descargar el contrato en cada petición; la operación SOAP sigue siendo remota y requiere Internet. El destino está fijado en el contrato, no lo elige el usuario. La sesión HTTP se cierra al terminar y tiene un límite de 15 segundos para la operación. Si hay un fallo del proveedor, Django devuelve 502 con un mensaje controlado.

WSDL original: https://www.dataaccess.com/webservicesserver/NumberConversion.wso?WSDL

Respuesta de ejemplo para 125 (el servicio devuelve palabras en inglés):

```json
{
  "number": 125,
  "words": "one hundred and twenty five",
  "provider": "DataAccess NumberConversion",
  "protocol": "SOAP",
  "operation": "NumberToWords"
}
```

Para verlo, entra al Dashboard y pulsa **Convertir**. Abre **Ver respuesta del servicio** para mostrar el JSON. También puedes ejecutar el endpoint en Swagger con `Authorize` y `Bearer TU_ACCESS`.

## Pruebas y build

Desde la raíz:

```powershell
python manage.py test
python manage.py check
python manage.py makemigrations --check --dry-run
```

Desde `frontend/`:

```powershell
npm run build
```

Las pruebas Django incluyen registro, rechazo de privilegios, contraseñas, permisos, CORS y contrato del endpoint SOAP. Las pruebas unitarias de SOAP simulan al proveedor para ser reproducibles y no depender de Internet. Las evidencias de red deben obtenerse además mediante la llamada real al proveedor.

Prueba de navegador reproducible (con Django encendido en otra terminal):

```powershell
cd frontend
npx playwright install chromium
npm run test:e2e
```

Esta prueba crea una cuenta de prueba en tu base local y verifica registro, credenciales incorrectas, login, datos del usuario, recarga, renovación del token y logout. No consulta datos privados ni elimina tus usuarios. Las verificaciones de proveedores externos se realizan aparte para no hacer que esta prueba dependa de su disponibilidad.

## Capturas para la entrega

1. Abre `/login`, presiona F12, entra a **Console** y activa **Preserve log**. Inicia sesión. La consola registra `[Auth] JWT obtenido` con `access: recibido`, estado 200 y un prefijo del token ocultando el resto. Captura React y la consola; no publiques tokens completos ni contraseñas reales.
2. Captura `/dashboard` mostrando `Hola, NOMBRE`, el usuario y el correo obtenidos mediante AuthContext y `/auth/me/`.
3. Captura el clima cargado en el Dashboard con la atribución de Open-Meteo.
4. Pulsa **Convertir** y abre **Ver respuesta del servicio**. Captura el resultado SOAP devuelto por Django. Si aparece un error del proveedor, reintenta cuando esté disponible; un error 502 no demuestra una conversión exitosa.
5. Agrega al PDF el enlace a la rama o commit de GitHub que contenga tanto frontend como backend. Incluye el registro como evidencia adicional.

## MySQL opcional

```powershell
python -m pip install -r requirements-mysql.txt
$env:DB_ENGINE = "mysql"
$env:DB_NAME = "tienda_online_ra2"
$env:DB_USER = "root"
$env:DB_PASSWORD = "TU_PASSWORD_LOCAL"
python manage.py migrate
python manage.py runserver
```

Usa la base de la Práctica 4 si ya tiene `users.User`. No conectes sin planificación una base anterior que todavía use `auth.User`. Las pruebas de esta continuación se ejecutan con SQLite.

## Problemas frecuentes

- **No conecta con Django:** enciende el backend en el puerto 8000 y comprueba `VITE_BASE_API_URL` en `frontend/.env`.
- **Puerto 5173 ocupado:** cierra el otro Vite. La configuración usa puerto fijo para coincidir con CORS.
- **CORS:** usa http://127.0.0.1:5173 o http://localhost:5173; no se autorizan otros orígenes.
- **Token inválido tras reiniciar:** usa la misma variable privada `DJANGO_SECRET_KEY` en cada arranque.
- **Conflicto con Semantic UI:** conserva React 18.3.1 del lockfile y ejecuta `npm ci`; no uses `--force`.
- **Clima o SOAP sin respuesta:** comprueba Internet. Son proveedores externos y pueden fallar temporalmente.

`.gitignore` excluye entornos virtuales, bases SQLite, `node_modules`, secretos y `frontend/dist`. Se incluyen lockfiles e instrucciones reproducibles. Para publicar el build de React en otro servidor, configura una redirección de rutas desconocidas a `index.html` y ajusta los orígenes autorizados en Django.
