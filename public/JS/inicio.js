document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const formularioBusqueda = document.getElementById('formularioBusqueda');
    const contenedorResultados = document.getElementById('resultadosBusqueda');
    const contenedorReproductor = document.getElementById('contenedorReproductor');
    const reproductorAudio = document.getElementById('reproductorAudio');
    
    // Elementos del reproductor
    const imagenCancion = document.getElementById('imagenCancion');
    const nombreArtista = document.getElementById('nombreArtista');
    const nombreAlbum = document.getElementById('nombreAlbum');
    const nombreCancion = document.getElementById('nombreCancion');
    const botonReproducir = document.getElementById('botonReproducir');
    const barraProgreso = document.getElementById('barraProgreso');
    const tiempoActual = document.getElementById('tiempoActual');
    const tiempoTotal = document.getElementById('tiempoTotal');
    const botonCerrar = document.getElementById('cerrarReproductor');

    // Variables de estado
    let cancionActual = null;
    let listaCanciones = [];
    let indiceCancionActual = 0;

    // Verificar que los elementos existen
    if (!formularioBusqueda || !contenedorResultados) {
        console.error('Elementos del formulario o contenedor de resultados no encontrados.');
        return;
    }

    // Evento de búsqueda
    formularioBusqueda.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        await buscarCanciones();
    });

    // Función para buscar canciones
    async function buscarCanciones() {
        const entradaArtista = document.getElementById('entradaArtista');
        const artista = entradaArtista.value.trim();
        
        if (!artista) {
            mostrarMensaje('Por favor, ingresa el nombre de un artista.', 'error');
            return;
        }

        contenedorResultados.innerHTML = '<div class="cargando">🎵 Buscando música...</div>';

        try {
            const respuesta = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artista)}&entity=song&limit=20`);
            
            if (!respuesta.ok) {
                throw new Error(`Error en la solicitud: ${respuesta.status} ${respuesta.statusText}`);
            }

            const datos = await respuesta.json();
            listaCanciones = datos.results || [];
            mostrarResultados(listaCanciones);

        } catch (error) {
            console.error('Error al buscar canciones:', error);
            contenedorResultados.innerHTML = '<div class="error">❌ Error al buscar canciones. Intenta nuevamente.</div>';
        }
    }

    // Función para mostrar resultados
    function mostrarResultados(canciones) {
        contenedorResultados.innerHTML = '';

        if (canciones.length === 0) {
            contenedorResultados.innerHTML = '<div class="sin-resultados">🎵 No se encontraron canciones.</div>';
            return;
        }

        canciones.forEach((cancion, indice) => {
            const elementoCancion = document.createElement('div');
            elementoCancion.className = 'elemento-cancion';
            elementoCancion.innerHTML = `
                <img src="${cancion.artworkUrl100 || '/placeholder.svg?height=80&width=80'}" 
                     alt="Portada" class="imagen-miniatura">
                <div class="detalles-cancion-lista">
                    <h3>${cancion.trackName || 'Título desconocido'}</h3>
                    <p>${cancion.artistName || 'Artista desconocido'} • ${cancion.collectionName || 'Álbum desconocido'}</p>
                </div>
                <div class="duracion-cancion">
                    ${formatearTiempo(cancion.trackTimeMillis)}
                </div>
            `;

            // Agregar evento de clic
            elementoCancion.addEventListener('click', () => {
                indiceCancionActual = indice;
                reproducirCancion(cancion);
            });

            contenedorResultados.appendChild(elementoCancion);
        });
    }

    // Función para reproducir canción
    function reproducirCancion(cancion) {
        if (!cancion.previewUrl) {
            mostrarMensaje('Esta canción no tiene vista previa disponible.', 'error');
            return;
        }

        cancionActual = cancion;
        
        // Actualizar información del reproductor
        imagenCancion.src = cancion.artworkUrl100 || '/placeholder.svg?height=200&width=200';
        nombreArtista.textContent = cancion.artistName || 'Artista desconocido';
        nombreAlbum.textContent = cancion.collectionName || 'Álbum desconocido';
        nombreCancion.textContent = cancion.trackName || 'Título desconocido';
        
        // Configurar audio
        reproductorAudio.src = cancion.previewUrl;
        
        // Mostrar reproductor
        contenedorReproductor.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Reproducir automáticamente
        reproducirAudio();
    }

    // Función para reproducir/pausar audio
    function reproducirAudio() {
        if (reproductorAudio.paused) {
            reproductorAudio.play();
            actualizarIconoReproducir(false);
        } else {
            reproductorAudio.pause();
            actualizarIconoReproducir(true);
        }
    }

    // Función para actualizar icono de reproducir
    function actualizarIconoReproducir(pausado) {
        const icono = botonReproducir.querySelector('i');
        if (pausado) {
            icono.className = 'fas fa-play';
        } else {
            icono.className = 'fas fa-pause';
        }
    }

    // Función para formatear tiempo
    function formatearTiempo(milisegundos) {
        if (!milisegundos) return '0:00';
        const segundos = Math.floor(milisegundos / 1000);
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
    }

    // Función para formatear tiempo en segundos
    function formatearTiempoSegundos(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = Math.floor(segundos % 60);
        return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
    }

    // Eventos del reproductor
    if (botonReproducir) {
        botonReproducir.addEventListener('click', reproducirAudio);
    }

    if (botonCerrar) {
        botonCerrar.addEventListener('click', cerrarReproductor);
    }

    if (reproductorAudio) {
        // Evento cuando se cargan los metadatos
        reproductorAudio.addEventListener('loadedmetadata', () => {
            barraProgreso.max = reproductorAudio.duration;
            tiempoTotal.textContent = formatearTiempoSegundos(reproductorAudio.duration);
        });

        // Evento de actualización de tiempo
        reproductorAudio.addEventListener('timeupdate', () => {
            barraProgreso.value = reproductorAudio.currentTime;
            tiempoActual.textContent = formatearTiempoSegundos(reproductorAudio.currentTime);
        });

        // Evento cuando termina la canción
        reproductorAudio.addEventListener('ended', () => {
            actualizarIconoReproducir(true);
            siguienteCancion();
        });
    }

    if (barraProgreso) {
        // Evento para cambiar posición de reproducción
        barraProgreso.addEventListener('input', () => {
            reproductorAudio.currentTime = barraProgreso.value;
        });
    }

    // Función para cerrar reproductor
    function cerrarReproductor() {
        contenedorReproductor.style.display = 'none';
        document.body.style.overflow = '';
        reproductorAudio.pause();
        reproductorAudio.currentTime = 0;
        actualizarIconoReproducir(true);
    }

    // Función para siguiente canción
    function siguienteCancion() {
        if (listaCanciones.length > 0) {
            indiceCancionActual = (indiceCancionActual + 1) % listaCanciones.length;
            reproducirCancion(listaCanciones[indiceCancionActual]);
        }
    }

    // Función para canción anterior
    function cancionAnterior() {
        if (listaCanciones.length > 0) {
            indiceCancionActual = indiceCancionActual === 0 ? listaCanciones.length - 1 : indiceCancionActual - 1;
            reproducirCancion(listaCanciones[indiceCancionActual]);
        }
    }

    // Eventos de controles adicionales
    const botonSiguiente = document.getElementById('botonSiguiente');
    const botonAnterior = document.getElementById('botonAnterior');

    if (botonSiguiente) {
        botonSiguiente.addEventListener('click', siguienteCancion);
    }

    if (botonAnterior) {
        botonAnterior.addEventListener('click', cancionAnterior);
    }

    // Función para mostrar mensajes
    function mostrarMensaje(mensaje, tipo) {
        const elementoMensaje = document.createElement('div');
        elementoMensaje.className = `mensaje-notificacion ${tipo}`;
        elementoMensaje.textContent = mensaje;
        
        elementoMensaje.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            animation: deslizarEntrada 0.3s ease;
            ${tipo === 'exito' ? 'background: #4CAF50;' : 'background: #f44336;'}
        `;
        
        document.body.appendChild(elementoMensaje);
        
        setTimeout(() => {
            elementoMensaje.style.animation = 'deslizarSalida 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(elementoMensaje)) {
                    document.body.removeChild(elementoMensaje);
                }
            }, 300);
        }, 3000);
    }

    // Cerrar reproductor con tecla Escape
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && contenedorReproductor.style.display === 'flex') {
            cerrarReproductor();
        }
    });
});











































// document.addEventListener('DOMContentLoaded', () => {
//     const searchForm = document.getElementById('searchForm');
//     const resultsContainer = document.getElementById('results');

//     if (!searchForm || !resultsContainer) {
//         console.error('Formulario o contenedor de resultados no encontrados en el DOM.');
//         return;
//     }

//     searchForm.addEventListener('submit', async (e) => {
//         e.preventDefault();

//         const artist = document.getElementById('artistInput').value;
//         if (!artist) {
//             resultsContainer.innerHTML = 'Por favor, ingresa el nombre de un artista.';
//             return;
//         }

//         resultsContainer.innerHTML = 'Buscando...';

//         try {
//             // Usamos la API de iTunes, que no requiere token
//             const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=song&limit=10`);
//             if (!response.ok) {
//                 throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
//             }

//             const data = await response.json();
//             resultsContainer.innerHTML = '';

//             if (data.results && data.results.length > 0) {
//                 data.results.forEach((track) => {
//                     const trackElement = document.createElement('div');
//                     trackElement.className = 'track-item';
//                     trackElement.innerHTML = `
//                         <p><strong>${track.trackName}</strong> - ${track.artistName}</p>
//                         <img src="${track.artworkUrl100}" alt="Artwork" class="track-artwork">
//                         <audio controls style="display:none;">
//                             <source src="${track.previewUrl}" type="audio/mpeg">
//                             Tu navegador no soporta el elemento de audio.
//                         </audio>
//                     `;
//                     trackElement.dataset.trackName = track.trackName;
//                     trackElement.dataset.artistName = track.artistName;
//                     trackElement.dataset.albumName = track.collectionName;
//                     trackElement.dataset.artworkUrl = track.artworkUrl100;
//                     trackElement.dataset.previewUrl = track.previewUrl;

//                     resultsContainer.appendChild(trackElement);
//                 });

//                 document.querySelectorAll('.track-item').forEach(item => {
//                     item.addEventListener('click', function() {
//                         const trackName = this.dataset.trackName;
//                         const artistName = this.dataset.artistName;
//                         const albumName = this.dataset.albumName;
//                         const artworkUrl = this.dataset.artworkUrl;
//                         const previewUrl = this.dataset.previewUrl;

//                         document.getElementById('playerTrackName').textContent = trackName;
//                         document.getElementById('playerArtistName').textContent = artistName;
//                         document.getElementById('playerAlbumName').textContent = albumName;
//                         document.getElementById('playerArtwork').src = artworkUrl;
//                         document.getElementById('audioPlayer').src = previewUrl;

                       
//                         const playerCardContainer = document.getElementById('playerCardContainer');
//                         playerCardContainer.style.display = 'flex'; 
//                         document.body.style.overflow = 'hidden'; 

                       
//                         const audioPlayer = document.getElementById('audioPlayer');
//                         const playPauseIcon = document.querySelector('.play-button-circle i');

//                         audioPlayer.play();
//                         playPauseIcon.classList.remove('fa-play');
//                         playPauseIcon.classList.add('fa-pause');

//                         audioPlayer.addEventListener('loadedmetadata', () => {
//                             document.getElementById('progressBar').max = audioPlayer.duration;
//                         });
//                     });
//                 });

//                 document.getElementById('audioPlayer').addEventListener('timeupdate', () => {
//                     const audioPlayer = document.getElementById('audioPlayer');
//                     const progressBar = document.getElementById('progressBar');
//                     progressBar.value = audioPlayer.currentTime;
//                 });

//                 document.getElementById('progressBar').addEventListener('input', () => {
//                     const audioPlayer = document.getElementById('audioPlayer');
//                     const progressBar = document.getElementById('progressBar');
//                     audioPlayer.currentTime = progressBar.value;
//                 });

//                 document.querySelector('.play-button-circle').addEventListener('click', () => {
//                     const audioPlayer = document.getElementById('audioPlayer');
//                     const playPauseIcon = document.querySelector('.play-button-circle i');

//                     if (audioPlayer.paused) {
//                         audioPlayer.play();
//                         playPauseIcon.classList.remove('fa-play');
//                         playPauseIcon.classList.add('fa-pause');
//                     } else {
//                         audioPlayer.pause();
//                         playPauseIcon.classList.remove('fa-pause');
//                         playPauseIcon.classList.add('fa-play');
//                     }
//                 });

//                 document.getElementById('closePlayerCard').addEventListener('click', () => {
//                     const playerCardContainer = document.getElementById('playerCardContainer');
//                     const audioPlayer = document.getElementById('audioPlayer');

//                     playerCardContainer.style.display = 'none'; 
//                     document.body.style.overflow = ''; 
//                     audioPlayer.pause(); 
//                     audioPlayer.currentTime = 0; 
//                 });

//             } else {
//                 resultsContainer.innerHTML = 'No se encontraron canciones.';
//             }
//         } catch (error) {
//             console.error('Error al buscar canciones:', error);
//             resultsContainer.innerHTML = 'Error al buscar canciones.';
//         }
//     });
// });
