<!DOCTYPE html>
<html>
<head>
    <title>Buscar Productos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .container {
            width: 50%;
            margin: 0 auto;
            text-align: center;
            padding-top: 50px;
        }
        .search-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }
        input[type="text"] {
            width: 80%;
            padding: 10px;
            margin: 10px 0;
        }
        input[type="submit"] {
            padding: 10px 20px;
        }
        .producto {
            border: 1px solid #ddd;
            padding: 10px;
            margin: 10px 0;
        }
        .producto img {
            max-width: 100px;
            display: block;
            margin: 0 auto 10px;
        }
        .error {
            color: red;
        }
        .loading {
            text-align: center;
            margin: 20px 0;
        }
        .logo {
            max-width: 100px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Buscar Productos</h1>
        <div class="search-container">
            <img src="dog-logo.webp" alt="Logo" class="logo">
            <form id="searchForm">
                <input type="text" id="producto" name="producto" placeholder="Introduce el nombre del producto" required>
                <input type="submit" value="Buscar">
            </form>
        </div>
        <div id="loading" class="loading" style="display: none;">Cargando...</div>
        <div id="resultados"></div>
    </div>

    <script>
        document.getElementById('searchForm').addEventListener('submit', function(event) {
            event.preventDefault();
            var producto = document.getElementById('producto').value;

            if (!producto.trim()) {
                alert('Por favor, introduce un nombre de producto válido.');
                return;
            }

            document.getElementById('loading').style.display = 'block';
            console.log('Enviando solicitud con producto:', producto);

            fetch('/.netlify/functions/fetch-prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ producto: producto })
            })
            .then(response => {
                console.log('Respuesta recibida:', response);
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos:', data);
                document.getElementById('loading').style.display = 'none';
                var resultados = document.getElementById('resultados');
                resultados.innerHTML = '';

                if (!data.productos || data.productos.length === 0) {
                    resultados.innerHTML = '<p>No se encontraron productos.</p>';
                    return;
                }

                data.productos.forEach(function(producto) {
                    var imagenUrl = producto.imagenUrl;
                    if (!imagenUrl || imagenUrl.trim() === "") {
                        imagenUrl = "https://via.placeholder.com/100"; // URL de imagen alternativa
                    }

                    var productoDiv = document.createElement('div');
                    productoDiv.className = 'producto';
                    productoDiv.innerHTML = `
                        <h3><a href="${producto.productoUrl}" target="_blank">${producto.nombre}</a></h3>
                        <img src="${imagenUrl}" alt="${producto.nombre}">
                        <p>Precio: ${producto.precio}</p>
                        <p>Envío: ${producto.envio}</p>
                        <p>Tienda: ${producto.tienda}</p>
                    `;
                    resultados.appendChild(productoDiv);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('loading').style.display = 'none';
                var resultados = document.getElementById('resultados');
                resultados.innerHTML = '<p class="error">Ocurrió un error al buscar los productos.</p>';
            });
        });
    </script>
</body>
</html>
