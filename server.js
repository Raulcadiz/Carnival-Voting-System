// server.js - VERSIÓN CORREGIDA
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// TRUST PROXY - CONFIGURACIÓN CORRECTA
// ============================================
// Solo confiar en 1 nivel de proxy (Nginx)
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARES
// ============================================

app.use(helmet({
    contentSecurityPolicy: false,
}));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting con validación deshabilitada para trust proxy
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
    standardHeaders: true,
    legacyHeaders: false,
    // Deshabilitar validaciones que causan errores
    validate: {
        xForwardedForHeader: false,
        trustProxy: false
    }
});

app.use('/api/', limiter);

// Middleware para agregar db a req
app.use((req, res, next) => {
    req.db = db;
    next();
});

// ============================================
// RUTAS
// ============================================

const videosRoutes = require('./routes/videos');
const votesRoutes = require('./routes/votes');
const statsRoutes = require('./routes/stats');

app.use('/api/videos', videosRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/stats', statsRoutes);

// Rutas de IA (nuevas)
const aiRoutes = require('./routes/ai');
const adminApiKeysRoutes = require('./routes/adminApiKeys');

app.use('/api/ai', aiRoutes);
app.use('/api/admin/api-keys', adminApiKeysRoutes);

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
            voting: true,
            scraping: true,
            trivia: !!process.env.GROQ_API_KEY,
            chat: !!process.env.GROQ_API_KEY,
            apiManagement: true
        }
    };
    res.json(status);
});

// ============================================
// MANEJO DE ERRORES
// ============================================

// 404
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.path 
    });
});

// Error handler global
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
    console.log(`   ✅ Sistema de votación`);
    console.log(`   ✅ Scraping de videos`);
    console.log(`   ${process.env.GROQ_API_KEY ? '✅' : '❌'} Trivial con IA`);
    console.log(`   ${process.env.GROQ_API_KEY ? '✅' : '❌'} Chat con Carnivalito`);
    console.log(`   ✅ Gestión de APIs`);
    console.log('');
    console.log('🎯 Accesos rápidos:');
    console.log(`   🏠 Home: http://localhost:${PORT}/`);
    console.log(`   🎲 Trivial: http://localhost:${PORT}/trivia.html`);
    console.log(`   💬 Chat: http://localhost:${PORT}/chat.html`);
    console.log('');
    if (!process.env.GROQ_API_KEY) {
        console.log('⚠️  ADVERTENCIA: GROQ_API_KEY no configurada');
        console.log('   El trivial y chat no funcionarán sin esta key');
        console.log('   Obtén una gratis en: https://console.groq.com');
        console.log('');
    }
    console.log('🎉 ¡Sistema listo! ¡Que comience la fiesta! 🎭');
    console.log('============================================');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('📴 Señal SIGTERM recibida, cerrando servidor...');
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos:', err);
        }
        process.exit(err ? 1 : 0);
    });
});

module.exports = app;
