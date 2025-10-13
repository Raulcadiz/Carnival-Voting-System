# 🚀 GUÍA DE DEPLOYMENT GRATUITO

## 📋 OPCIONES DE HOSTING GRATIS

| Servicio | Plan Gratis | Pros | Contras |
|----------|-------------|------|---------|
| **Railway** | $5 crédito/mes | ⭐ Fácil, Base de datos, Sin tarjeta | Límite mensual |
| **Render** | 750 horas/mes | Buena estabilidad | Requiere tarjeta |
| **Fly.io** | 3 VMs pequeñas | Flexible | Setup más complejo |
| **Vercel** | Ilimitado | Súper rápido | Solo frontend+serverless |

**RECOMENDACIÓN: Railway.app** (el más fácil y sin tarjeta)

---

## 🎯 OPCIÓN 1: RAILWAY (RECOMENDADO)

### **Por qué Railway:**
✅ Sin tarjeta de crédito
✅ $5 USD de crédito gratis/mes
✅ Base de datos SQLite persistente
✅ Deploy automático desde Git
✅ Variables de entorno fáciles
✅ SSL gratis

### **PASO A PASO:**

#### **1️⃣ Preparar el proyecto**

Crear archivo `railway.json` en la raíz del proyecto:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Crear archivo `.railwayignore`:

```
node_modules/
*.log
.env
database/*.db
.git/
```

#### **2️⃣ Subir a GitHub**

```bash
# Inicializar git
git init
git add .
git commit -m "Initial commit"

# Crear repo en GitHub (https://github.com/new)
# Luego:
git remote add origin https://github.com/TU_USUARIO/carnival-voting.git
git branch -M main
git push -u origin main
```

#### **3️⃣ Deploy en Railway**

1. **Ir a Railway.app:**
   - https://railway.app/
   - Click en "Start a New Project"
   - Login con GitHub

2. **Conectar Repositorio:**
   - "Deploy from GitHub repo"
   - Selecciona tu repositorio
   - Click "Deploy Now"

3. **Configurar Variables de Entorno:**
   - Click en tu proyecto
   - Tab "Variables"
   - Agregar una por una:

```env
NODE_ENV=production
PORT=3000

# TikTok APIs
TIKTOK_API_KEY_1=tu_api_key_1
TIKTOK_API_HOST_1=tiktok-scraper7.p.rapidapi.com
TIKTOK_API_KEY_2=tu_api_key_2
TIKTOK_API_HOST_2=tiktok-video-no-watermark2.p.rapidapi.com

# YouTube
YOUTUBE_API_KEY=tu_youtube_api_key

# Admin (CAMBIAR ESTOS!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=TU_PASSWORD_SEGURO_AQUI

# Seguridad
JWT_SECRET=GENERA_UNO_RANDOM_AQUI

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database
DB_PATH=./database/carnival.db
```

4. **Generar Dominio:**
   - Tab "Settings"
   - Section "Networking"
   - Click "Generate Domain"
   - Te dará algo como: `carnival-voting-production.up.railway.app`

5. **¡Listo!**
   - Tu app estará en: `https://tu-dominio.up.railway.app`
   - Panel admin: `https://tu-dominio.up.railway.app/admin.html`

#### **4️⃣ Actualizar el proyecto**

```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de cambios"
git push

# Railway detecta el push y redeploys automáticamente ✅
```

---

## 🎯 OPCIÓN 2: RENDER

### **PASO A PASO:**

#### **1️⃣ Preparar proyecto**

Crear archivo `render.yaml`:

```yaml
services:
  - type: web
    name: carnival-voting
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

#### **2️⃣ Deploy**

1. Ir a https://render.com/
2. "New +" → "Web Service"
3. Conectar GitHub repo
4. Configurar:
   - **Name:** carnival-voting
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Agregar variables de entorno
6. Click "Create Web Service"

---

## 🎯 OPCIÓN 3: FLY.IO

### **PASO A PASO:**

#### **1️⃣ Instalar CLI**

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

#### **2️⃣ Login**

```bash
fly auth login
```

#### **3️⃣ Crear app**

```bash
fly launch

# Te preguntará:
# - App name: carnival-voting
# - Region: Selecciona la más cercana
# - Database: No (usamos SQLite)
```

#### **4️⃣ Configurar variables**

```bash
fly secrets set TIKTOK_API_KEY_1="tu_key"
fly secrets set TIKTOK_API_KEY_2="tu_key"
fly secrets set YOUTUBE_API_KEY="tu_key"
fly secrets set ADMIN_USERNAME="admin"
fly secrets set ADMIN_PASSWORD="tu_password"
fly secrets set JWT_SECRET="tu_secret"
```

#### **5️⃣ Deploy**

```bash
fly deploy
```

---

## 🔒 IMPORTANTE: SEGURIDAD EN PRODUCCIÓN

### **1. Cambiar credenciales de admin:**

```env
ADMIN_USERNAME=tu_usuario_secreto
ADMIN_PASSWORD=password_muy_seguro_123!
```

### **2. Generar JWT_SECRET seguro:**

```bash
# En tu terminal local:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Copia el resultado y úsalo como JWT_SECRET
```

### **3. Configurar CORS en producción:**

Editar `server.js`:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-dominio.railway.app'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📊 MONITOREO

### **Ver logs en Railway:**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Ver logs en tiempo real
railway logs
```

### **Ver logs en Render:**

- Dashboard → Tu servicio → "Logs" tab

### **Ver logs en Fly.io:**

```bash
fly logs
```

---

## 🐛 TROUBLESHOOTING

### **Error: "Module not found"**

```bash
# Asegúrate de que package.json esté correcto
# Re-deploy
```

### **Error: "Database is locked"**

```bash
# SQLite no es ideal para alta concurrencia
# Considera migrar a PostgreSQL en producción si tienes +100 usuarios simultáneos
```

### **Error: "API rate limit exceeded"**

```bash
# Las APIs gratuitas tienen límites
# TikTok: 100-500 requests/mes
# YouTube: 10,000 unidades/día
```

### **Base de datos se borra en cada deploy:**

```bash
# Railway: La base de datos se mantiene en /app/database/
# Render: Usar disco persistente (requiere plan de pago)
# Fly.io: Usar volúmenes persistentes
```

#### **Solución para Railway:**

Railway mantiene `/app/database/` por defecto. Si se borra, puedes usar Railway Volume:

```bash
railway volume create database --size 1
```

---

## 💰 COSTOS ESTIMADOS (Plan Gratis)

### **Railway:**
- ✅ $5 crédito/mes GRATIS
- Suficiente para ~500-1000 usuarios/mes
- Si excedes, paga solo lo que usas (~$0.01/hora)

### **Render:**
- ✅ 750 horas/mes GRATIS (un solo servicio 24/7)
- Suficiente para proyecto pequeño/mediano

### **Fly.io:**
- ✅ 3 VMs pequeñas GRATIS
- 160GB tráfico/mes

---

## 🎉 CHECKLIST DE DEPLOYMENT

- [ ] Código subido a GitHub
- [ ] Variables de entorno configuradas
- [ ] Credenciales de admin cambiadas
- [ ] JWT_SECRET generado
- [ ] APIs de TikTok/YouTube configuradas
- [ ] Dominio generado
- [ ] App funcionando en producción
- [ ] Panel admin accesible
- [ ] Base de datos persistente
- [ ] Logs monitoreados

---

## 📱 DOMINIOS PERSONALIZADOS

### **Railway (requiere plan pro):**
```
Settings → Networking → Custom Domain → Agregar tu dominio
```

### **Alternativa GRATIS:**
Usa el dominio de Railway: `tu-app.up.railway.app`

---

## 🔥 TIPS PRO

### **1. Auto-deploy en cada push:**
✅ Ya configurado por defecto en Railway/Render

### **2. Rollback a versión anterior:**

**Railway:**
```
Deployments → Seleccionar deploy anterior → "Redeploy"
```

**Render:**
```
Deploys → Seleccionar anterior → "Rollback"
```

### **3. Variables de entorno por ambiente:**

```bash
# Desarrollo (.env)
NODE_ENV=development
ADMIN_PASSWORD=admin123

# Producción (Railway/Render)
NODE_ENV=production
ADMIN_PASSWORD=password_super_seguro
```

---

## 🆘 AYUDA

**Railway Docs:** https://docs.railway.app/
**Render Docs:** https://render.com/docs
**Fly.io Docs:** https://fly.io/docs/

**¿Problemas?**
1. Revisa los logs del servicio
2. Verifica variables de entorno
3. Asegúrate de que las APIs estén configuradas
4. Revisa que el puerto sea correcto (Railway usa PORT variable)

---

## ✨ RESULTADO FINAL

Tendrás tu aplicación online en:

```
🌐 App principal: https://tu-dominio.railway.app
🔐 Panel admin: https://tu-dominio.railway.app/admin.html
📊 API: https://tu-dominio.railway.app/api/health
```

**¡Listo para el mundo! 🎉**
