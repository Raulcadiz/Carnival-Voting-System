#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando Carnival Voting System...\n');

// Verificar si la base de datos existe
const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'carnival.db');

// Crear directorio si no existe
if (!fs.existsSync(dbDir)) {
  console.log('📁 Creando directorio de base de datos...');
  fs.mkdirSync(dbDir, { recursive: true });
}

// Verificar DB
if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
  console.log('⚠️  Base de datos no encontrada.');
  console.log('💡 Railway debería haberla creado en el build step.');
  console.log('🔄 Si ves este mensaje, ejecuta: npm run migrate\n');
} else {
  console.log('✅ Base de datos encontrada\n');
}

// Iniciar servidor
console.log('🎭 Iniciando servidor...\n');
require('../server.js');