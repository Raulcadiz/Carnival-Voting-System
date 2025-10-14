// scripts/migrate-enhanced.js
// Script para agregar las tablas necesarias para las nuevas funcionalidades

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database/carnival.db';

console.log('🎭 Iniciando migración de base de datos...\n');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err);
        process.exit(1);
    }
    console.log('✅ Conectado a la base de datos\n');
});

// Función para ejecutar queries con promesas
function runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// Función para verificar si una tabla existe
function tableExists(tableName) {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            [tableName],
            (err, row) => {
                if (err) reject(err);
                else resolve(!!row);
            }
        );
    });
}

async function migrate() {
    try {
        // ============================================
        // Tabla: activity_logs
        // ============================================
        console.log('📊 Verificando tabla activity_logs...');
        
        const activityLogsExists = await tableExists('activity_logs');
        
        if (!activityLogsExists) {
            console.log('   Creando tabla activity_logs...');
            await runQuery(`
                CREATE TABLE activity_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action TEXT NOT NULL,
                    details TEXT,
                    user_id INTEGER,
                    ip_address TEXT,
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabla activity_logs creada');
        } else {
            console.log('✅ Tabla activity_logs ya existe');
        }

        // Crear índices para mejorar performance
        console.log('\n📈 Creando índices...');
        
        try {
            await runQuery(`
                CREATE INDEX IF NOT EXISTS idx_activity_logs_action 
                ON activity_logs(action)
            `);
            console.log('✅ Índice en action creado');
        } catch (err) {
            console.log('⚠️  Índice en action ya existe');
        }

        try {
            await runQuery(`
                CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at 
                ON activity_logs(created_at)
            `);
            console.log('✅ Índice en created_at creado');
        } catch (err) {
            console.log('⚠️  Índice en created_at ya existe');
        }

        // ============================================
        // Tabla: trivia_scores (opcional, para futuro)
        // ============================================
        console.log('\n🎮 Verificando tabla trivia_scores...');
        
        const triviaScoresExists = await tableExists('trivia_scores');
        
        if (!triviaScoresExists) {
            console.log('   Creando tabla trivia_scores...');
            await runQuery(`
                CREATE TABLE trivia_scores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_ip TEXT,
                    topic TEXT NOT NULL,
                    difficulty TEXT NOT NULL,
                    correct_answers INTEGER DEFAULT 0,
                    incorrect_answers INTEGER DEFAULT 0,
                    max_streak INTEGER DEFAULT 0,
                    total_questions INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabla trivia_scores creada');
            
            await runQuery(`
                CREATE INDEX IF NOT EXISTS idx_trivia_scores_user_ip 
                ON trivia_scores(user_ip)
            `);
            console.log('✅ Índice en user_ip creado');
        } else {
            console.log('✅ Tabla trivia_scores ya existe');
        }

        // ============================================
        // Tabla: chat_conversations (opcional, para futuro)
        // ============================================
        console.log('\n💬 Verificando tabla chat_conversations...');
        
        const chatConversationsExists = await tableExists('chat_conversations');
        
        if (!chatConversationsExists) {
            console.log('   Creando tabla chat_conversations...');
            await runQuery(`
                CREATE TABLE chat_conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    user_ip TEXT,
                    message TEXT NOT NULL,
                    response TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabla chat_conversations creada');
            
            await runQuery(`
                CREATE INDEX IF NOT EXISTS idx_chat_conversations_session 
                ON chat_conversations(session_id)
            `);
            console.log('✅ Índice en session_id creado');
        } else {
            console.log('✅ Tabla chat_conversations ya existe');
        }

        // ============================================
        // Insertar datos de ejemplo
        // ============================================
        console.log('\n📝 Insertando log de ejemplo...');
        
        await runQuery(`
            INSERT INTO activity_logs (action, details)
            VALUES (?, ?)
        `, ['system_enhanced', JSON.stringify({
            version: '2.0.0',
            features: ['trivia', 'chat', 'api_management'],
            timestamp: new Date().toISOString()
        })]);
        
        console.log('✅ Log de sistema creado');

        // ============================================
        // Verificación final
        // ============================================
        console.log('\n🔍 Verificación final...');
        
        const tables = await new Promise((resolve, reject) => {
            db.all(
                "SELECT name FROM sqlite_master WHERE type='table'",
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        console.log('\n📋 Tablas en la base de datos:');
        tables.forEach(table => {
            console.log(`   ✓ ${table.name}`);
        });

        console.log('\n🎉 ============================================');
        console.log('   MIGRACIÓN COMPLETADA EXITOSAMENTE');
        console.log('============================================ 🎉\n');

    } catch (error) {
        console.error('\n❌ Error durante la migración:', error);
        process.exit(1);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error al cerrar la base de datos:', err);
            }
            console.log('🔒 Base de datos cerrada\n');
        });
    }
}

// Ejecutar migración
migrate();
