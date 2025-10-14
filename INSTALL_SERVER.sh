#!/bin/bash

# 🎭 GUÍA DE INSTALACIÓN EN EL SERVIDOR

echo "🎭 =============================================="
echo "   INSTALACIÓN CARNIVAL VOTING SYSTEM v2.0"
echo "   Versión Corregida - Sin Errores"
echo "============================================== 🎪"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Función de éxito
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función de advertencia
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Función de error
error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "📋 PASOS A SEGUIR:"
echo ""

echo "1️⃣  HACER BACKUP DEL PROYECTO ACTUAL"
echo "   cd /var/www/"
echo "   mv Carnival-Voting-System Carnival-Voting-System.backup"
echo ""

echo "2️⃣  SUBIR LA NUEVA VERSIÓN"
echo "   - Descomprime carnival-fixed.zip en tu PC"
echo "   - Sube la carpeta al servidor como 'Carnival-Voting-System'"
echo "   - Usa SFTP, SCP, o tu método preferido"
echo ""

echo "3️⃣  INSTALAR DEPENDENCIAS"
echo "   cd /var/www/Carnival-Voting-System"
echo "   npm install"
echo ""

echo "4️⃣  CONFIGURAR .env"
echo "   cp .env.example .env"
echo "   nano .env"
echo ""
echo "   Configura estas variables CRÍTICAS:"
echo "   - GROQ_API_KEY=tu_key_de_groq"
echo "   - JWT_SECRET=algo_super_seguro"
echo "   - NODE_ENV=production"
echo ""

echo "5️⃣  CREAR BASE DE DATOS"
echo "   npm run setup"
echo ""

echo "6️⃣  REINICIAR CON PM2"
echo "   pm2 delete carnival"
echo "   pm2 start server.js --name carnival"
echo "   pm2 save"
echo ""

echo "7️⃣  VERIFICAR QUE FUNCIONA"
echo "   pm2 logs carnival"
echo ""
echo "   Deberías ver:"
echo "   - ✅ Conectado a la base de datos"
echo "   - 🚀 Servidor corriendo en puerto 3000"
echo "   - SIN errores de ValidationError"
echo ""

echo "8️⃣  PROBAR EN NAVEGADOR"
echo "   http://tu-dominio.com/"
echo "   http://tu-dominio.com/trivia.html"
echo "   http://tu-dominio.com/chat.html"
echo ""

echo "=============================================="
echo "🔧 SOLUCIÓN DE PROBLEMAS"
echo "=============================================="
echo ""

echo "❌ Error: Cannot find module"
echo "   Solución: npm install"
echo ""

echo "❌ Error: GROQ_API_KEY not configured"
echo "   Solución: Agrega la key en .env"
echo "   Obtén una gratis: https://console.groq.com"
echo ""

echo "❌ Error: Database not found"
echo "   Solución: npm run setup"
echo ""

echo "❌ Error: ValidationError trust proxy"
echo "   Solución: Ya está corregido en esta versión ✅"
echo ""

echo "=============================================="
echo "📊 VERIFICACIÓN POST-INSTALACIÓN"
echo "=============================================="
echo ""

echo "Ejecuta estos comandos para verificar:"
echo ""
echo "# Ver logs (deben ser limpios, sin errores)"
echo "pm2 logs carnival --lines 50"
echo ""
echo "# Ver status"
echo "pm2 status"
echo ""
echo "# Probar API"
echo "curl http://localhost:3000/api/health"
echo ""
echo "# Ver contenido de .env (verificar keys)"
echo "cat .env | grep -E 'GROQ|JWT'"
echo ""

echo "=============================================="
echo "🎉 ¡LISTO! DISFRUTA TU CARNIVAL SYSTEM"
echo "=============================================="
echo ""
echo "Si todo está bien, deberías poder:"
echo "✅ Votar por videos"
echo "✅ Jugar al trivial del COAC"
echo "✅ Chatear con Carnivalito"
echo "✅ Gestionar APIs desde admin"
echo ""
echo "🎭 ¡Que comience la fiesta gaditana! 🎪"
