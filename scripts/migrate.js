const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Crear directorio de base de datos si no existe
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'carnival.db');

console.log('🔧 Iniciando migración de base de datos...');
console.log('📁 Ruta DB:', dbPath);

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al crear base de datos:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado a la base de datos SQLite');
});

// Crear tablas
db.serialize(() => {
  // Tabla de videos
  db.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL CHECK(platform IN ('tiktok', 'youtube')),
      video_url TEXT NOT NULL UNIQUE,
      video_id TEXT NOT NULL,
      username TEXT NOT NULL,
      title TEXT,
      description TEXT,
      thumbnail_url TEXT,
      duration INTEGER,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla videos:', err.message);
    } else {
      console.log('✅ Tabla "videos" creada');
    }
  });

  // Tabla de votos
  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id INTEGER NOT NULL,
      user_ip TEXT NOT NULL,
      user_agent TEXT,
      voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(video_id, user_ip),
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla votes:', err.message);
    } else {
      console.log('✅ Tabla "votes" creada');
    }
  });

  // Tabla de categorías (opcional)
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT DEFAULT '#DAA520',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla categories:', err.message);
    } else {
      console.log('✅ Tabla "categories" creada');
    }
  });

  // Tabla de relación videos-categorías
  db.run(`
    CREATE TABLE IF NOT EXISTS video_categories (
      video_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      PRIMARY KEY (video_id, category_id),
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla video_categories:', err.message);
    } else {
      console.log('✅ Tabla "video_categories" creada');
    }
  });

  // Tabla de configuración (para APIs y settings)
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
      console.log('✅ Tabla "config" creada');
    }
  });

  // Crear índices para optimización
  db.run('CREATE INDEX IF NOT EXISTS idx_votes_video_id ON votes(video_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_votes_user_ip ON votes(user_ip)');
  db.run('CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform)');
  db.run('CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC)');

  console.log('✅ Índices creados para optimización');

  // Insertar categorías por defecto
  const defaultCategories = [
    { name: 'Danza', description: 'Videos de baile y coreografías', color: '#FF6B6B' },
    { name: 'Comedia', description: 'Videos graciosos y sketches', color: '#4ECDC4' },
    { name: 'Música', description: 'Covers y originales musicales', color: '#FFD93D' },
    { name: 'Arte', description: 'Creaciones artísticas', color: '#8B008B' },
    { name: 'Deporte', description: 'Contenido deportivo', color: '#6BCB77' }
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO categories (name, description, color) VALUES (?, ?, ?)');
  defaultCategories.forEach(cat => {
    stmt.run(cat.name, cat.description, cat.color);
  });
  stmt.finalize(() => {
    console.log('✅ Categorías por defecto insertadas');
  });

  // Insertar/actualizar configuraciones por defecto desde .env
  console.log('\n🔑 Importando configuraciones desde .env...');
  
  const defaultConfigs = [
    { key: 'TIKTOK_API_KEY_1', value: process.env.TIKTOK_API_KEY_1 || '', description: 'TikTok API Key #1 (Principal)' },
    { key: 'TIKTOK_API_HOST_1', value: process.env.TIKTOK_API_HOST_1 || 'tiktok-scraper7.p.rapidapi.com', description: 'TikTok API Host #1' },
    { key: 'TIKTOK_API_KEY_2', value: process.env.TIKTOK_API_KEY_2 || '', description: 'TikTok API Key #2 (Backup)' },
    { key: 'TIKTOK_API_HOST_2', value: process.env.TIKTOK_API_HOST_2 || 'tiktok-video-no-watermark2.p.rapidapi.com', description: 'TikTok API Host #2' },
    { key: 'YOUTUBE_API_KEY', value: process.env.YOUTUBE_API_KEY || '', description: 'YouTube Data API v3 Key' }
  ];

  const configStmt = db.prepare('INSERT OR REPLACE INTO config (key, value, description, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)');
  defaultConfigs.forEach(cfg => {
    configStmt.run(cfg.key, cfg.value, cfg.description);
    const status = cfg.value ? '✅ Configurada' : '⚠️  Vacía';
    console.log(`   ${status}: ${cfg.key}`);
  });
  configStmt.finalize(() => {
    console.log('✅ Configuraciones importadas desde .env');
    console.log('\n💡 Ahora puedes editarlas desde el panel admin sin reiniciar');
  });
});

db.close((err) => {
  if (err) {
    console.error('❌ Error cerrando base de datos:', err.message);
  } else {
    console.log('\n🎉 Base de datos configurada exitosamente');
    console.log('📁 Ubicación:', dbPath);
    console.log('\n🚀 Siguiente paso: npm start');
  }
});
