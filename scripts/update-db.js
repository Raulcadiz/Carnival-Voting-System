require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'carnival.db');

console.log('🔄 Actualizando base de datos...');
console.log('📁 Ruta:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado a la base de datos');
});

db.serialize(() => {
  // Crear tabla de configuración si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT,
      description TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla config:', err.message);
    } else {
      console.log('✅ Tabla "config" verificada/creada');
    }
  });

  // Insertar configuraciones por defecto desde .env
  const defaultConfigs = [
    { key: 'TIKTOK_API_KEY_1', value: process.env.TIKTOK_API_KEY_1 || '', description: 'TikTok API Key #1 (Principal)' },
    { key: 'TIKTOK_API_HOST_1', value: process.env.TIKTOK_API_HOST_1 || 'tiktok-scraper7.p.rapidapi.com', description: 'TikTok API Host #1' },
    { key: 'TIKTOK_API_KEY_2', value: process.env.TIKTOK_API_KEY_2 || '', description: 'TikTok API Key #2 (Backup)' },
    { key: 'TIKTOK_API_HOST_2', value: process.env.TIKTOK_API_HOST_2 || 'tiktok-video-no-watermark2.p.rapidapi.com', description: 'TikTok API Host #2' },
    { key: 'YOUTUBE_API_KEY', value: process.env.YOUTUBE_API_KEY || '', description: 'YouTube Data API v3 Key' }
  ];

  console.log('\n🔧 Migrando configuraciones desde .env a base de datos...');

  const stmt = db.prepare('INSERT OR IGNORE INTO config (key, value, description) VALUES (?, ?, ?)');
  defaultConfigs.forEach(cfg => {
    stmt.run(cfg.key, cfg.value, cfg.description, (err) => {
      if (err) {
        console.error(`❌ Error insertando ${cfg.key}:`, err.message);
      } else {
        console.log(`✅ ${cfg.key}: ${cfg.value ? 'Configurada' : 'Pendiente'}`);
      }
    });
  });

  stmt.finalize(() => {
    console.log('\n✅ Migración completada');
    console.log('\n💡 Ahora puedes editar las APIs desde el panel de administración');
    console.log('🌐 http://localhost:3000/admin.html → Configuración\n');
  });
});

db.close((err) => {
  if (err) {
    console.error('❌ Error cerrando base de datos:', err.message);
  }
});
