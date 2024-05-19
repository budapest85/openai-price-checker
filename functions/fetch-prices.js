const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { producto } = JSON.parse(event.body);
    const api_key = 'process.env.OPENAI_API_KEY';  // Reemplaza con tu clave de API de OpenAI
    const url = 'https://api.openai.com/v1/engines/davinci-codex/completions';

    const prompt = `Encuentra los mejores precios para: ${producto}. Incluye detalles como el precio, el costo de envío, la tienda online, y la URL de la imagen del producto.`;

    const data = {
        prompt: prompt,
        max_tokens: 150
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_key}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        const resultText = result.choices[0].text;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ result: resultText })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
