# Tienda Online API

Adaptación de la base de la Unidad 1 para la práctica de Django, DRF, Swagger y JWT (páginas 5 a 12). Conserva productos, categorías y cálculo de descuentos. Esta práctica no requiere frontend React.

## Inicio en Windows PowerShell

Requiere Python 3.12 o posterior compatible con Django 5.2. Se verificó con Python 3.12 y Django 5.2.19.

Desde esta carpeta, donde está manage.py:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Al crear el administrador se solicitan email, username y contraseña. El inicio de sesión de la API usa email y password, no username.

- Swagger: http://127.0.0.1:8000/swagger/
- Django admin: http://127.0.0.1:8000/admin/
- ReDoc: http://127.0.0.1:8000/redoc/

## Base de datos y MySQL

Por defecto se crea una base SQLite nueva. No copies la base ya migrada de la Unidad 1: ahora AUTH_USER_MODEL es users.User. Cambiar el usuario en una base existente requiere una migración planificada. No borres tu base original.

Para usar MySQL, conserva la base original y crea una base separada:

```sql
CREATE DATABASE tienda_online_ra2 CHARACTER SET utf8mb4;
```

Luego, en la misma terminal PowerShell:

```powershell
python -m pip install -r requirements-mysql.txt
$env:DB_ENGINE = "mysql"
$env:DB_NAME = "tienda_online_ra2"
$env:DB_USER = "root"
$env:DB_PASSWORD = "TU_PASSWORD_LOCAL"
$env:DJANGO_SECRET_KEY = "UNA_CLAVE_LARGA_ALEATORIA_Y_PRIVADA"
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

La configuración lee variables del sistema; no carga archivos .env automáticamente. .env.example es una referencia. La validación automatizada de esta entrega se realizó con SQLite; MySQL requiere tu servidor y credenciales.

Si no defines DJANGO_SECRET_KEY, se genera una clave temporal al iniciar. Para que los tokens sobrevivan a reinicios, configura una clave fija privada mediante esa variable.

## Cambios de la práctica

- Nombre del proyecto: tienda_online; tema: tienda en línea.
- Swagger: Tienda Online API, con autorización Bearer.
- users.User usa email único como identificador y conserva username.
- Campo telefono en modelo, admin, serializer y Swagger.
- CRUD de usuarios limitado a administradores con is_staff=True.
- GET /api/v1/auth/me/ devuelve los datos del usuario autenticado.
- POST /api/v1/auth/token/ obtiene access y refresh usando email y password.
- POST /api/v1/auth/token/refresh/ renueva access.
- ACCESS_TOKEN_LIFETIME: 30 minutos; refresh: 1 día.
- Se conservan /api/token/ y /api/token/refresh/ por compatibilidad.
- Se protege el CRUD de categorías mediante el permiso global IsAuthenticated.
- Se retiran las credenciales de MySQL del código.

## Correcciones de contraseña

users/serializers.py declara password con write_only=True. Nunca aparece en la representación de usuarios, incluso en auth/me, creación y actualización. create usa set_password para guardar un hash, no texto plano.

update extrae password con pop('password', None) y solo llama a set_password cuando existe una contraseña enviada y válida. Si se omite, mantiene el hash del usuario editado. Funciona tanto en PUT como PATCH; no copia request.user.password. Una contraseña vacía se rechaza.

## Verificación

```powershell
python manage.py test
python manage.py check
python manage.py makemigrations --check --dry-run
```

Se ejecutaron 18 pruebas: las 8 de productos/categorías de la base y 10 de usuarios. Cubren token de 1800 segundos, ausencia de password, permisos, creación con hash, cambio explícito, rechazo de contraseña vacía, eliminación, Swagger y conservación de contraseña con PUT y PATCH. En estas dos últimas se edita un usuario diferente del administrador, se compara el hash antes/después sin imprimirlo y se verifica que el login original siga funcionando.

## Capturas para el PDF de entrega

Estas son instrucciones para obtener evidencias reales en tu equipo; no se incluyen capturas fabricadas.

1. Abre Swagger y captura el título y las rutas de usuarios, auth/me, token y refresh.
2. En POST /api/v1/auth/token/ usa Try it out, escribe el email y contraseña de tu administrador y ejecuta. Captura la respuesta 200 con access y refresh. Usa cuentas de prueba.
3. Copia access. En Authorize escribe: Bearer ESPACIO ACCESS. Ejecuta GET /api/v1/auth/me/. Captura la respuesta 200 con telefono y sin password.
4. Con el token de administrador crea un segundo usuario mediante POST /api/v1/users/:

```json
{
  "username": "cliente_prueba",
  "email": "cliente_prueba@example.com",
  "password": "Cliente-Prueba-97!",
  "telefono": "6531234567",
  "is_active": true,
  "is_staff": false
}
```

5. Inicia sesión como ese cliente en auth/token y comprueba 200. Mantén la autorización de Swagger con el token del administrador para editarlo.
6. Ejecuta PATCH /api/v1/users/ID_DEL_CLIENTE/ enviando únicamente:

```json
{"telefono": "6537654321"}
```

7. Captura el cuerpo enviado sin password y la respuesta 200. Repite el login del cliente con su contraseña original: debe devolver 200. Captura ese resultado. El administrador y el cliente deben tener contraseñas diferentes para detectar el error original del manual.
8. Ejecuta python manage.py test users -v 2 y captura las pruebas PUT/PATCH sin contraseña en OK. Esta prueba también verifica que el hash no cambia, sin exponerlo.
9. Como evidencia adicional del campo nuevo, captura telefono en el formulario del usuario dentro de /admin/ y en el esquema User de Swagger.

Organiza el PDF con enlace real al repositorio y las capturas anteriores, acompañadas de explicaciones breves. El PDF y la publicación del repositorio quedan pendientes hasta tener el destino de GitHub y las capturas.

## Publicar en GitHub

Crea un repositorio vacío y sustituye la URL del siguiente bloque por su dirección real:

```powershell
git init
git add .
git commit -m "Adaptar tienda online con usuarios seguros Swagger y JWT"
git branch -M main
git remote add origin URL_REAL_DEL_REPOSITORIO
git push -u origin main
```

.gitignore excluye entornos virtuales, db.sqlite3, cachés y secretos. requirements.txt contiene las versiones usadas. No subas tokens activos ni contraseñas reales en capturas públicas.

## Documentación oficial

- https://www.django-rest-framework.org/api-guide/serializers/
- https://www.django-rest-framework.org/api-guide/fields/#write_only
- https://django-rest-framework-simplejwt.readthedocs.io/en/stable/settings.html
- https://drf-yasg.readthedocs.io/en/stable/readme.html
