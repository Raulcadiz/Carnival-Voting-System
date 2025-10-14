# 🚀 QUICK START GUIDE

## En 5 minutos tendrás TODO funcionando

### ⚡ PASO 1: Instalación (2 minutos)

```bash
# Clonar el proyecto
git clone https://github.com/Raulcadiz/Carnival-Voting-System.git
cd Carnival-Voting-System

# Instalar dependencias
npm install

# Ejecutar migración de base de datos
node scripts/migrate-enhanced.js

# Dar permisos al instalador
chmod +x install-enhanced.sh

# Ejecutar instalador
./install-enhanced.sh
```

### 🔑 PASO 2: Obtener API Key de Groq (1 minuto)

1. Ve a https://console.groq.com
2. Crea cuenta (email + contraseña)
3. Clic en "Create API Key"
4. Copia la key

### ⚙️ PASO 3: Configurar (1 minuto)

```bash
# Editar .env
nano .env

# Pegar tu key de Groq
GROQ_API_KEY=gsk_tu_key_aqui

# Guardar: Ctrl+O, Enter, Ctrl+X
```

### 🔧 PASO 4: Actualizar server.js (30 segundos)

Abre `server.js` y agrega después de tus rutas existentes:

```javascript
// 🆕 Nuevas rutas
const aiRoutes = require('./routes/ai');
const adminApiKeysRoutes = require('./routes/adminApiKeys');

app.use('/api/ai', aiRoutes);
app.use('/api/admin/api-keys', adminApiKeysRoutes);
```

### 🚀 PASO 5: Iniciar (30 segundos)

```bash
npm start
```

### ✅ PASO 6: Probar

Abre tu navegador:

1. **Trivial**: http://localhost:3000/trivia.html
2. **Chat**: http://localhost:3000/chat.html
3. **Admin**: http://localhost:3000/admin/api-keys.html

---

## 🎯 Verificación Rápida

### ¿Todo funciona bien?

- [ ] El servidor inició sin errores
- [ ] Puedes acceder a /trivia.html
- [ ] Puedes generar preguntas de trivial
- [ ] Puedes chatear con Carnivalito
- [ ] El panel de admin muestra las APIs

### ❌ ¿Algo no funciona?

```bash
# Verificar logs
npm start

# Si dice "Servicio de IA no configurado":
# → Verifica que GROQ_API_KEY esté en .env

# Si dice "Cannot find module":
# → Ejecuta: npm install axios

# Si la base de datos da error:
# → Ejecuta: node scripts/migrate-enhanced.js
```

---

## 🎮 Primera Interacción

### Trivial

1. Ve a http://localhost:3000/trivia.html
2. Selecciona "Historia del Carnaval 🎭"
3. Elige "Fácil"
4. Clic en "¡Comenzar Trivial!"
5. ¡Responde y diviértete!

### Chat

1. Ve a http://localhost:3000/chat.html
2. Escribe: "¿Cómo puedo votar?"
3. Carnivalito te responderá con emojis
4. Prueba: "Cuéntame sobre el Carnaval"

### Admin

1. Inicia sesión en /admin
2. Ve a "API Keys"
3. Verás todas tus APIs configuradas
4. Prueba alguna con el botón "🧪 Probar"

---

## 💡 Tips Profesionales

### Para Desarrollo

```bash
# Usar nodemon para auto-reload
npm install -g nodemon
nodemon server.js

# Ver logs en tiempo real
tail -f logs/app.log
```

### Para Producción

```bash
# Variables de entorno
NODE_ENV=production
GROQ_API_KEY=tu_key_prod
JWT_SECRET=secreto_muy_seguro

# Usar PM2
npm install -g pm2
pm2 start server.js --name "carnival"
pm2 logs carnival
```

### Optimizaciones

1. **Caché de preguntas**: Guarda preguntas generadas
2. **Rate limiting**: Limita requests por usuario
3. **Compresión**: Usa gzip para responses
4. **CDN**: Sirve archivos estáticos desde CDN

---

## 🔥 Comandos Útiles

```bash
# Reiniciar servidor
npm restart

# Ver estadísticas
curl http://localhost:3000/api/health

# Probar endpoint de trivial
curl -X POST http://localhost:3000/api/ai/trivia/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Carnaval", "difficulty": "easy"}'

# Probar chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola"}'
```

---

## 🎓 Próximos Pasos

### Nivel 1: Básico
- [ ] Cambia los colores del tema
- [ ] Agrega tu logo
- [ ] Personaliza a Carnivalito

### Nivel 2: Intermedio
- [ ] Crea una nueva categoría de trivial
- [ ] Agrega un leaderboard
- [ ] Implementa sistema de logros

### Nivel 3: Avanzado
- [ ] Trivial multijugador en tiempo real
- [ ] Carnivalito con voz (Text-to-Speech)
- [ ] Integración con más redes sociales

---

## 📞 Ayuda

### Documentación Completa
- `README_ENHANCED.md` - Documentación detallada
- `INTEGRATION_GUIDE.md` - Guía de integración
- `server.example.js` - Ejemplo de server.js

### Recursos
- [Documentación Groq](https://console.groq.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [SQLite Docs](https://www.sqlite.org/docs.html)

### Soporte
- 🐛 Issues: GitHub Issues
- 💬 Chat: Discord (próximamente)
- 📧 Email: soporte@carnival.com

---

## ⭐ Checklist Final

Antes de desplegar a producción:

- [ ] Todas las API keys configuradas
- [ ] JWT_SECRET cambiado
- [ ] Rate limiting configurado
- [ ] HTTPS habilitado
- [ ] Backup de base de datos configurado
- [ ] Logs centralizados
- [ ] Monitoreo activo
- [ ] Variables de entorno seguras

---

**¡Listo! Ya tienes el sistema más épico de votación con IA integrada 🎉**

¿Problemas? ¡Lee la documentación completa!
¿Todo funciona? ¡Dale una ⭐ al repo!

---

Made with ❤️, ☕, and 🎭
