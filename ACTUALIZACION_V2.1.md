# 🔄 GUÍA DE ACTUALIZACIÓN - APIs Editables desde Panel Admin

## 🎉 ¿QUÉ CAMBIÓ?

**ANTES:**
- ❌ APIs solo en archivo `.env`
- ❌ Requería editar archivos y reiniciar servidor
- ❌ Problemas en Railway/Render

**AHORA:**
- ✅ **APIs editables desde el panel admin**
- ✅ **Sin reiniciar el servidor**
- ✅ **Cambios inmediatos**
- ✅ **Funciona perfecto en Railway/Render**

---

## 📋 ACTUALIZACIÓN PARA PROYECTOS EXISTENTES

### **Si ya tienes el proyecto corriendo:**

#### **Opción 1: Actualizar Base de Datos (RECOMENDADO)**

```bash
# 1. Detener el servidor (Ctrl+C)

# 2. Ejecutar migración
npm run update-db

# 3. Reiniciar servidor
npm start

# 4. ¡Listo! Ahora ve al panel admin
```

#### **Opción 2: Recrear Base de Datos (si tienes problemas)**

⚠️ **ESTO BORRARÁ TODOS LOS VIDEOS Y VOTOS**

```bash
# 1. Backup (opcional)
cp database/carnival.db database/carnival.db.backup

# 2. Recrear base de datos
npm run migrate

# 3. Reiniciar servidor
npm start
```

---

## 🚀 ACTUALIZACIÓN EN RAILWAY/RENDER

### **Railway:**

1. **Hacer push del código actualizado:**
```bash
git add .
git commit -m "Update: APIs editables desde panel admin"
git push
```

2. **Railway detectará los cambios y redeployará automáticamente**

3. **Después del deploy:**
   - Ve a tu dominio/admin.html
   - Login como admin
   - Ve a "⚙️ Configuración"
   - Ingresa tus API Keys
   - Click "💾 Guardar Configuración"

4. **Opcional: Eliminar variables de entorno antiguas**
   - En Railway → Variables
   - Puedes eliminar: `TIKTOK_API_KEY_1`, `TIKTOK_API_KEY_2`, `YOUTUBE_API_KEY`
   - (O déjalas, el sistema usa la DB primero)

### **Render:**

Similar a Railway, solo haz push y espera el redeploy.

---

## 🎯 CÓMO USAR LAS NUEVAS FUNCIONALIDADES

### **1. Acceder a Configuración:**

```
http://tu-dominio.com/admin.html
└─ Login
└─ Click "⚙️ Configuración"
```

### **2. Agregar/Editar APIs:**

**TikTok API #1:**
- API Key: `tu_rapid_api_key_aqui`
- API Host: `tiktok-scraper7.p.rapidapi.com`

**TikTok API #2 (Backup):**
- API Key: `tu_segunda_api_key`
- API Host: `tiktok-video-no-watermark2.p.rapidapi.com`

**YouTube:**
- API Key: `tu_youtube_api_key`

### **3. Guardar:**

Click "💾 Guardar Configuración"

**Los cambios se aplican INMEDIATAMENTE** sin reiniciar 🎉

---

## 🔍 VERIFICAR QUE FUNCIONA

### **Test 1: Ver estado de APIs**

1. Panel Admin → Configuración
2. Deberías ver indicadores:
   - ✅ Configurada y activa (verde)
   - ❌ No configurada (rojo)

### **Test 2: Agregar un video**

1. Ve a la app principal
2. Click "➕ Agregar Video"
3. Pega URL de TikTok o YouTube
4. Si funciona = APIs configuradas correctamente ✅

---

## 🐛 TROUBLESHOOTING

### **"Error: No hay APIs de TikTok configuradas"**

**Solución:**
1. Ve al panel admin
2. Configuración
3. Verifica que al menos una API Key esté ingresada
4. Click "Guardar"

### **Las APIs no se guardan**

**Solución:**
```bash
# Verificar que la tabla config existe
npm run update-db

# Si da error, recrear:
npm run migrate
```

### **Los cambios no se aplican**

**Posible causa:** Caché del navegador

**Solución:**
1. Ctrl+Shift+R (forzar recarga)
2. O cerrar sesión y volver a entrar

### **Error en Railway después del deploy**

**Solución:**
1. Railway → Deployments → Logs
2. Busca errores de base de datos
3. Si dice "table config does not exist":
   ```bash
   # Local:
   npm run update-db
   git add .
   git commit -m "Fix: add config table"
   git push
   ```

---

## 💡 PREGUNTAS FRECUENTES

### **¿Puedo seguir usando el .env?**

Sí, el sistema lee primero de la base de datos, y si no encuentra nada, lee del `.env`. Pero es mejor usar el panel admin.

### **¿Los cambios requieren reiniciar?**

**NO.** Los cambios son inmediatos.

### **¿Puedo tener diferentes APIs en dev y producción?**

Sí. Configura las APIs desde el panel admin de cada ambiente.

### **¿Qué pasa si borro la base de datos?**

Las APIs se perderían. Por eso es buena idea mantener un backup del `.env` con las keys.

### **¿Puedo exportar/importar la configuración?**

Próximamente. Por ahora, copia manualmente las keys si cambias de servidor.

---

## 📊 COMPARATIVA

| Feature | Antes (V2.0) | Ahora (V2.1) |
|---------|--------------|--------------|
| **Editar APIs** | ❌ Solo .env | ✅ Panel admin |
| **Reiniciar** | ✅ Requerido | ❌ No requerido |
| **En Railway** | 🟡 Variables env | ✅ Panel web |
| **Testing** | 🟡 Difícil | ✅ Fácil |
| **Múltiples envs** | 🟡 Complejo | ✅ Simple |

---

## ✅ CHECKLIST DE ACTUALIZACIÓN

- [ ] Hacer backup del proyecto (opcional)
- [ ] Ejecutar `npm run update-db`
- [ ] Reiniciar servidor local
- [ ] Probar acceso al panel admin
- [ ] Ingresar APIs en Configuración
- [ ] Probar agregar un video
- [ ] Commit y push a GitHub
- [ ] Esperar redeploy en Railway/Render
- [ ] Configurar APIs en producción
- [ ] Probar en producción
- [ ] ¡Listo! 🎉

---

## 🎯 RESUMEN

**Actualización en 3 pasos:**

```bash
# 1. Actualizar DB
npm run update-db

# 2. Reiniciar
npm start

# 3. Configurar APIs en panel admin
http://localhost:3000/admin.html
```

**En producción:**

```bash
git push
# Esperar deploy
# Configurar APIs en panel admin online
```

---

## 📞 ¿NECESITAS AYUDA?

Si algo no funciona:

1. Revisa los logs del servidor
2. Verifica que la tabla `config` existe
3. Prueba recrear la base de datos con `npm run migrate`
4. Verifica las credenciales de admin

**¡Disfruta de la nueva funcionalidad! 🎉**
