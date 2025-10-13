# 🚀 GUÍA DE INICIO RÁPIDO

## ⚡ Instalación en 5 Pasos

### **1️⃣ Descomprimir el proyecto**
```bash
unzip carnival-voting-system.zip
cd carnival-voting-system
```

### **2️⃣ Instalar (OPCIÓN A - Automática)**
```bash
chmod +x install.sh
./install.sh
```

### **2️⃣ Instalar (OPCIÓN B - Manual)**
```bash
npm install
cp .env.example .env
nano .env  # Editar con tus API keys
npm run migrate
```

### **3️⃣ Configurar APIs en .env**

**📝 Edita el archivo `.env` y completa:**

```env
# ===== TIKTOK APIS =====
# Obtener en: https://rapidapi.com/yi005jun/api/tiktok-scraper7
TIKTOK_API_KEY_1=PEGAR_TU_API_KEY_AQUI
TIKTOK_API_HOST_1=tiktok-scraper7.p.rapidapi.com

# Backup API (opcional pero recomendado)
TIKTOK_API_KEY_2=PEGAR_TU_SEGUNDA_API_KEY_AQUI
TIKTOK_API_HOST_2=tiktok-video-no-watermark2.p.rapidapi.com

# ===== YOUTUBE API =====
# Obtener en: https://console.cloud.google.com/
YOUTUBE_API_KEY=PEGAR_TU_YOUTUBE_API_KEY_AQUI

# Puerto (cambiar si 3000 está ocupado)
PORT=3000
```

### **4️⃣ Iniciar servidor**
```bash
npm start
```

### **5️⃣ Abrir en navegador**
```
http://localhost:3000
```

---

## 🔑 Obtener API Keys

### **🎵 TikTok APIs (RapidAPI)**

1. **Ir a RapidAPI:**
   - https://rapidapi.com/auth/sign-up
   
2. **Buscar "TikTok Scraper":**
   - API recomendada 1: "TikTok Scraper7"
   - API recomendada 2: "TikTok Video No Watermark2"
   
3. **Suscribirse al plan gratuito**
   - 100-500 requests gratis/mes
   
4. **Copiar tu API Key:**
   - Está en la sección "Code Snippets"
   - Se ve así: `a1b2c3d4e5...`

### **▶️ YouTube API (Google Cloud)**

1. **Ir a Google Cloud Console:**
   - https://console.cloud.google.com/
   
2. **Crear proyecto nuevo:**
   - Nombre: "Carnival Voting System"
   
3. **Habilitar YouTube Data API v3:**
   - Buscar "YouTube Data API v3"
   - Click en "Enable"
   
4. **Crear credenciales:**
   - Credentials > Create Credentials > API Key
   - Copiar tu API Key
   
5. **Cuota:**
   - 10,000 unidades gratis/día
   - Cada scrape consume ~5 unidades

---

## 📝 Primeros Pasos

### **Agregar tu primer video:**

1. Ve a la pestaña **"➕ Agregar Video"**
2. Pega una URL de TikTok o YouTube:
   ```
   https://www.tiktok.com/@username/video/123456789
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
3. Click en **"🚀 Agregar Video"**
4. ¡Listo! El sistema extraerá automáticamente título, autor y thumbnail

### **Votar:**

1. Ve a la pestaña **"📹 Videos"**
2. Click en **"❤️ Votar"** en cualquier video
3. Solo puedes votar 1 vez por video (se guarda tu IP)

### **Ver estadísticas:**

1. Ve a la pestaña **"📊 Estadísticas"**
2. Verás gráficos interactivos de:
   - Top 10 videos
   - Votos por día
   - Distribución por plataforma
   - Videos en tendencia

---

## 🐛 Problemas Comunes

### **❌ "No hay APIs de TikTok configuradas"**
**Solución:** Verifica que `.env` tenga `TIKTOK_API_KEY_1` o `TIKTOK_API_KEY_2`

### **❌ "API Key de YouTube inválida"**
**Solución:** 
- Verifica que copiaste la key correctamente
- Asegúrate de que YouTube Data API v3 esté habilitada en Google Cloud

### **❌ "Puerto 3000 en uso"**
**Solución:** Cambia el puerto en `.env`:
```env
PORT=8080
```

### **❌ Videos no cargan o error de base de datos**
**Solución:** Recrear la base de datos:
```bash
npm run migrate
```

### **❌ "npm: command not found"**
**Solución:** Instala Node.js desde https://nodejs.org/

---

## 💡 Tips Pro

### **Desarrollo con auto-reload:**
```bash
npm run dev
```

### **Limpiar y recrear todo:**
```bash
rm -rf node_modules database
npm install
npm run migrate
```

### **Ver logs en tiempo real:**
```bash
npm start | tee server.log
```

### **Testing rápido:**
```bash
# Agregar video de prueba
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Ver todos los videos
curl http://localhost:3000/api/videos

# Ver estadísticas
curl http://localhost:3000/api/stats
```

---

## 📱 URLs Importantes

| Función | URL |
|---------|-----|
| **App principal** | http://localhost:3000 |
| **API Health Check** | http://localhost:3000/api/health |
| **Videos** | http://localhost:3000/api/videos |
| **Estadísticas** | http://localhost:3000/api/stats |
| **Ranking** | http://localhost:3000/api/stats/ranking |

---

## 🎯 Checklist de Instalación

- [ ] Node.js instalado (v14+)
- [ ] Proyecto descomprimido
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado y configurado
- [ ] APIs de TikTok configuradas (mínimo 1)
- [ ] API de YouTube configurada
- [ ] Base de datos creada (`npm run migrate`)
- [ ] Servidor iniciado (`npm start`)
- [ ] Navegador abierto en http://localhost:3000
- [ ] Primer video agregado exitosamente

---

## 🆘 Ayuda Adicional

Si nada funciona:

1. **Verifica los requisitos:**
   ```bash
   node -v  # Debe ser >= 14
   npm -v   # Debe funcionar
   ```

2. **Reinstala desde cero:**
   ```bash
   rm -rf node_modules package-lock.json database
   npm install
   npm run migrate
   ```

3. **Revisa los logs:**
   - El servidor muestra errores detallados en la consola
   - Busca líneas que empiecen con `❌`

4. **Revisa el README completo:**
   - `README.md` tiene documentación exhaustiva

---

**¡Listo! Ahora tienes un sistema profesional de votación funcionando! 🎉**

Si todo funciona bien, deberías ver:
- ✅ Servidor corriendo en http://localhost:3000
- ✅ Interfaz visual con tema Carnaval
- ✅ Capacidad de agregar videos
- ✅ Sistema de votación funcional
- ✅ Gráficos y estadísticas

**¿Problemas?** Revisa la sección de Troubleshooting en el README.md
