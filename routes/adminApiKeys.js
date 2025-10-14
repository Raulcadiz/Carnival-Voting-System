// routes/adminApiKeys.js
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Middleware de autenticación (reutiliza el que ya tienes)
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    // Aquí deberías validar el JWT como en tu sistema actual
    next();
};

// 📋 Obtener todas las API keys configuradas
router.get('/keys', authMiddleware, async (req, res) => {
    try {
        const envPath = path.join(process.cwd(), '.env');
        const envContent = await fs.readFile(envPath, 'utf-8');
        
        const keys = {
            groq: {
                name: 'Groq API',
                configured: !!process.env.GROQ_API_KEY,
                masked: process.env.GROQ_API_KEY ? maskApiKey(process.env.GROQ_API_KEY) : null,
                description: 'Para chat y trivial con IA',
                required: true
            },
            tiktok1: {
                name: 'TikTok API #1',
                configured: !!process.env.TIKTOK_API_KEY_1,
                masked: process.env.TIKTOK_API_KEY_1 ? maskApiKey(process.env.TIKTOK_API_KEY_1) : null,
                host: process.env.TIKTOK_API_HOST_1,
                description: 'API principal de TikTok',
                required: true
            },
            tiktok2: {
                name: 'TikTok API #2',
                configured: !!process.env.TIKTOK_API_KEY_2,
                masked: process.env.TIKTOK_API_KEY_2 ? maskApiKey(process.env.TIKTOK_API_KEY_2) : null,
                host: process.env.TIKTOK_API_HOST_2,
                description: 'API de respaldo de TikTok',
                required: true
            },
            youtube: {
                name: 'YouTube Data API v3',
                configured: !!process.env.YOUTUBE_API_KEY,
                masked: process.env.YOUTUBE_API_KEY ? maskApiKey(process.env.YOUTUBE_API_KEY) : null,
                description: 'Para obtener datos de YouTube',
                required: true
            },
            jwt: {
                name: 'JWT Secret',
                configured: !!process.env.JWT_SECRET,
                masked: process.env.JWT_SECRET ? '***************' : null,
                description: 'Clave secreta para tokens',
                required: true
            }
        };

        res.json(keys);
    } catch (error) {
        console.error('Error obteniendo API keys:', error);
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
});

// ✏️ Actualizar API key
router.put('/keys/:keyName', authMiddleware, async (req, res) => {
    try {
        const { keyName } = req.params;
        const { value, host } = req.body;

        if (!value) {
            return res.status(400).json({ error: 'Valor requerido' });
        }

        const envPath = path.join(process.cwd(), '.env');
        let envContent = await fs.readFile(envPath, 'utf-8');

        // Mapeo de nombres a variables de entorno
        const keyMapping = {
            'groq': 'GROQ_API_KEY',
            'tiktok1': 'TIKTOK_API_KEY_1',
            'tiktok2': 'TIKTOK_API_KEY_2',
            'youtube': 'YOUTUBE_API_KEY',
            'jwt': 'JWT_SECRET'
        };

        const envVarName = keyMapping[keyName];
        if (!envVarName) {
            return res.status(400).json({ error: 'API key inválida' });
        }

        // Actualizar o agregar la key
        const regex = new RegExp(`^${envVarName}=.*$`, 'm');
        if (envContent.match(regex)) {
            envContent = envContent.replace(regex, `${envVarName}=${value}`);
        } else {
            envContent += `\n${envVarName}=${value}`;
        }

        // Si hay host (para TikTok), actualizarlo también
        if (host && keyName.startsWith('tiktok')) {
            const hostVarName = keyName === 'tiktok1' ? 'TIKTOK_API_HOST_1' : 'TIKTOK_API_HOST_2';
            const hostRegex = new RegExp(`^${hostVarName}=.*$`, 'm');
            if (envContent.match(hostRegex)) {
                envContent = envContent.replace(hostRegex, `${hostVarName}=${host}`);
            } else {
                envContent += `\n${hostVarName}=${host}`;
            }
        }

        await fs.writeFile(envPath, envContent);

        // Actualizar process.env en memoria
        process.env[envVarName] = value;
        if (host && keyName.startsWith('tiktok')) {
            const hostVarName = keyName === 'tiktok1' ? 'TIKTOK_API_HOST_1' : 'TIKTOK_API_HOST_2';
            process.env[hostVarName] = host;
        }

        // Registrar en logs
        req.db.run(
            'INSERT INTO activity_logs (action, details) VALUES (?, ?)',
            ['api_key_updated', JSON.stringify({ key: keyName })]
        );

        res.json({ 
            success: true, 
            message: 'API key actualizada correctamente',
            masked: maskApiKey(value)
        });

    } catch (error) {
        console.error('Error actualizando API key:', error);
        res.status(500).json({ error: 'Error al actualizar API key' });
    }
});

// 🧪 Probar API key
router.post('/keys/:keyName/test', authMiddleware, async (req, res) => {
    try {
        const { keyName } = req.params;
        let testResult = { success: false, message: '' };

        switch (keyName) {
            case 'groq':
                testResult = await testGroqApi();
                break;
            case 'tiktok1':
            case 'tiktok2':
                testResult = await testTikTokApi(keyName);
                break;
            case 'youtube':
                testResult = await testYouTubeApi();
                break;
            default:
                return res.status(400).json({ error: 'API no soportada para testing' });
        }

        res.json(testResult);

    } catch (error) {
        console.error('Error probando API:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al probar la API: ' + error.message 
        });
    }
});

// 📊 Obtener uso y estadísticas de APIs
router.get('/keys/stats', authMiddleware, async (req, res) => {
    try {
        const stats = {};

        // Stats de Groq (últimos 7 días)
        const groqStats = await new Promise((resolve, reject) => {
            req.db.all(
                `SELECT 
                    DATE(created_at) as date, 
                    COUNT(*) as count 
                FROM activity_logs 
                WHERE action IN ('trivia_generated', 'chat_message') 
                    AND created_at > datetime('now', '-7 days')
                GROUP BY DATE(created_at)
                ORDER BY date DESC`,
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        stats.groq = {
            last7Days: groqStats,
            total: groqStats.reduce((sum, row) => sum + row.count, 0)
        };

        res.json(stats);

    } catch (error) {
        console.error('Error obteniendo stats de APIs:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Función auxiliar para enmascarar API keys
function maskApiKey(key) {
    if (!key || key.length < 8) return '***';
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
}

// Funciones de testing de APIs
async function testGroqApi() {
    const GroqService = require('../services/groqService');
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        return { success: false, message: 'API key no configurada' };
    }

    try {
        const groq = new GroqService(apiKey);
        const result = await groq.chat([
            { role: 'user', content: 'Di solo "OK"' }
        ]);

        if (result.success) {
            return { 
                success: true, 
                message: '✅ Groq API funcionando correctamente',
                details: `Modelo: ${groq.model}`
            };
        } else {
            return { 
                success: false, 
                message: '❌ Error: ' + result.error 
            };
        }
    } catch (error) {
        return { 
            success: false, 
            message: '❌ Error de conexión: ' + error.message 
        };
    }
}

async function testTikTokApi(keyName) {
    const axios = require('axios');
    const apiKey = keyName === 'tiktok1' ? process.env.TIKTOK_API_KEY_1 : process.env.TIKTOK_API_KEY_2;
    const apiHost = keyName === 'tiktok1' ? process.env.TIKTOK_API_HOST_1 : process.env.TIKTOK_API_HOST_2;

    if (!apiKey || !apiHost) {
        return { success: false, message: 'API key o host no configurados' };
    }

    try {
        // Test simple con un endpoint conocido
        const response = await axios.get(`https://${apiHost}/`, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': apiHost
            },
            timeout: 5000
        });

        return { 
            success: true, 
            message: '✅ TikTok API respondiendo correctamente',
            details: `Host: ${apiHost}`
        };
    } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            return { 
                success: false, 
                message: '❌ API key inválida o sin permisos' 
            };
        }
        return { 
            success: false, 
            message: '❌ Error: ' + error.message 
        };
    }
}

async function testYouTubeApi() {
    const axios = require('axios');
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return { success: false, message: 'API key no configurada' };
    }

    try {
        // Test simple buscando un video popular
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'snippet',
                id: 'dQw4w9WgXcQ', // Never Gonna Give You Up ;)
                key: apiKey
            },
            timeout: 5000
        });

        if (response.data.items && response.data.items.length > 0) {
            return { 
                success: true, 
                message: '✅ YouTube API funcionando correctamente',
                details: 'Quota utilizado: ' + (response.data.pageInfo?.totalResults || 'N/A')
            };
        } else {
            return { 
                success: false, 
                message: '❌ API key sin permisos o inválida' 
            };
        }
    } catch (error) {
        if (error.response?.status === 403) {
            return { 
                success: false, 
                message: '❌ API key inválida o cuota excedida' 
            };
        }
        return { 
            success: false, 
            message: '❌ Error: ' + error.message 
        };
    }
}

module.exports = router;
