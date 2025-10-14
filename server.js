// ======================================================
// 🎭 CARNIVAL VOTING SYSTEM - Enhanced Edition (v2.1)
// ======================================================

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

let db;
try {
    db = require('./config/database');
} catch (err) {
    console.warn('⚠️  Advertencia: No se encontró ./config/database.js');
    console.warn('   El servidor se iniciará sin conexión a la base de datos.\n');
    db = null;
}

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================

app.use(helmet({
    contentSecurityPolicy: false, // Necesario para permitir scripts inline
}));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// Middleware para agregar db a req
app.use((req, res, next) => {
    req.db = db;
    next();
});

// ============================================
// RUTAS ORIGINALES
// ============================================

function safeRequire(routePath) {
    try {
        return require(routePath);
    } catch (err) {
        console.warn(`⚠️  Ruta no encontrada: ${routePath}`);
        return null;
    }
}

const videosRoutes = safeRequire('./routes/videos');
const votesRoutes = safeRequire('./routes/votes');
const statsRoutes = safeRequire('./routes/stats');
const adminRoutes = safeRequire('./routes/admin');
const aiRoutes = safeRequire('./routes/ai');
const adminApiKeysRoutes = safeRequire('./routes/adminApiKeys');

if (videosRoutes) app.use('/api/videos', videosRoutes);
if (votesRoutes) app.use('/api/votes', votesRoutes);
if (statsRoutes) app.use('/api/stats', statsRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (aiRoutes) app.use('/api/ai', aiRoutes);
if (adminApiKeysRoutes) app.use('/api/admin/api-keys', adminApiKeysRoutes);

// ============================================
// RUTA DE HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    const status = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        apis: {
            groq: !!process.env.GROQ_API_KEY,
            tiktok1: !!process.env.TIKTOK_API_KEY_1,
            tiktok2: !!process.env.TIKTOK_API_KEY_2,
            youtube: !!process.env.YOUTUBE_API_KEY
        },
        features: {
            voting: !!votesRoutes,
            scraping: !!videosRoutes,
            trivia: !!process.env.GROQ_API_KEY,
            chat: !!process.env.GROQ_API_KEY,
            apiManagement: !!adminApiKeysRoutes
        }
    };
    res.json(status);
});

// ============================================
// MANEJO DE ERRORES
// ============================================

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.path 
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log('🎭 ============================================');
    console.log(`   CARNIVAL VOTING SYSTEM - Enhanced Edition`);
    console.log('============================================ 🎪');
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log('');
    console.log('📊 Funcionalidades disponibles:');
    console.log(`   ${votesRoutes ? '✅' : '❌'} Sistema de votación`);
    console.log(`   ${videosRoutes ? '✅' : '❌'} Scraping de videos`);
    console.log(`   ${process.env.GROQ_API_KEY ? '✅' : '❌'} Trivial con IA`);
    console.log(`   ${process.env.GROQ_API_KEY ? '✅' : '❌'} Chat con Carnivalito`);
    console.log(`   ${adminApiKeysRoutes ? '✅' : '❌'} Gestión de APIs`);
    console.log('');
    console.log('🎯 Accesos rápidos:');
    console.log(`   🏠 Home: http://localhost:${PORT}/`);
    console.log(`   🎲 Trivial: http://localhost:${PORT}/trivia.html`);
    console.log(`   💬 Chat: http://localhost:${PORT}/chat.html`);
    console.log(`   🔧 Admin: http://localhost:${PORT}/admin`);
    console.log('');
    if (!process.env.GROQ_API_KEY) {
        console.log('⚠️  ADVERTENCIA: GROQ_API_KEY no configurada');
        console.log('   El trivial y chat no funcionarán sin esta key');
        console.log('   Obtén una gratis en: https://console.groq.com\n');
    }
    console.log('🎉 ¡Sistema listo! ¡Que comience la fiesta! 🎭');
    console.log('============================================');
});

// ============================================
// MANEJO DE CIERRE GRACEFUL
// ============================================

const gracefulShutdown = () => {
    console.log('📴 Señal recibida, cerrando servidor...');
    if (db && db.close) {
        db.close((err) => {
            if (err) console.error('Error al cerrar la base de datos:', err);
            process.exit(err ? 1 : 0);
        });
    } else {
        process.exit(0);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
