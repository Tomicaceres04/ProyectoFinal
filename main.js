document.addEventListener('DOMContentLoaded', () => {
    let notasContainer = document.getElementById('notas-container');
    let formularioNota = document.getElementById('formulario-nota');
    let agregarEditarButton = document.getElementById('agregar-editar-button');
    let cancelarEdicionButton = document.getElementById('cancelar-edicion');
    let cambiarModoButton = document.getElementById('boton_modo');
    let obtenerClimaButton = document.getElementById('obtener-clima-button');
    let climaContainer = document.getElementById('clima-container');

    function cambiarModo() {
        let modoActual = document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
        let nuevoModo = (modoActual == 'light-mode') ? 'dark-mode' : 'light-mode';

        document.body.classList.remove(modoActual);
        document.body.classList.add(nuevoModo);
        localStorage.setItem('modo', nuevoModo);
    }

    let preferencia = localStorage.getItem('modo') || 'dark-mode';
    document.body.classList.add(preferencia);

    cambiarModoButton.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarModo();
    });

    let apiKey = '4c8ed6b1f4a6a947e749b37321343b01';
    let apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

    async function obtenerDatosMeteorologicos(ciudad) {
        try {
            const response = await fetch(`${apiUrl}?q=${ciudad}&appid=${apiKey}&units=metric`);
            const data = await response.json();
    
            if (response.ok) {
                const temperatura = data.main.temp;
                const descripcion = data.weather[0].description;
    
                climaContainer.innerHTML = `
                    <div class="clima-info">Clima en ${ciudad}:</div>
                    <div class="clima-temperatura">Temperatura: ${temperatura}°C</div>
                    <div class="clima-descripcion">Descripción: ${descripcion}</div>
                `;
            } else {
                console.error('Error al obtener datos meteorológicos:', data.message);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error.message);
        }
    }
    

    obtenerClimaButton.addEventListener('click', () => {
        const ciudadInput = document.getElementById('ciudad');
        const ciudad = ciudadInput.value;

        if (ciudad.trim() !== '') {
            obtenerDatosMeteorologicos(ciudad);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, ingresa una ciudad válida',
                confirmButtonText: 'OK'
            });
        }
    });

    let notas = JSON.parse(localStorage.getItem('notas')) || [];
    let indiceEdicion = null;

    function renderizarNotas() {
        notasContainer.innerHTML = '';
        notas.forEach((nota, index) => {
            let notaElement = document.createElement('div');
            notaElement.classList.add('nota');
            notaElement.innerHTML = `
                <h3>${nota.titulo}</h3>
                <p>${nota.contenido}</p>
                <button class="editar-button" data-index="${index}">Editar</button>
                <button class="eliminar-button" data-index="${index}">Eliminar</button>
            `;
            notasContainer.appendChild(notaElement);
        });
    }

    function agregarNota() {
        let tituloInput = document.getElementById('titulo');
        let contenidoInput = document.getElementById('contenido');

        let nuevoTitulo = tituloInput.value || "Sin título";
        let nuevoContenido = contenidoInput.value || "Sin contenido";

        if (nuevoTitulo === "Sin título" || nuevoContenido === "Sin contenido") {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Tanto el título como el contenido de la nota no pueden estar vacíos',
                confirmButtonText: 'OK'
            });
            return;
        }

        let nuevaNota = {
            titulo: nuevoTitulo,
            contenido: nuevoContenido
        };

        if (indiceEdicion !== null) {
            notas[indiceEdicion] = nuevaNota;
            indiceEdicion = null;

            Swal.fire({
                icon: 'success',
                title: 'Nota editada correctamente',
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            notas.push(nuevaNota);

            Swal.fire({
                icon: 'success',
                title: 'Nota agregada correctamente',
                showConfirmButton: false,
                timer: 1500
            });
        }

        formularioNota.reset();
        indiceEdicion = null;
        agregarEditarButton.textContent = 'Agregar/Editar Nota';

        localStorage.setItem('notas', JSON.stringify(notas));
        renderizarNotas();
    }

    function editarNota(i) {
        let notaEditada = notas[i];

        Swal.fire({
            title: '¿Quieres editar esta nota?',
            showCancelButton: true,
            confirmButtonColor: 'Green',
            cancelButtonColor: 'Red',
            confirmButtonText: 'Sí, editar',
            cancelButtonText: 'Cancelar',
            html: `Título: ${notaEditada.titulo}<br>Contenido: ${notaEditada.contenido}`,
            preConfirm: () => {
                document.getElementById('titulo').value = notaEditada.titulo;
                document.getElementById('contenido').value = notaEditada.contenido;
                indiceEdicion = i;
                agregarEditarButton.textContent = 'Editar Nota';
            }
        });
    }

    function eliminarNota(i) {
        Swal.fire({
            title: '¿Seguro que quieres eliminar esta nota?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                notas.splice(i, 1);
                localStorage.setItem('notas', JSON.stringify(notas));
                renderizarNotas();

                Swal.fire(
                    'Eliminado',
                    'La nota ha sido eliminada.',
                    'success'
                );
            }
        });
    }

    function cancelarEdicion() {
        formularioNota.reset();
        indiceEdicion = null;
        agregarEditarButton.textContent = 'Agregar/Editar Nota';
    }

    agregarEditarButton.addEventListener('click', (e) => {
        e.preventDefault();
        agregarNota();
    });

    cancelarEdicionButton.addEventListener('click', cancelarEdicion);

    notasContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('editar-button')) {
            editarNota(e.target.dataset.index);
        } else if (e.target.classList.contains('eliminar-button')) {
            eliminarNota(e.target.dataset.index);
        }
    });

    renderizarNotas();
});
