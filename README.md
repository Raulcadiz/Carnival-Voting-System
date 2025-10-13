# 🎭 La Risa Eterna del Carnaval 🎭

Sistema profesional de votación para videos de TikTok y YouTube con diseño temático de Carnaval, gráficos interactivos y arquitectura robusta.

---

## ✨ Características Principales

### 🎨 **Diseño Visual**
- ✅ Tema Carnaval (dorado, morado, festivo)
- ✅ Interfaz moderna y responsive
- ✅ Animaciones suaves
- ✅ Gráficos interactivos con Chart.js
- ✅ Experiencia de usuario optimizada

### 🔐 **Panel de Administración**
- ✅ Login seguro con JWT
- ✅ Dashboard de estadísticas avanzadas
- ✅ Gestión completa de videos (editar/eliminar)
- ✅ Monitoreo de APIs
- ✅ Registro de actividad (logs)
- ✅ Configuración del sistema
- ✅ Eliminación masiva de videos

### 🔧 **Funcionalidades**
- ✅ Scraping automático de TikTok (con 2 APIs de respaldo)
- ✅ Scraping automático de YouTube Data API v3
- ✅ Sistema de votación (1 voto por IP por video)
- ✅ Rankings dinámicos con medallas
- ✅ Dashboard de estadísticas avanzadas
- ✅ Búsqueda y filtros en tiempo real
- ✅ Sistema de categorías
- ✅ Videos en tendencia (últimas 24h)
- ✅ Modo aleatorio

### 🏗️ **Arquitectura**
- ✅ Backend Node.js + Express
- ✅ SQLite con transacciones ACID
- ✅ Frontend Vanilla JS modular
- ✅ APIs RESTful documentadas
- ✅ Seguridad con Helmet + Rate Limiting
- ✅ Manejo robusto de errores

---

## 📋 Requisitos Previos

- **Node.js** >= 14.x
- **npm** >= 6.x
- **APIs requeridas:**
  - 2x TikTok API keys (RapidAPI)
  - 1x YouTube Data API v3 key (Google Cloud)

---

## 🚀 Instalación Rápida

### **1. Clonar o descargar el proyecto**

```bash
cd carnival-voting-system
```

### **2. Ejecutar instalación automática**

```bash
chmod +x install.sh
./install.sh
```

El script hará:
- ✅ Verificar requisitos
- ✅ Instalar dependencias
- ✅ Configuración interactiva
- ✅ Crear base de datos

### **3. Configurar APIs**

Si no ejecutaste el setup interactivo, copia `.env.example` a `.env` y completa:

```bash
cp .env.example .env
nano .env  # o usa tu editor favorito
```

**Variables críticas:**
```env
# TikTok APIs
TIKTOK_API_KEY_1=tu_api_key_aqui
TIKTOK_API_HOST_1=tiktok-scraper7.p.rapidapi.com

TIKTOK_API_KEY_2=tu_api_key_backup_aqui
TIKTOK_API_HOST_2=tiktok-video-no-watermark2.p.rapidapi.com

# YouTube API
YOUTUBE_API_KEY=tu_youtube_api_key_aqui
```

### **4. Iniciar servidor**

```bash
npm start
```

O en modo desarrollo con auto-reload:

```bash
npm run dev
```

### **5. Abrir en navegador**

```
http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
carnival-voting-system/
├── 📄 server.js                 # Servidor Express principal
├── 📄 package.json              # Dependencias
├── 📄 .env                      # Configuración (crear manualmente)
├── 📄 .env.example              # Plantilla de configuración
├── 📄 install.sh                # Script de instalación
├── 📄 README.md                 # Este archivo
│
├── 📁 config/
│   └── database.js              # Configuración SQLite
│
├── 📁 database/
│   └── carnival.db              # Base de datos (se crea automáticamente)
│
├── 📁 routes/
│   ├── videos.js                # API de videos
│   ├── votes.js                 # API de votaciones
│   └── stats.js                 # API de estadísticas
│
├── 📁 services/
│   ├── tiktokScraper.js         # Scraper de TikTok con fallback
│   └── youtubeScraper.js        # Scraper de YouTube
│
├── 📁 scripts/
│   ├── setup.js                 # Configuración interactiva
│   └── migrate.js               # Creación de base de datos
│
└── 📁 public/
    ├── index.html               # HTML principal
    ├── 📁 css/
    │   └── style.css            # Estilos tema Carnaval
    └── 📁 js/
        ├── api.js               # Módulo de API
        ├── components.js        # Sistema de componentes
        ├── charts.js            # Gráficos Chart.js
        └── app.js               # Aplicación principal
```

---

## 🔌 API Endpoints

### **Videos**
```http
GET    /api/videos                    # Listar todos los videos
GET    /api/videos/:id                # Obtener video por ID
POST   /api/videos                    # Agregar nuevo video
DELETE /api/videos/:id                # Eliminar video
GET    /api/videos/search/:query      # Buscar videos
```

### **Votaciones**
```http
POST   /api/votes                     # Votar por un video
GET    /api/votes/check/:videoId      # Verificar si ya votó
GET    /api/votes/video/:videoId      # Obtener votos del video
DELETE /api/votes/:videoId            # Eliminar voto (testing)
```

### **Estadísticas**
```http
GET    /api/stats                     # Estadísticas generales
GET    /api/stats/ranking             # Top 10 videos
GET    /api/stats/timeline/:videoId   # Timeline de votos
GET    /api/stats/comparison          # Comparar 2 videos
GET    /api/stats/trending            # Videos en tendencia
GET    /api/stats/random              # Video aleatorio
```

### **Administración** 🔐
```http
POST   /api/admin/login               # Login de administrador
GET    /api/admin/stats               # Estadísticas avanzadas (requiere auth)
PUT    /api/admin/videos/:id          # Editar video (requiere auth)
DELETE /api/admin/videos/:id          # Eliminar video (requiere auth)
POST   /api/admin/videos/bulk-delete  # Eliminar múltiples videos (requiere auth)
GET    /api/admin/config              # Obtener configuración (requiere auth)
GET    /api/admin/logs                # Obtener logs de actividad (requiere auth)
POST   /api/admin/clear-votes/:id     # Limpiar votos de un video (requiere auth)
```

### **Health Check**
```http
GET    /api/health                    # Estado del servidor
```

---

## 🎨 Características del Frontend

### **Sistema de Componentes Modular**
```javascript
// VideoCard - Tarjeta de video con votación
const card = new Components.VideoCard(video);
await card.init();

// RankingItem - Item del ranking
const item = new Components.RankingItem(video, rank);
item.render();

// Toast - Notificaciones
Utils.showToast('Mensaje', 'success');
```

### **Gráficos Disponibles**
- 📊 Top 10 Videos (Barras horizontales)
- 📈 Votos por Día (Línea temporal)
- 🎭 Distribución por Plataforma (Dona)
- 🔥 Trending últimas 24h (Barras)

### **Funcionalidades UI**
- ✅ Filtros por plataforma
- ✅ Ordenamiento múltiple
- ✅ Búsqueda en tiempo real
- ✅ Votación con feedback visual
- ✅ Responsive design

---

## 🔒 Seguridad

- ✅ **Helmet.js** - Headers de seguridad
- ✅ **Rate Limiting** - 100 requests/15min por IP
- ✅ **CORS** configurado
- ✅ **Input validation** en todas las rutas
- ✅ **SQL injection protection** (prepared statements)
- ✅ **XSS protection** (escape de HTML)

---

## 🗄️ Base de Datos

### **Tablas**

#### `videos`
```sql
- id (INTEGER PRIMARY KEY)
- platform (TEXT: tiktok/youtube)
- video_url (TEXT UNIQUE)
- video_id (TEXT)
- username (TEXT)
- title (TEXT)
- description (TEXT)
- thumbnail_url (TEXT)
- duration (INTEGER)
- view_count (INTEGER)
- created_at (TIMESTAMP)
```

#### `votes`
```sql
- id (INTEGER PRIMARY KEY)
- video_id (INTEGER FK)
- user_ip (TEXT)
- user_agent (TEXT)
- voted_at (TIMESTAMP)
- UNIQUE(video_id, user_ip)
```

#### `categories`
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT UNIQUE)
- description (TEXT)
- color (TEXT)
```

---

## 🛠️ Scripts NPM

```bash
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar con nodemon (auto-reload)
npm run setup      # Reconfigurar proyecto
npm run migrate    # Recrear base de datos
```

---

## 🔧 Configuración Avanzada

### **Variables de Entorno**

```env
# Servidor
PORT=3000
NODE_ENV=development

# TikTok APIs (necesitas 2 para redundancia)
TIKTOK_API_KEY_1=xxx
TIKTOK_API_HOST_1=tiktok-scraper7.p.rapidapi.com
TIKTOK_API_KEY_2=xxx
TIKTOK_API_HOST_2=tiktok-video-no-watermark2.p.rapidapi.com

# YouTube
YOUTUBE_API_KEY=xxx

# Seguridad
JWT_SECRET=xxx
RATE_LIMIT_WINDOW_MS=900000     # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100     # Máx requests

# Base de datos
DB_PATH=./database/carnival.db
```

### **Obtener API Keys**

#### **TikTok APIs (RapidAPI)**
1. Regístrate en [RapidAPI](https://rapidapi.com/)
2. Busca "TikTok Scraper" y suscríbete a:
   - TikTok Scraper7
   - TikTok Video No Watermark2
3. Copia tus API keys

#### **YouTube Data API v3**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita "YouTube Data API v3"
4. Crea credenciales (API Key)
5. Copia tu API key

---

## 🐛 Troubleshooting

### **Error: "No hay APIs de TikTok configuradas"**
- Verifica que `TIKTOK_API_KEY_1` o `TIKTOK_API_KEY_2` estén en `.env`

### **Error: "API Key de YouTube inválida"**
- Verifica que `YOUTUBE_API_KEY` esté correcta
- Asegúrate de que YouTube Data API v3 esté habilitada en Google Cloud

### **Error: "SQLITE_CONSTRAINT"**
- Es normal, significa que el usuario ya votó por ese video

### **Puerto 3000 en uso**
```bash
# Cambiar puerto en .env
PORT=8080
```

### **Recrear base de datos**
```bash
npm run migrate
```

---

## 📈 Mejoras Futuras

- [ ] Sistema de autenticación (JWT)
- [ ] Panel de administración
- [ ] Comentarios en videos
- [ ] Compartir en redes sociales
- [ ] Export de estadísticas (CSV/PDF)
- [ ] Notificaciones push
- [ ] Modo oscuro/claro
- [ ] Soporte para más plataformas (Instagram, etc)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto como quieras.

---

## 🎭 Créditos

Desarrollado con ❤️ y mucho café

- **Framework CSS**: Vanilla CSS con variables personalizadas
- **Gráficos**: Chart.js v4.4.0
- **Backend**: Node.js + Express
- **Base de datos**: SQLite3

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de Troubleshooting
2. Verifica que todas las APIs estén configuradas correctamente
3. Revisa los logs del servidor en la consola

---

**¡Disfruta del Carnival Voting System! 🎉🎭**
