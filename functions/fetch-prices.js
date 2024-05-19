const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const { producto } = JSON.parse(event.body);
        const api_key = process.env.OPENAI_API_KEY;
        const url = 'https://api.openai.com/v1/completions';

        const prompt = `Encuentra los mejores precios para: ${producto}. Incluye detalles como el precio, el costo de envío, la tienda online, y la URL de la imagen del producto.`;

        const data = {
            model: 'text-davinci-003',
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
            throw new Error(`Error en la solicitud a OpenAI: ${response.statusText}`);
        }

        const result = await response.json();
        const resultText = result.choices[0].text;

        const productos = resultText.split('\n').map(line => {
            const [nombre, precio, envio, tienda, imagenUrl] = line.split('|').map(part => part.trim());
            return { nombre, precio, envio, tienda, imagenUrl, productoUrl: '#' };
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ productos })
        };
    } catch (error) {
        console.error('Error en la función:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
