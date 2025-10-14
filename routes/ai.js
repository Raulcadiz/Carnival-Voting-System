// routes/ai.js
const express = require('express');
const router = express.Router();
const GroqService = require('../services/groqService');

// Middleware para inicializar Groq Service
router.use((req, res, next) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(503).json({ 
            error: 'Servicio de IA no configurado. Contacta al administrador.' 
        });
    }
    req.groq = new GroqService(apiKey);
    next();
});

// 📝 Generar pregunta de trivia
router.post('/trivia/generate', async (req, res) => {
    try {
        const { topic, difficulty } = req.body;
        
        if (!topic) {
            return res.status(400).json({ error: 'Tema requerido' });
        }

        const validDifficulties = ['easy', 'medium', 'hard'];
        const validatedDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'medium';

        const result = await req.groq.generateTriviaQuestion(topic, validatedDifficulty);

        if (result.success) {
            // Registrar en logs
            req.db.run(
                'INSERT INTO activity_logs (action, details) VALUES (?, ?)',
                ['trivia_generated', JSON.stringify({ topic, difficulty: validatedDifficulty })]
            );

            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error generando trivia:', error);
        res.status(500).json({ error: 'Error al generar pregunta de trivia' });
    }
});

// 💬 Chat con Carnivalito
router.post('/chat', async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Mensaje requerido' });
        }

        const history = Array.isArray(conversationHistory) ? conversationHistory : [];
        const result = await req.groq.chatWithPersonality(message, history);

        if (result.success) {
            // Registrar en logs
            req.db.run(
                'INSERT INTO activity_logs (action, details) VALUES (?, ?)',
                ['chat_message', JSON.stringify({ message: message.substring(0, 100) })]
            );

            res.json({ 
                response: result.message,
                usage: result.usage 
            });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error en chat:', error);
        res.status(500).json({ error: 'Error al procesar mensaje' });
    }
});

// 🎯 Temas sugeridos para trivia
router.get('/trivia/topics', (req, res) => {
    const topics = [
        { 
            id: 'carnaval-historia', 
            name: 'Historia del Carnaval 🎭', 
            icon: '🎭',
            description: 'Orígenes y tradiciones'
        },
        { 
            id: 'musica-carnaval', 
            name: 'Música de Carnaval 🎵', 
            icon: '🎵',
            description: 'Samba, murgas y comparsas'
        },
        { 
            id: 'disfraces', 
            name: 'Disfraces y Vestimenta 👗', 
            icon: '👗',
            description: 'Trajes típicos y máscaras'
        },
        { 
            id: 'comida-carnaval', 
            name: 'Gastronomía Festiva 🍰', 
            icon: '🍰',
            description: 'Dulces y platos típicos'
        },
        { 
            id: 'carnavales-mundo', 
            name: 'Carnavales del Mundo 🌎', 
            icon: '🌎',
            description: 'Río, Venecia, y más'
        },
        { 
            id: 'cultura-popular', 
            name: 'Cultura Pop 🎬', 
            icon: '🎬',
            description: 'Carnaval en cine y TV'
        }
    ];

    res.json(topics);
});

// 📊 Estadísticas de uso de IA
router.get('/stats', async (req, res) => {
    try {
        const triviaCount = await new Promise((resolve, reject) => {
            req.db.get(
                `SELECT COUNT(*) as count FROM activity_logs 
                 WHERE action = 'trivia_generated' AND created_at > datetime('now', '-7 days')`,
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                }
            );
        });

        const chatCount = await new Promise((resolve, reject) => {
            req.db.get(
                `SELECT COUNT(*) as count FROM activity_logs 
                 WHERE action = 'chat_message' AND created_at > datetime('now', '-7 days')`,
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                }
            );
        });

        res.json({
            triviaQuestions: triviaCount,
            chatMessages: chatCount,
            period: 'last_7_days'
        });
    } catch (error) {
        console.error('Error obteniendo stats de IA:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

module.exports = router;
