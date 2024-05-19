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
            { role: 'system', content: 'Eres un asistente de compras en línea. Ayudas a los usuarios a encontrar los mejores precios para productos específicos.' },
            { role: 'user', content: `Estoy buscando información sobre el producto "${producto}". Por favor, proporciona una lista de tiendas en línea, precios, costos de envío y URLs de imágenes de productos.` }
        ];

        const data = {
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 250  // Incrementar el número de tokens para permitir respuestas más detalladas
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
            console.error('Error en la respuesta de OpenAI:', errorText);
            throw new Error(`Error de OpenAI: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Resultado de OpenAI:', result);

        if (!result.choices || result.choices.length === 0) {
            throw new Error('No se recibieron resultados de OpenAI');
        }
        const re
