#!/bin/bash

# ============================================
# CARNIVAL VOTING SYSTEM - INSTALACIÓN
# ============================================

echo "🎭 ========================================"
echo "   CARNIVAL VOTING SYSTEM - INSTALACIÓN"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ============================================
# 1. VERIFICAR REQUISITOS
# ============================================
print_info "Verificando requisitos del sistema..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    print_info "Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    print_error "Node.js versión 14 o superior es requerida"
    print_info "Versión actual: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detectado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_success "npm $(npm -v) detectado"

# ============================================
# 2. INSTALAR DEPENDENCIAS
# ============================================
print_info "Instalando dependencias..."

if npm install; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error instalando dependencias"
    exit 1
fi

# ============================================
# 3. CONFIGURACIÓN
# ============================================
print_info "Configurando el proyecto..."

# Verificar si existe .env
if [ -f ".env" ]; then
    print_warning "Ya existe un archivo .env"
    read -p "¿Deseas reconfigurarlo? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_info "Usando configuración existente"
    else
        node scripts/setup.js
    fi
else
    print_info "Iniciando configuración interactiva..."
    node scripts/setup.js
fi

# ============================================
# 4. CREAR BASE DE DATOS
# ============================================
print_info "Creando base de datos..."

if npm run migrate; then
    print_success "Base de datos creada exitosamente"
else
    print_error "Error creando base de datos"
    exit 1
fi

# ============================================
# 5. VERIFICACIÓN FINAL
# ============================================
print_info "Verificando instalación..."

# Verificar estructura de directorios
if [ -d "database" ] && [ -d "public" ] && [ -d "routes" ]; then
    print_success "Estructura de directorios OK"
else
    print_error "Faltan directorios necesarios"
    exit 1
fi

# Verificar archivo .env
if [ -f ".env" ]; then
    print_success "Archivo .env configurado"
else
    print_warning "No se encontró archivo .env"
fi

# ============================================
# INSTALACIÓN COMPLETADA
# ============================================
echo ""
echo "🎉 ========================================"
echo "   ¡INSTALACIÓN COMPLETADA!"
echo "=========================================="
echo ""
print_success "El sistema está listo para usar"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Verifica tu archivo .env con tus API keys"
echo "2. Inicia el servidor con:"
echo "   ${GREEN}npm start${NC}"
echo ""
echo "3. Abre tu navegador en:"
echo "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "💡 Comandos disponibles:"
echo "   npm start      - Iniciar servidor"
echo "   npm run dev    - Iniciar con nodemon (desarrollo)"
echo "   npm run setup  - Reconfigurar proyecto"
echo "   npm run migrate - Recrear base de datos"
echo ""
print_info "¡Disfruta del Carnival Voting System! 🎭"
echo ""
