require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar rutas
const videosRoutes = require('./routes/videos');
const votesRoutes = require('./routes/votes');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES DE SEGURIDAD
// ============================================

// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameSrc: ["https://www.tiktok.com", "https://www.youtube.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-dominio.com'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Demasiadas solicitudes, intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ============================================
// SERVIR ARCHIVOS ESTÁTICOS
// ============================================
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// RUTAS DE API
// ============================================
app.use('/api/videos', videosRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de health check
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    const db = require('./config/database');
    await db.get('SELECT 1');
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    console.error('Healthcheck failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Database not ready',
      database: 'disconnected'
    });
  }
});

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const HOST = process.env.HOST || '0.0.0.0';

// Verificar conexión a la base de datos antes de iniciar
const db = require('./config/database');

async function startServer() {
  try {
    // Test de conexión a la base de datos
    await db.get('SELECT 1');
    console.log('✅ Conectado a la base de datos SQLite');
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   🎭 CARNIVAL VOTING SYSTEM - ACTIVO 🎭   ║
╚════════════════════════════════════════════╝

🌐 Servidor corriendo en: http://${HOST}:${PORT}
📊 API disponible en: http://${HOST}:${PORT}/api
🔒 Seguridad: ${process.env.NODE_ENV === 'production' ? 'PRODUCCIÓN' : 'DESARROLLO'}
⏰ Iniciado: ${new Date().toLocaleString('es-ES')}

📝 Endpoints disponibles:
   GET    /api/health
   GET    /api/videos
   POST   /api/videos
   GET    /api/videos/:id
   DELETE /api/videos/:id
   POST   /api/votes
   GET    /api/votes/check/:videoId
   GET    /api/stats
   GET    /api/stats/ranking
   GET    /api/stats/trending
   GET    /api/stats/random

💡 TIP: Abre http://localhost:${PORT} en tu navegador
  `);
      
      // Log específico para Railway
      console.log(`Server listening on ${HOST}:${PORT}`);
    });

    // Manejo de errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PORT} ya está en uso`);
        process.exit(1);
      } else {
        console.error('❌ Error del servidor:', error);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    console.error('💡 Asegúrate de ejecutar: npm run migrate');
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});
