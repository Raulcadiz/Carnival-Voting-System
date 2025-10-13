#!/usr/bin/env node

const { execSync } = require('child_process');
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

// Si la DB no existe o está vacía, ejecutar migración
const needsMigration = !fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0;

if (needsMigration) {
  console.log('🔧 Base de datos no encontrada o vacía, ejecutando migración...\n');
  try {
    execSync('node scripts/migrate.js', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('\n✅ Migración completada\n');
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Base de datos encontrada\n');
}

// Iniciar servidor
console.log('🎭 Iniciando servidor...\n');
require('../server.js');
