const fetch = require('node-fetch');

exports.handler = async (event) => {
    console.log('Evento recibido:', event);

    try {
        if (!event.body) {
            throw new Error('El cuerpo de la solicitud está vacío');
        }

        const { producto } = JSON.parse(event.body);
        
        if (!producto) {
            throw new Error('El campo "producto" está vacío o no está presente');
        }

        console.log('Producto recibido:', producto);
        const api_key = process.env.OPENAI_API_KEY;  // Usar la variable de entorno
        if (!api_key) {
            throw new Error('La clave API de OpenAI no está configurada');
        }

        const url = 'https://api.openai.com/v1/chat/completions';

        const messages = [
            { role: 'system', content: 'Eres un asistente que ayuda a encontrar los mejores precios para productos.' },
            { role: 'user', content: `Encuentra los mejores precios para: ${producto}. Incluye detalles como el precio, el costo de envío, la tienda online, y la URL de la imagen del producto.` }
        ];

        const data = {
            model: 'gpt-4-turbo',
            messages: messages,
            max_tokens: 150
        };

        console.log('Enviando solicitud a OpenAI:', data);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_key}`
            },
            body: JSON.stringify(data)
        });

        console.log('Respuesta de OpenAI recibida:', response);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error de OpenAI: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Resultado de OpenAI:', result);

        if (!result.choices || result.choices.length === 0) {
            throw new Error('No se recibieron resultados de OpenAI');
        }
        const resultText = result.choices[0].message.content;

        console.log('Texto de resultado de OpenAI:', resultText);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ result: resultText })
        };
    } catch (error) {
        console.error('Error en la función Lambda:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
