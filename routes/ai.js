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
            id: 'historia-coac', 
            name: 'Historia del COAC 🎭', 
            icon: '🎭',
            description: 'Orígenes, evolución y momentos históricos'
        },
        { 
            id: 'agrupaciones-legendarias', 
            name: 'Agrupaciones Legendarias 👑', 
            icon: '👑',
            description: 'Los Millonarios, Los Carapapas, y más'
        },
        { 
            id: 'autores-coac', 
            name: 'Autores del COAC ✍️', 
            icon: '✍️',
            description: 'Martínez Ares, El Sheriff, Paco Alba...'
        },
        { 
            id: 'letras-miticas', 
            name: 'Letras Míticas 📜', 
            icon: '📜',
            description: 'Tipos, cuplés y pasodobles históricos'
        },
        { 
            id: 'modalidades', 
            name: 'Modalidades del COAC 🎪', 
            icon: '🎪',
            description: 'Chirigota, Comparsa, Cuarteto y Coro'
        },
        { 
            id: 'anecdotas-coac', 
            name: 'Anécdotas y Curiosidades 💡', 
            icon: '💡',
            description: 'Historias reales del Teatro Falla'
        },
        { 
            id: 'premios-palmarés', 
            name: 'Premios y Palmarés 🏆', 
            icon: '🏆',
            description: 'Ganadores históricos y récords'
        },
        { 
            id: 'musica-carnaval', 
            name: 'Música del Carnaval 🎵', 
            icon: '🎵',
            description: 'Tangos, pasodobles, cuplés'
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
