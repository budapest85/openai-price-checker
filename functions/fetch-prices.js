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

        const resultText = result.choices[0].message.content;
        console.log('Texto de resultado de OpenAI:', resultText);

        // Verificar que el texto de resultado no esté vacío ni undefined
        if (!resultText || typeof resultText !== 'string') {
            throw new Error('El texto de resultado de OpenAI es inválido');
        }

        // Extraer la información de la respuesta generada
        const productos = resultText.split('\n').map(line => {
            const partes = line.split('|');
            if (partes.length >= 4) { // Asegurarse de que haya al menos 4 partes
                return {
                    nombre: partes[0].trim(),
                    precio: partes[1].trim(),
                    envio: partes[2].trim(),
                    tienda: partes[3].trim(),
                    imagenUrl: partes[4] ? partes[4].trim() : ''  // Asumimos que la URL de la imagen puede estar en la cuarta posición
                };
            }
            return null;
        }).filter(producto => producto !== null);

        console.log('Productos procesados:', productos);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ productos })
        };
    } catch (error) {
        console.error('Error en la función Lambda:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
