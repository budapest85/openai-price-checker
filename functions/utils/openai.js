const fetch = require('node-fetch');
const logger = require('./logger');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TIMEOUT_MS = 10000; // 10 segundos

if (!OPENAI_API_KEY) {
    throw new Error('La clave API de OpenAI no está configurada');
}

const fetchFromOpenAI = async (prompt) => {
    const data = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'Eres un asistente de compras en línea. Ayudas a los usuarios a encontrar los mejores precios para productos específicos.' },
            { role: 'user', content: prompt }
        ],
        max_tokens: 250
    };

    logger.log('Enviando solicitud a OpenAI:', data);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('Error en la respuesta de OpenAI:', { status: response.status, statusText: response.statusText, body: errorText });
            throw new Error(`Error de OpenAI: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        logger.log('Resultado de OpenAI:', result);

        if (!result.choices || result.choices.length === 0) {
            throw new Error('No se recibieron resultados de OpenAI');
        }

        return result.choices[0].message.content;
    } catch (error) {
        logger.error('Error al comunicarse con OpenAI:', error);
        throw error;
    }
};

module.exports = { fetchFromOpenAI };
