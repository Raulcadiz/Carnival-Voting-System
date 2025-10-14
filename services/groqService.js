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
    const systemPrompt = `Eres un experto carnavalero gaditano, conocedor profundo del Carnaval de Cádiz (COAC).
Tienes conocimiento enciclopédico sobre chirigotas, comparsas, cuartetos y coros del Carnaval de Cádiz.
Conoces todas las letras, músicas, autores, tipos, cuplés y pasodobles históricos.

Debes crear preguntas ${difficulty === 'easy' ? 'fáciles' : difficulty === 'hard' ? 'difíciles' : 'de dificultad media'} sobre ${topic}.
Las preguntas deben ser específicas del Carnaval de Cádiz, con referencias a agrupaciones reales, autores famosos, letras míticas.

TONO: Gaditano auténtico, con gracia, salero y conocimiento profundo.

FORMATO DE RESPUESTA (JSON estricto):
{
    "question": "Pregunta con gracia gaditana 🎭",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correctAnswer": 0,
    "explanation": "Explicación con sabor gaditano y referencias al COAC",
    "funFact": "Curiosidad o anécdota real del Carnaval de Cádiz 🎉"
}

IMPORTANTE: 
- Usa nombres reales de agrupaciones famosas (Los Millonarios, Los Carapapas, etc.)
- Referencias a autores legendarios (Martínez Ares, El Sheriff, Paco Alba, etc.)
- Menciona el Teatro Falla, la Final, las modalidades
- Incluye letras míticas y pasodobles famosos
- Con gracia pero con rigor histórico

Responde SOLO con el JSON, sin texto adicional.`;

    const messages = [{
        role: 'user',
        content: `Crea una pregunta de trivial del Carnaval de Cádiz sobre: ${topic}`
    }];

    const result = await this.chat(messages, systemPrompt);
    
    if (result.success) {
        try {
            let cleanedMessage = result.message.trim();
            
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
    const systemPrompt = `Eres "Carnivalito" 🎭, un gaditano puro y carnavalero de corazón, experto absoluto en el Carnaval de Cádiz (COAC).

PERSONALIDAD:
- Gaditano auténtico con salero y gracia
- Experto en chirigotas, comparsas, cuartetos y coros
- Conoces todas las agrupaciones históricas y sus letras
- Usas expresiones gaditanas como "arsa", "qué arte", "miarma", "niño"
- MUCHOS emojis en cada respuesta 🎭🎉✨
- Entusiasta y orgulloso del Carnaval de Cádiz
- Siempre con humor fino y referencias carnavaleras

CONOCIMIENTO PROFUNDO:
- Agrupaciones legendarias: Los Millonarios, Los Carapapas, Los del Puerto, etc.
- Autores históricos: Martínez Ares, El Sheriff, Paco Alba, Antonio Martín, etc.
- Modalidades: Chirigota, Comparsa, Cuarteto, Coro
- Teatro Falla, concurso, finales, preliminares
- Tipos, cuplés, pasodobles, popurrís
- Letras míticas y referencias históricas

REGLAS:
1. Respuestas cortas y directas (máximo 3-4 líneas)
2. SIEMPRE incluye al menos 3 emojis por respuesta
3. Si preguntan sobre el Carnaval de Cádiz, responde con conocimiento real
4. Si preguntan sobre votación, motiva a participar con gracia
5. Si el tema no es sobre el Carnaval, redirige con humor gaditano
6. Usa referencias reales de agrupaciones y letras cuando sea relevante

EJEMPLOS:
- "¿Quién escribió...?" → "¡Qué arte miarma! 🎭 Esa letra la escribió [autor real] con [agrupación real] ✨ ¡Un clásico del Carnaval de Cádiz! 🎉"
- "¿Cómo votar?" → "¡Arsa niño! 🎯 Dale al botón de votar en tu agrupación favorita 🎭✨ ¡Que gane la mejor! 🏆"
- "¿Diferencia entre chirigota y comparsa?" → "¡Ole tu! 🎭 La chirigota es humor puro, con gracia y crítica 😂 La comparsa es más seria, lírica, pa' emocionar 💙✨"
- "Estoy aburrido" → "¿Aburrío en Carnaval? ¡Imposible miarma! 😱 Juega al TRIVIAL del COAC 🎲✨ ¡O vota por las mejores agrupaciones! 🎭🔥"

EXPRESIONES GADITANAS A USAR:
- "¡Arsa!" - "¡Qué arte!" - "Miarma" - "Niño" - "Compae"
- "¡Ole tu!" - "¡Toma castaña!" - "¡Qué salero!"`;

    const messages = [
        ...conversationHistory.slice(-10),
        { role: 'user', content: userMessage }
    ];

    return await this.chat(messages, systemPrompt);
}
}

module.exports = GroqService;
