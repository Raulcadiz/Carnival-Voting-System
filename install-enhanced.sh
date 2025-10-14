#!/bin/bash

# 🎭 Carnival Voting System - Enhanced Features Installer
# Este script instala automáticamente el Trivial y Chat con IA

echo "🎭 =============================================="
echo "   CARNIVAL VOTING SYSTEM - ENHANCED INSTALLER"
echo "   Agregando Trivial y Chat con IA"
echo "============================================== 🎪"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar Node.js
echo ""
print_info "Verificando requisitos..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    echo "Por favor instala Node.js desde: https://nodejs.org/"
    exit 1
fi
print_success "Node.js instalado: $(node -v)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi
print_success "npm instalado: $(npm -v)"

# Instalar dependencia adicional (axios)
echo ""
print_info "Instalando dependencias adicionales..."
if npm list axios &> /dev/null; then
    print_success "axios ya está instalado"
else
    npm install axios
    if [ $? -eq 0 ]; then
        print_success "axios instalado correctamente"
    else
        print_error "Error al instalar axios"
        exit 1
    fi
fi

# Verificar estructura del proyecto
echo ""
print_info "Verificando estructura del proyecto..."

# Crear directorios si no existen
mkdir -p services
mkdir -p routes
mkdir -p public/admin

print_success "Estructura de directorios verificada"

# Copiar archivos (ya deberían estar en su lugar)
echo ""
print_info "Verificando archivos del sistema..."

files_to_check=(
    "services/groqService.js"
    "routes/ai.js"
    "routes/adminApiKeys.js"
    "public/trivia.html"
    "public/chat.html"
    "public/admin/api-keys.html"
)

all_files_present=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file ✓"
    else
        print_warning "$file no encontrado"
        all_files_present=false
    fi
done

# Actualizar .env si no existe
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado"
    if [ -f .env.example ]; then
        print_info "Creando .env desde .env.example..."
        cp .env.example .env
        print_success ".env creado"
    else
        print_error "No se encontró .env.example"
    fi
else
    print_success "Archivo .env existe"
    
    # Verificar si GROQ_API_KEY está en .env
    if grep -q "GROQ_API_KEY" .env; then
        print_success "GROQ_API_KEY ya está en .env"
    else
        print_info "Agregando GROQ_API_KEY a .env..."
        echo "" >> .env
        echo "# Groq API (para Chat y Trivial con IA)" >> .env
        echo "GROQ_API_KEY=tu_groq_api_key_aqui" >> .env
        print_success "GROQ_API_KEY agregada a .env"
    fi
fi

# Actualizar package.json si es necesario
echo ""
print_info "Verificando package.json..."

if [ -f package.json ]; then
    if grep -q "axios" package.json; then
        print_success "package.json actualizado"
    else
        print_warning "Ejecuta: npm install axios"
    fi
else
    print_error "package.json no encontrado"
fi

# Instrucciones finales
echo ""
echo "🎉 =============================================="
echo "   INSTALACIÓN COMPLETADA"
echo "============================================== 🎉"
echo ""
print_info "PRÓXIMOS PASOS:"
echo ""
echo "1️⃣  Obtén tu API Key de Groq (GRATIS):"
echo "   ${BLUE}https://console.groq.com${NC}"
echo ""
echo "2️⃣  Agrega tu key a .env:"
echo "   ${YELLOW}nano .env${NC}"
echo "   Busca: GROQ_API_KEY=tu_groq_api_key_aqui"
echo "   Pega tu key"
echo ""
echo "3️⃣  Actualiza tu server.js:"
echo "   Agrega estas líneas:"
echo "   ${GREEN}const aiRoutes = require('./routes/ai');${NC}"
echo "   ${GREEN}const adminApiKeysRoutes = require('./routes/adminApiKeys');${NC}"
echo "   ${GREEN}app.use('/api/ai', aiRoutes);${NC}"
echo "   ${GREEN}app.use('/api/admin/api-keys', adminApiKeysRoutes);${NC}"
echo ""
echo "4️⃣  Inicia el servidor:"
echo "   ${YELLOW}npm start${NC}"
echo ""
echo "5️⃣  Accede a las nuevas funcionalidades:"
echo "   🎲 Trivial: ${BLUE}http://localhost:3000/trivia.html${NC}"
echo "   💬 Chat: ${BLUE}http://localhost:3000/chat.html${NC}"
echo "   🔑 Admin APIs: ${BLUE}http://localhost:3000/admin/api-keys.html${NC}"
echo ""
print_info "Para más detalles, lee: ${YELLOW}INTEGRATION_GUIDE.md${NC}"
echo ""
print_success "¡Todo listo! 🎭 ¡Que comience la fiesta! 🎉"
echo ""
