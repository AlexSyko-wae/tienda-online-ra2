# Actualizar tu proyecto de la práctica anterior

Esta carpeta contiene el código completo. Puedes copiar su contenido a tu carpeta anterior `tienda_online_ra2`, conservando `venv/`, `db.sqlite3` y `.git/`. El ZIP no contiene esos archivos. No borres tu base de datos.

Con el backend detenido, en PowerShell desde la raíz:

```powershell
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
$env:DJANGO_SECRET_KEY = "TU_CLAVE_PRIVADA_FIJA"
python manage.py runserver
```

En otra terminal:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Abre http://127.0.0.1:5173. Puedes entrar con el email/contraseña de la práctica anterior o crear otra cuenta desde Registro. Para capturar el token, F12 → Console → Preserve log y luego inicia sesión. El mensaje `[Auth] JWT obtenido` incluye el estado 200 y oculta el token completo.

Cuando hayas probado todo, desde la raíz de tu proyecto que ya está vinculado a GitHub:

```powershell
git add .
git status
git commit -m "Agregar frontend React autenticacion clima y SOAP"
git push origin main
```

Comprueba que `venv`, `db.sqlite3`, `.env`, `node_modules` y `dist` no aparecen en lo que se va a subir. Mantén `.gitignore`, los archivos de dependencias (`requirements.txt` y `frontend/package-lock.json`) y el README.
