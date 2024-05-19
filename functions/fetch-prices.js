const fetch = require('node-fetch');

exports.handler = async (event) => {
    console.log('Evento recibido:', event);

    try {
        const { producto } = JSON.parse(event.body || '{}');
        if (!producto) {
            throw new Error('El campo "producto" está vacío');
        }

        console.log('Producto recibido:', producto);
        const api_key = process.env.OPENAI_API_KEY;  // Usar la variable de entorno
        const url = 'https://api.openai.com/v1/engines/davinci-codex/completions';

        const prompt = `Encuentra los mejores precios para: ${producto}. Incluye detalles como el precio, el costo de envío, la tienda online, y la URL de la imagen del producto.`;

        const data = {
            prompt: prompt,
            max_tokens: 150
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_key}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Error de OpenAI: ${response.statusText}`);
        }

        const result = await response.json();
        const resultText = result.choices[0].text;

        console.log('Resultado de OpenAI:', resultText);

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
