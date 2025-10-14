# 🪟 GUÍA DE INSTALACIÓN EN WINDOWS VPS

## 📋 REQUISITOS

- Windows Server 2016+ (o Windows 10/11)
- Acceso como Administrador
- Puerto 3000 (o el que elijas) abierto en firewall

---

## 🚀 INSTALACIÓN COMPLETA

### **1️⃣ INSTALAR NODE.JS**

**Descargar:**
```
https://nodejs.org/en/download
```

- Descarga la versión LTS (recomendado: v18 o v20)
- Ejecuta el instalador `.msi`
- **Durante instalación:** Marca "Automatically install necessary tools"
- Click "Next" hasta finalizar

**Verificar instalación:**

Abre PowerShell como Administrador y ejecuta:

```powershell
node --version
npm --version
```

Deberías ver algo como:
```
v20.11.0
10.2.4
```

---

### **2️⃣ INSTALAR GIT (Opcional, pero recomendado)**

**Descargar:**
```
https://git-scm.com/download/win
```

- Instalar con opciones por defecto
- Esto te permite clonar desde GitHub

---

### **3️⃣ SUBIR EL PROYECTO AL VPS**

#### **Opción A: Con Git (Recomendado)**

```powershell
# Navegar a donde quieres el proyecto
cd C:\

# Clonar repositorio
git clone https://github.com/TU_USUARIO/carnival-voting.git

# Entrar al proyecto
cd carnival-voting
```

#### **Opción B: Sin Git (Manual)**

1. **Conectar al VPS con Remote Desktop**
2. **Copiar la carpeta del proyecto desde tu PC local:**
   - Comprime la carpeta en `.zip`
   - Copia el zip vía Remote Desktop
   - Descomprime en `C:\carnival-voting`

---

### **4️⃣ INSTALAR DEPENDENCIAS**

```powershell
# Entrar al directorio del proyecto
cd C:\carnival-voting

# Instalar dependencias
npm install
```

Esto toma 1-2 minutos.

---

### **5️⃣ CONFIGURAR VARIABLES DE ENTORNO**

#### **Crear archivo `.env`:**

```powershell
# Copiar ejemplo
copy .env.example .env

# Editar con notepad
notepad .env
```

**Configuración mínima:**

```env
# Puerto
PORT=3000

# Base de datos (no cambiar)
DB_PATH=./database/carnival.db

# Admin (CAMBIAR ESTOS)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=TuPasswordSeguro123!
JWT_SECRET=GenerarUnoRandom123456

# Node Environment
NODE_ENV=production
```

**Generar JWT_SECRET seguro:**

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia el resultado y pégalo como `JWT_SECRET`.

---

### **6️⃣ CREAR BASE DE DATOS**

```powershell
npm run migrate
```

Deberías ver:
```
✅ Base de datos creada exitosamente
✅ Tablas creadas
✅ Categorías insertadas
```

---

### **7️⃣ ABRIR PUERTO EN FIREWALL**

**Opción A: PowerShell (Recomendado)**

```powershell
# Abrir puerto 3000
New-NetFirewallRule -DisplayName "Carnival Voting" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Opción B: Interfaz Gráfica**

1. `Windows Defender Firewall` → `Advanced Settings`
2. `Inbound Rules` → `New Rule...`
3. `Port` → TCP → `3000`
4. `Allow the connection`
5. Name: `Carnival Voting`

---

### **8️⃣ INICIAR LA APLICACIÓN**

#### **Modo Development (Testing):**

```powershell
npm start
```

Deberías ver:
```
🎭 Servidor corriendo en http://localhost:3000
✅ Base de datos conectada
```

**Probar:**
- En el navegador del VPS: `http://localhost:3000`
- Desde otro PC: `http://IP_DEL_VPS:3000`

**Detener:** `Ctrl + C`

---

## 🔄 MANTENER LA APP CORRIENDO (PRODUCCIÓN)

Windows no tiene `pm2` por defecto, pero hay varias opciones:

### **OPCIÓN 1: PM2 (Recomendado)**

```powershell
# Instalar PM2 globalmente
npm install -g pm2
npm install -g pm2-windows-startup

# Configurar PM2 para iniciar con Windows
pm2-startup install

# Iniciar app con PM2
cd C:\carnival-voting
pm2 start server.js --name carnival-voting

# Guardar configuración
pm2 save

# Ver logs
pm2 logs carnival-voting

# Reiniciar app
pm2 restart carnival-voting

# Detener app
pm2 stop carnival-voting
```

**PM2 iniciará automáticamente la app cuando Windows se reinicie.**

---

### **OPCIÓN 2: Servicio de Windows con nssm**

**Descargar nssm:**
```
https://nssm.cc/download
```

**Instalar:**

```powershell
# Descomprimir nssm
# Copiar nssm.exe a C:\Windows\System32

# Instalar servicio
nssm install CarnivalVoting

# En la ventana que aparece:
# Path: C:\Program Files\nodejs\node.exe
# Startup directory: C:\carnival-voting
# Arguments: server.js

# Instalar
nssm install CarnivalVoting

# Iniciar servicio
nssm start CarnivalVoting

# Verificar estado
nssm status CarnivalVoting

# Logs (se guardan en C:\carnival-voting\)
nssm set CarnivalVoting AppStdout C:\carnival-voting\logs\output.log
nssm set CarnivalVoting AppStderr C:\carnival-voting\logs\error.log
```

**El servicio se inicia automáticamente con Windows.**

---

### **OPCIÓN 3: Tarea Programada (Task Scheduler)**

1. Abre `Task Scheduler`
2. `Create Basic Task`
3. Name: `Carnival Voting`
4. Trigger: `When the computer starts`
5. Action: `Start a program`
6. Program: `C:\Program Files\nodejs\node.exe`
7. Arguments: `server.js`
8. Start in: `C:\carnival-voting`
9. Finish

---

## 🌐 CONFIGURAR DOMINIO (Opcional)

### **Con IIS como Reverse Proxy:**

**1. Instalar IIS:**

```powershell
Install-WindowsFeature -name Web-Server -IncludeManagementTools
```

**2. Instalar URL Rewrite y ARR:**

Descarga e instala:
- URL Rewrite: https://www.iis.net/downloads/microsoft/url-rewrite
- Application Request Routing (ARR): https://www.iis.net/downloads/microsoft/application-request-routing

**3. Configurar reverse proxy:**

En IIS Manager:
- Add Website
- Binding: `carnivalvotingsystem.es` (port 80)
- En URL Rewrite, agregar regla:

```xml
<rule name="ReverseProxyInboundRule" stopProcessing="true">
  <match url="(.*)" />
  <action type="Rewrite" url="http://localhost:3000/{R:1}" />
</rule>
```

**4. SSL con Certbot (HTTPS):**

```powershell
# Instalar Certbot para Windows
# Descargar de: https://certbot.eff.org/

# Generar certificado
certbot --standalone -d carnivalvotingsystem.es
```

---

## 🔧 MANTENIMIENTO

### **Ver logs:**

```powershell
# Con PM2
pm2 logs carnival-voting

# Archivos de log (si configuraste nssm)
type C:\carnival-voting\logs\output.log
type C:\carnival-voting\logs\error.log

# Event Viewer de Windows
eventvwr
```

### **Actualizar aplicación:**

```powershell
# Detener app
pm2 stop carnival-voting

# Actualizar código (si usas Git)
cd C:\carnival-voting
git pull

# Instalar nuevas dependencias (si las hay)
npm install

# Actualizar base de datos (si hay cambios)
npm run update-db

# Reiniciar
pm2 restart carnival-voting
```

### **Backup de base de datos:**

```powershell
# Crear carpeta de backups
mkdir C:\carnival-voting\backups

# Copiar base de datos
copy C:\carnival-voting\database\carnival.db C:\carnival-voting\backups\carnival_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.db
```

**Automatizar backup diario:**

Task Scheduler:
- Trigger: Daily at 2:00 AM
- Action: 
  ```powershell
  powershell.exe -Command "Copy-Item 'C:\carnival-voting\database\carnival.db' -Destination 'C:\carnival-voting\backups\carnival_$(Get-Date -Format yyyyMMdd).db'"
  ```

---

## 🐛 TROUBLESHOOTING

### **Error: "Puerto 3000 ya está en uso"**

```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F
```

### **Error: "Cannot find module"**

```powershell
# Reinstalar dependencias
rm -r node_modules
npm install
```

### **Error: "SQLITE_ERROR: no such table"**

```powershell
# Recrear base de datos
npm run migrate
```

### **No puedo acceder desde fuera del VPS**

1. Verifica firewall de Windows
2. Verifica firewall del proveedor del VPS (panel web)
3. Verifica que el puerto esté correcto en `.env`

### **PM2 no se inicia con Windows**

```powershell
# Reinstalar startup
pm2 unstartup
pm2-startup install
pm2 save
```

---

## 📊 MONITOREO

### **PM2 Monitoring:**

```powershell
# Ver estado
pm2 status

# Ver uso de recursos
pm2 monit

# Ver logs en tiempo real
pm2 logs carnival-voting --lines 100
```

### **Performance Monitor:**

```powershell
# Abrir Performance Monitor
perfmon

# Monitorear:
# - CPU Usage
# - Memory Usage
# - Network Traffic
```

---

## 🔒 SEGURIDAD

### **1. Actualizar Windows regularmente**

```powershell
# Instalar actualizaciones
Install-Module PSWindowsUpdate
Get-WindowsUpdate
Install-WindowsUpdate -AcceptAll
```

### **2. Firewall configurado correctamente**

Solo abre los puertos necesarios:
- 3389 (RDP)
- 3000 (App)
- 80 (HTTP, si usas IIS)
- 443 (HTTPS, si usas IIS)

### **3. Cambiar puerto RDP (opcional)**

```powershell
# Cambiar puerto RDP de 3389 a otro (ej: 33389)
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp\' -Name PortNumber -Value 33389

# Reiniciar
Restart-Service TermService -Force
```

---

## ✅ CHECKLIST FINAL

- [ ] Node.js instalado
- [ ] Proyecto subido al VPS
- [ ] Dependencias instaladas (`npm install`)
- [ ] `.env` configurado
- [ ] Base de datos creada (`npm run migrate`)
- [ ] Puerto abierto en firewall
- [ ] App funciona (`npm start`)
- [ ] PM2 configurado (producción)
- [ ] PM2 inicia con Windows
- [ ] Backup automático configurado
- [ ] Dominio configurado (opcional)
- [ ] SSL configurado (opcional)
- [ ] App accesible desde internet
- [ ] Panel admin accesible
- [ ] APIs configuradas desde panel

---

## 🎉 ¡LISTO!

Tu app está corriendo en Windows VPS.

**URLs:**
- App: `http://IP_VPS:3000` o `http://tu-dominio.com`
- Admin: `http://IP_VPS:3000/admin.html`

---

## 📞 COMANDOS ÚTILES

```powershell
# Ver IP del VPS
ipconfig | findstr IPv4

# Reiniciar app (PM2)
pm2 restart carnival-voting

# Ver logs
pm2 logs carnival-voting

# Ver estado
pm2 status

# Backup DB
copy database\carnival.db backups\backup.db

# Actualizar proyecto (Git)
git pull
npm install
pm2 restart carnival-voting
```

---

## 🆘 PROVEEDORES VPS RECOMENDADOS

| Proveedor | Precio | RAM | CPU | Windows |
|-----------|--------|-----|-----|---------|
| **Contabo** | $6/mes | 4GB | 2 CPU | ✅ |
| **OVH** | $8/mes | 2GB | 1 CPU | ✅ |
| **Vultr** | $12/mes | 2GB | 1 CPU | ✅ |
| **DigitalOcean** | $12/mes | 2GB | 1 CPU | ❌ Solo Linux |
| **AWS Lightsail** | $16/mes | 2GB | 1 CPU | ✅ |

**Recomendación:** Contabo (mejor relación precio/calidad)

---

**¿Problemas?** Revisa los logs y el troubleshooting. ¡Suerte! 🚀
