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
        const api_k
