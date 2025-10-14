// services/groqService.js
const axios = require('axios');

class GroqService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = 'llama-3.3-70b-versatile'; // Modelo rápido y potente
    }

    async chat(messages, systemPrompt = null) {
        try {
            const requestMessages = systemPrompt 
                ? [{ role: 'system', content: systemPrompt }, ...messages]
                : messages;

            const response = await axios.post(
                this.baseURL,
                {
                    model: this.model,
                    messages: requestMessages,
                    temperature: 0.8,
                    max_tokens: 1024,
                    top_p: 0.9
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                message: response.data.choices[0].message.content,
                usage: response.data.usage
            };
        } catch (error) {
            console.error('❌ Error en Groq API:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Error al comunicarse con la IA'
            };
        }
    }

    async generateTriviaQuestion(topic, difficulty = 'medium') {
        const systemPrompt = `Eres un creador de preguntas de trivia temáticas de Carnaval. 
Debes crear preguntas ${difficulty === 'easy' ? 'fáciles' : difficulty === 'hard' ? 'difíciles' : 'de dificultad media'} sobre ${topic}.
Las preguntas deben ser entretenidas, festivas y con emojis.

FORMATO DE RESPUESTA (JSON estricto):
{
    "question": "Pregunta con emojis 🎭",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correctAnswer": 0,
    "explanation": "Explicación divertida con emojis",
    "funFact": "Dato curioso relacionado 🎉"
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.`;

        const messages = [{
            role: 'user',
            content: `Crea una pregunta de trivia sobre: ${topic}`
        }];

        const result = await this.chat(messages, systemPrompt);
        
        if (result.success) {
            try {
                // Limpiar la respuesta de posibles caracteres extra
                let cleanedMessage = result.message.trim();
                
                // Si viene con markdown code blocks, removerlos
                if (cleanedMessage.startsWith('```json')) {
                    cleanedMessage = cleanedMessage.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                } else if (cleanedMessage.startsWith('```')) {
                    cleanedMessage = cleanedMessage.replace(/```\n?/g, '');
                }
                
                const triviaData = JSON.parse(cleanedMessage);
                return { success: true, data: triviaData };
            } catch (parseError) {
                console.error('Error parseando JSON:', parseError);
                return { 
                    success: false, 
                    error: 'Error al procesar la pregunta de trivia',
                    rawResponse: result.message 
                };
            }
        }
        
        return result;
    }

    async chatWithPersonality(userMessage, conversationHistory = []) {
        const systemPrompt = `Eres "Carnivalito" 🎭, un asistente virtual súper alegre y festivo del sistema de votación de Carnaval.

PERSONALIDAD:
- Usas MUCHOS emojis en cada respuesta 🎉🎊🎭✨
- Eres entusiasta y energético
- Siempre relacionas las respuestas con la temática de Carnaval
- Eres bromista pero útil
- Usas expresiones como "¡Qué locura!", "¡Brutal!", "¡Épico!"

REGLAS:
1. Respuestas cortas y directas (máximo 3-4 líneas)
2. SIEMPRE incluye al menos 3 emojis por respuesta
3. Si te preguntan sobre videos, motiva a votar
4. Si te preguntan sobre el sistema, explica con entusiasmo
5. Si el tema no es sobre Carnaval/votación, redirige con humor

Ejemplos:
- "¿Cómo votar?" → "¡Súper fácil! 🎯 Solo haz clic en el botón de votar de tu video favorito 🎬✨ ¡Y recuerda: un voto por IP por video! 🎭"
- "¿Cuál video está ganando?" → "¡Uyy! 🔥 Échale un vistazo a nuestro ranking en tiempo real 📊🎪 ¡La competencia está que arde! 🌟"
- "Estoy aburrido" → "¡No puede ser! 😱 ¿Aburrido en el Carnaval? 🎭 ¡Juega nuestro TRIVIAL de Carnaval! 🎲✨ ¡O vota por los videos más épicos! 🎬🔥"`;

        const messages = [
            ...conversationHistory.slice(-10), // Últimos 10 mensajes para contexto
            { role: 'user', content: userMessage }
        ];

        return await this.chat(messages, systemPrompt);
    }
}

module.exports = GroqService;
