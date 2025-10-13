const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
🎭 ========================================
   CONFIGURACIÓN INICIAL - CARNIVAL VOTING
========================================

Este asistente te ayudará a configurar el proyecto.
`);

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  const envPath = path.join(__dirname, '..', '.env');
  
  // Verificar si ya existe .env
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  Ya existe un archivo .env. ¿Sobrescribirlo? (s/n): ');
    if (overwrite.toLowerCase() !== 's') {
      console.log('❌ Configuración cancelada');
      rl.close();
      return;
    }
  }

  console.log('\n📋 CONFIGURACIÓN DE APIs\n');

  // TikTok API 1
  console.log('🔹 TikTok API #1 (Principal)');
  const tiktokKey1 = await question('   API Key 1: ');
  const tiktokHost1 = await question('   API Host 1 [tiktok-scraper7.p.rapidapi.com]: ') || 'tiktok-scraper7.p.rapidapi.com';

  // TikTok API 2
  console.log('\n🔹 TikTok API #2 (Backup)');
  const tiktokKey2 = await question('   API Key 2: ');
  const tiktokHost2 = await question('   API Host 2 [tiktok-video-no-watermark2.p.rapidapi.com]: ') || 'tiktok-video-no-watermark2.p.rapidapi.com';

  // YouTube API
  console.log('\n🔹 YouTube Data API v3');
  const youtubeKey = await question('   API Key: ');

  // Puerto
  console.log('\n⚙️  CONFIGURACIÓN DEL SERVIDOR');
  const port = await question('   Puerto [3000]: ') || '3000';

  // Generar JWT secret
  const jwtSecret = require('crypto').randomBytes(32).toString('base64');

  // Crear archivo .env
  const envContent = `# ===================================
# CONFIGURACIÓN DEL SERVIDOR
# ===================================
PORT=${port}
NODE_ENV=development

# ===================================
# APIs DE TIKTOK
# ===================================
TIKTOK_API_KEY_1=${tiktokKey1}
TIKTOK_API_HOST_1=${tiktokHost1}

TIKTOK_API_KEY_2=${tiktokKey2}
TIKTOK_API_HOST_2=${tiktokHost2}

# ===================================
# API DE YOUTUBE
# ===================================
YOUTUBE_API_KEY=${youtubeKey}

# ===================================
# SEGURIDAD
# ===================================
JWT_SECRET=${jwtSecret}
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===================================
# BASE DE DATOS
# ===================================
DB_PATH=./database/carnival.db
`;

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Archivo .env creado exitosamente');

  // Crear directorio de base de datos
  const dbDir = path.join(__dirname, '..', 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Directorio database/ creado');
  }

  console.log(`
🎉 ¡CONFIGURACIÓN COMPLETADA!

📝 Próximos pasos:
   1. npm install           (instalar dependencias)
   2. npm run migrate       (crear base de datos)
   3. npm start             (iniciar servidor)

🌐 El servidor estará disponible en: http://localhost:${port}
  `);

  rl.close();
}

setup().catch(err => {
  console.error('❌ Error durante la configuración:', err);
  rl.close();
  process.exit(1);
});
