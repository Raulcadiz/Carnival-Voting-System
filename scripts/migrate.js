// scripts/migrate.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/carnival.db');

console.log('🎭 Creando base de datos...\n');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
    console.log('✅ Base de datos creada/conectada\n');
});

db.serialize(() => {
    // Tabla de videos
    db.run(`
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform TEXT NOT NULL,
            video_url TEXT UNIQUE NOT NULL,
            video_id TEXT NOT NULL,
            username TEXT,
            title TEXT,
            description TEXT,
            thumbnail_url TEXT,
            duration INTEGER,
            view_count INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creando tabla videos:', err);
        else console.log('✅ Tabla videos creada');
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
            FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error('Error creando tabla votes:', err);
        else console.log('✅ Tabla votes creada');
    });

    // Tabla de categorías
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            color TEXT
        )
    `, (err) => {
        if (err) console.error('Error creando tabla categories:', err);
        else console.log('✅ Tabla categories creada');
    });

    // Tabla de logs
    db.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            details TEXT,
            user_id INTEGER,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creando tabla activity_logs:', err);
        else console.log('✅ Tabla activity_logs creada');
    });

    console.log('\n🎉 Base de datos inicializada correctamente\n');
});

db.close();