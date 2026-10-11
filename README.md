# MediTolva

Registro de mediciones de desgaste en tolvas de camiones CAEX.
FastAPI + PostgreSQL (Supabase) · React 18 + Vite + Tailwind · PWA instalable.

```
meditolva/
├── backend/   main.py · models.py · schemas.py · database.py · seed.py · requirements.txt · .env
└── frontend/  index.html · package.json · vite.config.js · tailwind.config.js · src/…
```


## Diseño y acceso (actualización)

- **Sistema de diseño** generado con el skill *UI UX Pro Max*: estilo Minimalism & Swiss, base slate, acento esmeralda `#059669` (solo foco e indicadores activos, para no confundirlo con el estado "Operativo"), tipografía **Fira Sans** (texto) y **Fira Code** (cifras).
- **Login** (`src/pages/Login.jsx`): panel de marca con la escala de espesor real (8 mm / 12 mm) en pantallas grandes y formulario simple en móvil. Etiquetas visibles, `autocomplete` correcto, pegar contraseña permitido, mostrar/ocultar contraseña y estados de carga y error.
- **Dashboard** (`src/pages/Dashboard.jsx`): KPIs, tendencia con líneas de umbral en 8 y 12 mm, estado de la flota, mediciones por tipo, actividad reciente y esqueleto de carga. Responsive en 375, 768 y 1440 px.
- Accesibilidad: foco visible, `prefers-reduced-motion`, objetivos táctiles de 44 px o más, y tabla alternativa para el gráfico de tendencia.

> **El login es solo interfaz.** `src/auth.jsx` acepta cualquier correo y contraseña no vacíos y guarda una sesión local. No protege la API ni los datos. La autenticación real (Supabase Auth o JWT en FastAPI) es el siguiente paso y reemplaza la función `login()`.

## 1. Probar en tu computador

**Backend** (necesita un `DATABASE_URL` de Postgres; ver paso 2 para crear uno en Supabase):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# edita .env con tu DATABASE_URL
python seed.py                                          # 4 equipos + 6 mediciones de ejemplo
uvicorn main:app --reload                               # http://localhost:8000/docs
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev                                             # http://localhost:5173
```

Sin `VITE_API_URL` el frontend usa `http://localhost:8000`.

## 2. Desplegar en Supabase (base de datos)

1. Crea cuenta en supabase.com → **New project**. Elige región `South America (São Paulo)`, que es la más cercana a Chile. Guarda la contraseña de la base.
2. Ve a **Connect** (o *Project Settings → Database → Connection string*) y copia la cadena **Session pooler** (puerto 5432).
   - Usa el *pooler* y no la conexión directa: la directa es IPv6 y Render free solo tiene IPv4.
3. Reemplaza `[YOUR-PASSWORD]` por tu contraseña. Esa es tu `DATABASE_URL`.
4. Las tablas se crean solas al arrancar el backend. Para cargar los datos de ejemplo, ejecuta una vez `python seed.py` en tu computador con ese `DATABASE_URL` en `backend/.env`.

## 3. Desplegar en Render (backend)

1. Sube la carpeta `meditolva/` a un repositorio de GitHub. **No subas `backend/.env`** (agrégalo a `.gitignore`).
2. En render.com → **New → Web Service** → conecta el repositorio.
3. Configura:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free (para probar)
4. En **Environment** agrega:
   - `DATABASE_URL` = cadena del Session pooler de Supabase
   - `PYTHON_VERSION` = `3.11.9`
5. **Create Web Service**. Al terminar tendrás una URL como `https://meditolva-api.onrender.com`. Prueba `…/docs`.

> Importante: el plan Free de Render duerme el servicio tras 15 min sin tráfico y la primera petición tarda ~30–60 s en despertar. Para inspectores en terreno conviene el plan Starter.

## 4. Desplegar en Vercel (frontend)

1. En vercel.com → **Add New → Project** → importa el mismo repositorio.
2. Configura:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (se detecta solo)
   - **Environment Variables:** `VITE_API_URL` = URL de Render, sin `/` final
3. **Deploy**. El archivo `vercel.json` ya redirige las rutas (`/equipos`, `/nueva`, …) a la SPA.
4. Opcional, recomendado: en `backend/main.py` cambia `allow_origins=["*"]` por tu URL de Vercel.

## 5. Instalar como PWA

- **Android (Chrome):** abre la URL de Vercel → menú ⋮ → **Instalar aplicación** (o *Agregar a pantalla principal*).
- **iPhone / iPad (Safari):** abre la URL → botón Compartir → **Agregar a pantalla de inicio**.
- **PC (Chrome/Edge):** ícono de instalar en la barra de direcciones.

La app se abre a pantalla completa con su ícono. Por ahora **no funciona sin conexión** (el service worker es mínimo, solo habilita la instalación).

## 6. Costos: cuándo quedarse en gratis y cuándo pagar

Precios verificados en octubre de 2026 en páginas de precios y comparadores; confirma siempre en el sitio oficial antes de contratar. USD por mes.

| Servicio | Gratis | Primer plan de pago | Qué limita al plan gratis |
|---|---|---|---|
| **Supabase** (BD) | $0: 500 MB de BD, 5 GB de salida | **Pro $25** (8 GB de BD, 7 días de respaldos diarios, incluye $10 de crédito de cómputo) | Se **pausa tras 1 semana sin actividad** |
| **Render** (API) | $0: se duerme a los 15 min, ~1 min en despertar | **Starter $7** (512 MB, 0,5 CPU, siempre activo); Standard $25 (2 GB, 1 CPU) | Arranques en frío. La BD gratis de Render caduca a los 30 días (por eso usamos Supabase) |
| **Vercel** (frontend) | $0 en Hobby: 100 GB de transferencia | **Pro $20 por usuario** (incluye $20 de crédito de uso y 1 TB de transferencia) | Hobby es **solo no comercial** |
| **Railway** | Sin plan gratis real (≈$1 de crédito) | **Hobby $5** (incluye $5 de uso); Pro $20. Uso: ≈$20 por vCPU y ≈$10 por GB de RAM al mes | Un servicio siempre activo con 1 vCPU y 1 GB cuesta ≈$30 |
| **Fly.io** | Sin plan gratis para cuentas nuevas | Pago por uso: máquina de 256 MB ≈$2–2,5; 512 MB ≈$3,7; 1 GB ≈$6,7–7 | Postgres administrado desde **$38** + almacenamiento; el Postgres no administrado se arma a mano |
| **Hostinger VPS** | No | **KVM 1** (1 vCPU, 4 GB, 50 GB) $6,49 por 24 meses, luego $11,99; **KVM 2** (2 vCPU, 8 GB) $8,99, luego $14,99 | Requiere contrato largo; tú instalas y mantienes Nginx, Postgres, SSL y respaldos |

### Cómo decidir

| Etapa | Configuración | Costo aprox. |
|---|---|---|
| **Piloto / demo** (pocos usuarios, sin datos críticos) | Supabase Free + Render Free + Vercel Hobby | **$0** |
| **Operación real en faena** | Supabase Pro + Render Starter + Vercel Pro (1 usuario) | **≈ $52** ($25 + $7 + $20) |
| **Operación real, más económica** | Supabase Free + Render Starter + frontend en un hosting estático sin restricción comercial | **≈ $7** (riesgo: la BD se pausa si hay una semana sin uso) |
| **Todo en un servidor propio** | Hostinger KVM 2 (API + Postgres + frontend estático) | **≈ $9 → $15** + tu tiempo de administración |

**Pasa de gratis a pago cuando ocurra lo primero que aplique:**
1. Los inspectores usan la app en turno y no pueden esperar 1 minuto a que despierte la API → Render Starter ($7).
2. Hay datos que no puedes perder o puede haber una semana sin mediciones → Supabase Pro ($25), por los respaldos y por no pausarse.
3. La empresa usa la app de forma comercial → Vercel Hobby no lo permite; necesitas Pro ($20) o un hosting alternativo.
4. Te acercas a 500 MB de datos (con este modelo son cientos de miles de mediciones, así que es lo último que ocurre).
