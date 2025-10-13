# 🎉 CARNIVAL VOTING V2.0 - NOVEDADES

## ✨ ¿QUÉ HAY DE NUEVO?

### 🔐 **1. PANEL DE ADMINISTRACIÓN COMPLETO**

#### **Acceso:**
```
URL: http://localhost:3000/admin.html
Usuario por defecto: admin
Contraseña por defecto: carnival2025
```

⚠️ **IMPORTANTE:** Cambia estas credenciales en `.env` antes de subir a producción:

```env
ADMIN_USERNAME=tu_usuario_secreto
ADMIN_PASSWORD=tu_password_super_seguro
```

#### **Funcionalidades del Panel:**

##### **📊 Dashboard de Resumen**
- Total de videos, votos y votantes únicos
- Gráfico de distribución por plataforma
- Gráfico de votos por hora del día
- Top 10 votantes más activos
- Estado de las APIs (activas/inactivas)

##### **🎬 Gestión de Videos**
- **Ver todos los videos** en tabla ordenada
- **Editar videos:** Cambiar título, username, descripción
- **Eliminar videos:** Individual o masivo
- **Selección múltiple** con checkboxes
- **Filtrado y búsqueda** rápida

##### **⚙️ Configuración**
- Ver estado de APIs (TikTok 1, TikTok 2, YouTube)
- Configuración de seguridad (rate limits)
- Información del servidor
- Herramientas de base de datos

##### **📝 Logs de Actividad**
- Últimos 30 eventos
- Videos agregados
- Votos registrados
- Timestamps detallados

---

### 🔒 **2. AUTENTICACIÓN SEGURA**

- **JWT (JSON Web Tokens)** para sesiones
- Token válido por 24 horas
- Protección de rutas administrativas
- Logout seguro

---

### 🌐 **3. LISTO PARA PRODUCCIÓN**

Incluye guías completas para deploy en:

#### **Railway.app** ⭐ RECOMENDADO
- ✅ Sin tarjeta de crédito
- ✅ $5 USD gratis/mes
- ✅ Deploy en 5 minutos
- ✅ Base de datos persistente
- ✅ SSL automático

#### **Render.com**
- ✅ 750 horas/mes gratis
- ✅ Buena estabilidad
- ⚠️ Requiere tarjeta

#### **Fly.io**
- ✅ 3 VMs gratis
- ✅ Muy flexible
- ⚠️ Setup más técnico

---

## 🚀 CÓMO USAR LAS NUEVAS FUNCIONES

### **Paso 1: Instalar**

```bash
unzip carnival-voting-system-v2.zip
cd carnival-voting-system
npm install
```

### **Paso 2: Configurar Admin**

Edita `.env`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=carnival2025  # ⚠️ CAMBIAR ESTO
JWT_SECRET=GENERAR_UNO_RANDOM  # ⚠️ CAMBIAR ESTO
```

Para generar un JWT_SECRET seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### **Paso 3: Iniciar**

```bash
npm run migrate  # Crear base de datos
npm start
```

### **Paso 4: Acceder al Panel**

1. Abre `http://localhost:3000`
2. Click en "🔐 Admin" (arriba derecha)
3. Login con tus credenciales
4. ¡Explora!

---

## 📊 EJEMPLOS DE USO

### **Editar un video:**

1. Panel Admin → "🎬 Videos"
2. Click en "✏️" del video
3. Modificar título/username/descripción
4. "💾 Guardar Cambios"

### **Eliminar videos en masa:**

1. Panel Admin → "🎬 Videos"
2. Marcar checkboxes de videos a eliminar
3. Click "🗑️ Eliminar Seleccionados"
4. Confirmar

### **Ver estadísticas avanzadas:**

1. Panel Admin → "📊 Resumen"
2. Ver gráficos interactivos
3. Analizar patrones de votación

### **Monitorear actividad:**

1. Panel Admin → "📝 Logs"
2. Ver últimos eventos
3. Click "🔄 Actualizar" para refrescar

---

## 🆕 NUEVOS ENDPOINTS API

```javascript
// Login de admin
POST /api/admin/login
{
  "username": "admin",
  "password": "carnival2025"
}

// Respuesta:
{
  "success": true,
  "token": "eyJhbGc...",
  "username": "admin"
}

// Usar el token en siguientes requests:
Headers: {
  "Authorization": "Bearer eyJhbGc..."
}

// Editar video
PUT /api/admin/videos/1
{
  "title": "Nuevo título",
  "username": "nuevo_usuario"
}

// Eliminar múltiples videos
POST /api/admin/videos/bulk-delete
{
  "videoIds": [1, 2, 3, 4]
}

// Ver logs
GET /api/admin/logs
```

---

## 🔐 SEGURIDAD

### **Cambios Obligatorios Antes de Producción:**

1. **Cambiar credenciales:**
```env
ADMIN_USERNAME=mi_usuario_secreto_123
ADMIN_PASSWORD=Password_Muy_Seguro_2025!
```

2. **Generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

3. **Configurar CORS:**
Edita `server.js` línea ~31:
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://tu-dominio.railway.app'] 
  : '*'
```

---

## 📱 DEPLOYMENT RÁPIDO

### **Opción 1: Railway (5 minutos)**

```bash
# 1. Subir a GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/carnival-voting.git
git push -u origin main

# 2. Ir a railway.app
# 3. "Deploy from GitHub repo"
# 4. Configurar variables de entorno
# 5. ¡Listo!
```

📖 **Guía detallada:** Ver `DEPLOYMENT.md`

---

## 🐛 TROUBLESHOOTING

### **"Token inválido" en panel admin:**
- El token expira en 24h
- Hacer logout y login nuevamente

### **"No autorizado":**
- Verificar que el token esté en localStorage
- Verificar que JWT_SECRET sea el mismo en servidor

### **Videos no se editan:**
- Verificar que estás autenticado
- Ver logs del servidor (consola)

### **Panel admin no carga:**
- Verificar que el servidor esté corriendo
- Abrir consola del navegador (F12) para ver errores

---

## 📈 MEJORAS FUTURAS SUGERIDAS

Estos features NO están incluidos pero serían excelentes adiciones:

- [ ] Autenticación con múltiples admins
- [ ] Roles (admin, moderador, viewer)
- [ ] Export de datos a CSV/Excel
- [ ] Backup automático de base de datos
- [ ] Notificaciones push
- [ ] Análisis de sentimiento en comentarios
- [ ] Integración con más plataformas (Instagram, etc)
- [ ] API pública con API keys

---

## 🎓 LO QUE PUEDES APRENDER

Si estudias el código nuevo, aprenderás:

### **Backend:**
- ✅ Autenticación JWT
- ✅ Middleware de autorización
- ✅ Rutas protegidas
- ✅ Manejo de tokens

### **Frontend:**
- ✅ SPA con routing manual
- ✅ localStorage para persistencia
- ✅ Fetch con headers de auth
- ✅ Manejo de sesiones
- ✅ Interfaces admin complejas

---

## 📞 RESUMEN

**V1.0 vs V2.0:**

| Feature | V1.0 | V2.0 |
|---------|------|------|
| **Votación pública** | ✅ | ✅ |
| **Agregar videos** | ✅ | ✅ |
| **Estadísticas** | ✅ | ✅ Mejoradas |
| **Panel Admin** | ❌ | ✅ **NUEVO** |
| **Editar videos** | ❌ | ✅ **NUEVO** |
| **Eliminar videos** | ❌ | ✅ **NUEVO** |
| **Autenticación** | ❌ | ✅ **NUEVO** |
| **Logs** | ❌ | ✅ **NUEVO** |
| **Gestión APIs** | ❌ | ✅ **NUEVO** |
| **Deploy guides** | ❌ | ✅ **NUEVO** |

---

## ✅ CHECKLIST DE SETUP

- [ ] Descomprimí el proyecto
- [ ] Ejecuté `npm install`
- [ ] Cambié las credenciales de admin en `.env`
- [ ] Generé un JWT_SECRET seguro
- [ ] Configuré las APIs de TikTok/YouTube
- [ ] Ejecuté `npm run migrate`
- [ ] Inicié el servidor con `npm start`
- [ ] Accedí a http://localhost:3000
- [ ] Probé el panel admin en /admin.html
- [ ] Edité un video de prueba
- [ ] Revisé las estadísticas
- [ ] Leí la guía de deployment
- [ ] Listo para subir a Railway 🚀

---

**¿Preguntas?** Revisa:
- `README.md` - Documentación completa
- `DEPLOYMENT.md` - Guía de deploy
- `QUICK_START.md` - Inicio rápido

**¡Disfruta de la V2.0! 🎉🎭**
