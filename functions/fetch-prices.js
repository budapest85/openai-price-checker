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

        const prompt = `Estoy buscando información sobre el producto "${producto}". 
                        Proporciona una lista de productos de Amazon, incluyendo el nombre del producto, 
                        precio, costo de envío, tienda, URL de la imagen del producto y URL del producto, 
                        separados por "|". Cada producto debe estar en una nueva línea. 
                        El formato debe ser: Nombre del producto | Precio | Costo de envío | Tienda | URL de la imagen | URL del producto.`;

        const resultText = await fetchFromOpenAI(prompt);
        logger.log('Texto de resultado de OpenAI:', resultText);

        if (!resultText || typeof resultText !== 'string') {
            throw new Error('El texto de resultado de OpenAI es inválido');
        }

        const lineas = resultText.split('\n');
        logger.log('Líneas de productos obtenidas:', lineas);

        const productos = lineas.map(line => {
            logger.log('Procesando línea:', line);
            const partes = line.split('|');
            if (partes.length >= 6) {
                let imagenUrl = partes[4].trim();
                logger.log('URL de imagen inicial:', imagenUrl);

                // Validar que la URL de la imagen sea una URL válida
                if (!/^https?:\/\/.*\.(jpg|jpeg|png|gif)$/.test(imagenUrl)) {
                    logger.warn('URL de imagen inválida:', imagenUrl);
                    imagenUrl = ''; // URL inválida, establecer como cadena vacía
                }

                return {
                    nombre: partes[0].trim(),
                    precio: partes[1].trim(),
                    envio: partes[2].trim(),
                    tienda: partes[3].trim(),
                    imagenUrl: imagenUrl,
                    productoUrl: partes[5].trim()
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
