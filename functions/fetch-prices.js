const { fetchFromOpenAI } = require('./utils/openai');
const logger = require('./utils/logger');

exports.handler = async (event) => {
    logger.log('Evento recibido:', event);

    try {
        if (!event.body) {
            throw new Error('El cuerpo de la solicitud está vacío');
        }

        const { producto } = JSON.parse(event.body);

        if (!producto) {
            throw new Error('El campo "producto" está vacío o no está presente');
        }

        logger.log('Producto recibido:', { producto });

        const prompt = `Estoy buscando información sobre el producto "${producto}". Proporciona una lista de tiendas en línea, precios, costos de envío, URLs de imágenes de productos, y URLs de productos, separados por |.`;

        const resultText = await fetchFromOpenAI(prompt);
        logger.log('Texto de resultado de OpenAI:', resultText);

        if (!resultText || typeof resultText !== 'string') {
            throw new Error('El texto de resultado de OpenAI es inválido');
        }

        const productos = resultText.split('\n').map(line => {
            logger.log('Procesando línea:', line);
            const partes = line.split('|');
            if (partes.length >= 5) {
                return {
                    nombre: partes[0].trim(),
                    precio: partes[1].trim(),
                    envio: partes[2].trim(),
                    tienda: partes[3].trim(),
                    imagenUrl: partes[4].trim(),
                    productoUrl: partes[5] ? partes[5].trim() : ''
                };
            }
            logger.warn('Línea con formato incorrecto:', line);
            return null;
        }).filter(producto => producto !== null);

        logger.log('Productos procesados:', productos);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ productos })
        };
    } catch (error) {
        logger.error('Error en la función Lambda:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
