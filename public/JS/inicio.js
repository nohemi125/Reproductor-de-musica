// Detectar si estamos en desarrollo o producción
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseURL = isDevelopment ? 'http://localhost:2000' : window.location.origin;

document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM - Sidebar
  const sidebar = document.getElementById("sidebar")
  const sidebarOverlay = document.getElementById("sidebarOverlay")
  const menuHamburguesa = document.getElementById("menuHamburguesa")
  const sidebarToggle = document.getElementById("sidebarToggle")

  // Elementos del DOM - Navegación
  const btnInicio = document.getElementById("btnInicio")
  const btnFavoritos = document.getElementById("btnFavoritos")
  const btnListas = document.getElementById("btnListas")
  const btnHistorial = document.getElementById("btnHistorial")
  const btnCerrarSesion = document.getElementById("btnCerrarSesion")

  // Elementos del DOM - Vistas
  const vistaInicio = document.getElementById("vistaInicio")
  const vistaFavoritos = document.getElementById("vistaFavoritos")
  const vistaListas = document.getElementById("vistaListas")
  const vistaHistorial = document.getElementById("vistaHistorial")

  // Elementos del DOM - Búsqueda
  const formularioBusqueda = document.getElementById("formularioBusqueda")
  const resultadosBusqueda = document.getElementById("resultadosBusqueda")

  // Elementos del DOM - Listas
  const btnCrearListaNueva = document.getElementById("btnCrearListaNueva")
  const crearListaForm = document.getElementById("crearListaForm")
  const btnGuardarLista = document.getElementById("btnGuardarLista")
  const btnCancelarLista = document.getElementById("btnCancelarLista")
  const nombreNuevaLista = document.getElementById("nombreNuevaLista")

  // Elementos del DOM - Contenedores
  const contenedorFavoritos = document.getElementById("contenedorFavoritos")
  const contenedorListas = document.getElementById("contenedorListas")
  const contenedorHistorial = document.getElementById("contenedorHistorial")
  const listasRapidas = document.getElementById("listasRapidas")

  // Elementos del DOM - Contadores
  const contadorFavoritos = document.getElementById("contadorFavoritos")
  const contadorListas = document.getElementById("contadorListas")

  // Elementos del DOM - Reproductor
  const contenedorReproductor = document.getElementById("contenedorReproductor")
  let reproductorAudio = document.getElementById("reproductorAudio")
  const visualizadorOnda = document.getElementById("visualizadorOnda")
  const imagenCancion = document.getElementById("imagenCancion")
  const nombreArtista = document.getElementById("nombreArtista")
  const nombreAlbum = document.getElementById("nombreAlbum")
  const nombreCancion = document.getElementById("nombreCancion")
  const botonReproducir = document.getElementById("botonReproducir")
  const botonFavorito = document.getElementById("botonFavorito")
  const barraProgreso = document.getElementById("barraProgreso")
  const tiempoActual = document.getElementById("tiempoActual")
  const tiempoTotal = document.getElementById("tiempoTotal")
  const botonCerrar = document.getElementById("cerrarReproductor")
  const botonSiguiente = document.getElementById("botonSiguiente")
  const botonAnterior = document.getElementById("botonAnterior")
  const botonAleatorio = document.getElementById("botonAleatorio")

  // Variables de estado
  let cancionActual = null
  let listaCanciones = []
  let indiceCancionActual = 0
  let vistaActual = "inicio"
  let cancionesFavoritas = []
  let listasUsuario = []
  let historialReproduccion = []

  // Variables del visualizador
  let audioContext = null
  let audioSource = null
  let audioAnalyser = null
  let animationFrameId = null

  // Variables del modal de listas
  let cancionParaAgregar = null
  const modalListas = document.getElementById("modalListas")
  const modalBody = document.getElementById("modalBody")

  // Inicialización
async function inicializarApp() {
  try {
    await mostrarNombreUsuario(); 
    await cargarDatosUsuario();
    configurarEventos();
    actualizarContadores();
    actualizarListasRapidas();
    mostrarVista("inicio");
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    mostrarMensaje('Error al inicializar la aplicación', 'error');
  }
}

// Nueva función para mostrar el nombre del usuario logueado
async function mostrarNombreUsuario() {
  try {
    const response = await fetch('/api/auth/usuario', { credentials: 'include' });
    const data = await response.json();
    if (data.usuario && data.usuario.nombre) {
      const nombreUsuario = document.getElementById('nombreUsuario');
      if (nombreUsuario) {
        nombreUsuario.textContent = data.usuario.nombre;
      }


    }
  } catch (error) {
    console.error('No se pudo obtener el usuario:', error);
  }
}





  async function cargarDatosUsuario() {
    try {
      // Cargar favoritos
      const responseFavoritos = await fetch(`${baseURL}/api/favoritos`)
      const dataFavoritos = await responseFavoritos.json()
      cancionesFavoritas = dataFavoritos.favoritos || []

      // Cargar listas
      const responseListas = await fetch(`${baseURL}/api/listas`)
      const dataListas = await responseListas.json()
      listasUsuario = dataListas.listas || []

      // Cargar historial
      const responseHistorial = await fetch(`${baseURL}/api/historial`)
      const dataHistorial = await responseHistorial.json()
      historialReproduccion = dataHistorial.historial || []

      // Actualizar contadores después de cargar los datos
      actualizarContadores()
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error)
      mostrarMensaje('Error al cargar datos del usuario', 'error')
    }
  }

  function configurarEventos() {
    // Eventos del sidebar
    menuHamburguesa?.addEventListener("click", toggleSidebar)
    sidebarToggle?.addEventListener("click", toggleSidebar)
    sidebarOverlay?.addEventListener("click", cerrarSidebar)

    // Eventos de navegación
    btnInicio?.addEventListener("click", () => mostrarVista("inicio"))
    btnFavoritos?.addEventListener("click", () => mostrarVista("favoritos"))
    btnListas?.addEventListener("click", () => mostrarVista("listas"))
    btnHistorial?.addEventListener("click", () => mostrarVista("historial"))
    btnCerrarSesion?.addEventListener("click", cerrarSesion)

    // Eventos de búsqueda
    formularioBusqueda?.addEventListener("submit", buscarCanciones)

    // Eventos de listas
    btnCrearListaNueva?.addEventListener("click", mostrarFormularioLista)
    btnGuardarLista?.addEventListener("click", crearNuevaLista)
    btnCancelarLista?.addEventListener("click", ocultarFormularioLista)

    // Eventos del reproductor
    botonReproducir?.addEventListener("click", toggleReproduccion)
    botonCerrar?.addEventListener("click", cerrarReproductor)
    botonFavorito?.addEventListener("click", () => {
      if (cancionActual) toggleFavorito(cancionActual)
    })
    botonSiguiente?.addEventListener("click", siguienteCancion)
    botonAnterior?.addEventListener("click", cancionAnterior)

    // Eventos del audio
    if (reproductorAudio) {
      reproductorAudio.addEventListener("loadedmetadata", () => {
        barraProgreso.max = reproductorAudio.duration
        tiempoTotal.textContent = formatearTiempoSegundos(reproductorAudio.duration)
      })

      reproductorAudio.addEventListener("timeupdate", () => {
        barraProgreso.value = reproductorAudio.currentTime
        tiempoActual.textContent = formatearTiempoSegundos(reproductorAudio.currentTime)
      })

      reproductorAudio.addEventListener("ended", () => {
        actualizarIconoReproducir(true)
        siguienteCancion()
      })
    }

    if (barraProgreso) {
      barraProgreso.addEventListener("input", () => {
        reproductorAudio.currentTime = barraProgreso.value
      })
    }

    // Eventos de teclado
    document.addEventListener("keydown", manejarTeclado)
  }

  // Funciones del sidebar
  function toggleSidebar() {
    sidebar?.classList.toggle("active")
    sidebarOverlay?.classList.toggle("active")
  }

  function cerrarSidebar() {
    sidebar?.classList.remove("active")
    sidebarOverlay?.classList.remove("active")
  }

  // Funciones de navegación
  function mostrarVista(vista) {
    // Ocultar todas las vistas
    document.querySelectorAll(".vista-seccion").forEach((seccion) => {
      seccion.classList.remove("active")
    })

    // Remover clase active de todos los nav-links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active")
    })

    // Mostrar vista seleccionada
    const vistaElement = document.getElementById(`vista${vista.charAt(0).toUpperCase() + vista.slice(1)}`)
    const navElement = document.getElementById(`btn${vista.charAt(0).toUpperCase() + vista.slice(1)}`)

    if (vistaElement) {
      vistaElement.classList.add("active")
      vistaActual = vista
    }

    if (navElement) {
      navElement.classList.add("active")
    }

    // Cargar contenido específico de la vista
    switch (vista) {
      case "favoritos":
        cargarFavoritos()
        break
      case "listas":
        cargarListas()
        break
      case "historial":
        cargarHistorial()
        break
    }

    // Cerrar sidebar en móvil
    if (window.innerWidth <= 768) {
      cerrarSidebar()
    }
  }

  // Funciones de búsqueda
  async function buscarCanciones(evento) {
    evento.preventDefault();
    
    const terminoBusqueda = document.getElementById('entradaArtista').value.trim();
    const resultadosContainer = document.getElementById('resultadosBusqueda');
    
    if (!terminoBusqueda) {
        resultadosContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Por favor, ingresa un término de búsqueda</p>
            </div>
        `;
        return;
    }

    // Mostrar estado de carga
    resultadosContainer.innerHTML = `
        <div class="cargando">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Buscando canciones...</p>
        </div>
    `;

    try {
        console.log('Enviando búsqueda:', terminoBusqueda);
        const response = await fetch(`${baseURL}/api/buscar?q=${encodeURIComponent(terminoBusqueda)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        console.log('Respuesta del servidor:', response.status);
        const data = await response.json();
        console.log('Datos recibidos:', data);

        if (response.ok) {
            if (data.canciones && data.canciones.length > 0) {
                mostrarResultadosBusqueda(data.canciones);
            } else {
                resultadosContainer.innerHTML = `
                    <div class="no-resultados">
                        <i class="fas fa-search"></i>
                        <p>No se encontraron resultados para "${terminoBusqueda}"</p>
                    </div>
                `;
            }
        } else {
            throw new Error(data.error || 'Error al buscar canciones');
        }
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        resultadosContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error al buscar canciones. Por favor, intenta nuevamente.</p>
            </div>
        `;
    }
  }

  function formatearDuracion(milisegundos) {
    const minutos = Math.floor(milisegundos / 60000);
    const segundos = Math.floor((milisegundos % 60000) / 1000);
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }

  // Funciones de favoritos
  async function cargarFavoritos() {
    const contenedorFavoritos = document.getElementById("contenedorFavoritos")
    contenedorFavoritos.innerHTML = ""

    if (cancionesFavoritas.length === 0) {
      contenedorFavoritos.innerHTML = `
        <div class="sin-resultados">
          <i class="far fa-heart"></i>
          <p>No tienes canciones favoritas</p>
        </div>
      `
      return
    }

    cancionesFavoritas.forEach((cancion, indice) => {
      const elementoCancion = crearElementoCancion(cancion, indice, true)
      contenedorFavoritos.appendChild(elementoCancion)
    })
  }

  function actualizarContadorFavoritos() {
    if (contadorFavoritos) {
      contadorFavoritos.textContent = cancionesFavoritas.length
    }
  }

  async function toggleFavorito(cancion) {
    try {
      if (!cancion || !cancion._id) {
        throw new Error("ID de canción no válido")
      }

      const esFavorita = cancionesFavoritas.some((fav) => fav._id === cancion._id)
      const response = await fetch(`/api/favoritos/${cancion._id}`, {
        method: esFavorita ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.mensaje || "Error al actualizar favoritos")
      }

      // Actualizar la lista local de favoritos
      if (esFavorita) {
        cancionesFavoritas = cancionesFavoritas.filter((fav) => fav._id !== cancion._id)
      } else {
        cancionesFavoritas.unshift(cancion)
      }

      // Actualizar contador y botones
      actualizarContadores()
      actualizarBotonFavoritoReproductor(cancion)
      
      // Mostrar mensaje de éxito
      mostrarMensaje(
        esFavorita ? "Canción eliminada de favoritos" : "Canción añadida a favoritos",
        "exito"
      )
    } catch (error) {
      console.error("Error al actualizar favoritos:", error)
      mostrarMensaje(error.message || "Error al actualizar favoritos", "error")
    }
  }

  function actualizarBotonFavorito(boton, cancion) {
    const esFavorita = cancionesFavoritas.some((fav) => fav._id === cancion._id)
    boton.classList.toggle("activo", esFavorita)
    boton.innerHTML = `<i class="${esFavorita ? "fas" : "far"} fa-heart"></i>`
    boton.setAttribute("aria-label", esFavorita ? "Quitar de favoritos" : "Añadir a favoritos")
  }

  function actualizarBotonFavoritoReproductor(cancion) {
    const esFavorita = cancionesFavoritas.some((fav) => fav._id === cancion._id)
    botonFavorito.innerHTML = `<i class="${esFavorita ? "fas" : "far"} fa-heart"></i>`
    botonFavorito.classList.toggle("activo", esFavorita)
    botonFavorito.setAttribute("aria-label", esFavorita ? "Quitar de favoritos" : "Añadir a favoritos")
  }

  // Funciones de listas de reproducción
  async function cargarListas() {
    try {
      const response = await fetch('/api/listas')
      const data = await response.json()
      listasUsuario = data.listas || []

      contenedorListas.innerHTML = ""

      if (listasUsuario.length === 0) {
        contenedorListas.innerHTML = '<div class="sin-resultados">📝 No tienes listas de reproducción aún.</div>'
        return
      }

      // Si hay una lista seleccionada, mostrar sus canciones
      const listaSeleccionada = listasUsuario.find(lista => lista._id === vistaActual)
      if (listaSeleccionada) {
        mostrarCancionesLista(listaSeleccionada)
        return
      }

      // Si no hay lista seleccionada, mostrar todas las listas
      listasUsuario.forEach((lista, indice) => {
        const elementoLista = document.createElement("div")
        elementoLista.className = "elemento-lista"
        elementoLista.style.animationDelay = `${indice * 0.05}s`

        elementoLista.innerHTML = `
          <div class="lista-header">
            <div class="lista-icono-grande">
              <i class="fas fa-music"></i>
            </div>
            <div class="lista-info">
              <h3>${lista.nombre}</h3>
              <p>${lista.canciones.length} canciones</p>
            </div>
          </div>
          <div class="lista-acciones">
            <button class="boton-accion" data-id="${lista._id}" aria-label="Ver canciones">
              <i class="fas fa-list"></i>
            </button>
            <button class="boton-accion" data-id="${lista._id}" aria-label="Reproducir lista">
              <i class="fas fa-play"></i>
            </button>
            <button class="boton-accion" data-id="${lista._id}" aria-label="Editar lista">
              <i class="fas fa-edit"></i>
            </button>
            <button class="boton-accion" data-id="${lista._id}" aria-label="Eliminar lista">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `

        // Eventos de acciones
        const botones = elementoLista.querySelectorAll(".boton-accion")
        botones[0].addEventListener("click", () => {
          vistaActual = lista._id
          mostrarCancionesLista(lista)
        })
        botones[1].addEventListener("click", () => reproducirLista(lista))
        botones[2].addEventListener("click", () => editarLista(lista))
        botones[3].addEventListener("click", () => eliminarLista(lista._id))

        contenedorListas.appendChild(elementoLista)
      })
    } catch (error) {
      console.error('Error al cargar listas:', error)
      mostrarMensaje('Error al cargar listas', 'error')
    }
  }

  function mostrarCancionesLista(lista) {
    contenedorListas.innerHTML = `
      <div class="header-lista-canciones">
        <button class="boton-volver" aria-label="Volver a listas">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="info-lista">
          <h4>${lista.nombre}</h4>
          <p class="contador-canciones">${lista.canciones.length} canción${lista.canciones.length !== 1 ? 'es' : ''}</p>
        </div>
        <button class="boton-reproducir-todo" aria-label="Reproducir toda la lista">
          <i class="fas fa-play"></i>
          <span>Reproducir todo</span>
        </button>
      </div>
      <div class="contenedor-canciones-lista">
        ${lista.canciones.length === 0 
          ? '<div class="sin-resultados">Esta lista está vacía</div>'
          : lista.canciones.map((cancion, indice) => `
              <div class="elemento-cancion-lista" data-indice="${indice}">
                <div class="numero-cancion">${indice + 1}</div>
                <div class="cancion-info">
                  <img src="${cancion.artworkUrl100 || '/placeholder.svg?height=40&width=40'}" 
                       alt="Portada de ${cancion.trackName}" 
                       class="imagen-miniatura">
                  <div class="detalles-cancion">
                    <h5>${cancion.trackName}</h5>
                    <p>${cancion.artistName}</p>
                    <p class="album">${cancion.collectionName}</p>
                  </div>
                </div>
                <div class="duracion-cancion">
                  ${formatearDuracion(cancion.trackTimeMillis)}
                </div>
                <div class="cancion-acciones">
                  <button class="boton-reproducir-cancion" data-indice="${indice}" aria-label="Reproducir canción">
                    <i class="fas fa-play"></i>
                  </button>
                  <button class="boton-eliminar-cancion" data-indice="${indice}" aria-label="Eliminar de la lista">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            `).join('')}
      </div>
    `

    // Evento para volver a la vista de listas
    const botonVolver = contenedorListas.querySelector('.boton-volver')
    botonVolver.addEventListener('click', () => {
      vistaActual = "listas"
      cargarListas()
    })

    // Evento para reproducir toda la lista
    const botonReproducirTodo = contenedorListas.querySelector('.boton-reproducir-todo')
    botonReproducirTodo.addEventListener('click', () => {
      if (lista.canciones.length > 0) {
        reproducirLista(lista)
      }
    })

    // Eventos para las canciones
    const elementosCancion = contenedorListas.querySelectorAll('.elemento-cancion-lista')
    elementosCancion.forEach(elemento => {
      elemento.addEventListener('click', (e) => {
        if (!e.target.closest('.cancion-acciones')) {
          const indice = parseInt(elemento.dataset.indice)
          reproducirCancion(lista.canciones[indice])
        }
      })
    })

    const botonesReproducir = contenedorListas.querySelectorAll('.boton-reproducir-cancion')
    const botonesEliminar = contenedorListas.querySelectorAll('.boton-eliminar-cancion')

    botonesReproducir.forEach(boton => {
      boton.addEventListener('click', (e) => {
        e.stopPropagation()
        const indice = parseInt(e.currentTarget.dataset.indice)
        reproducirCancion(lista.canciones[indice])
      })
    })

    botonesEliminar.forEach(boton => {
      boton.addEventListener('click', async (e) => {
        e.stopPropagation()
        const indice = parseInt(e.currentTarget.dataset.indice)
        const cancion = lista.canciones[indice]
        
        try {
          const response = await fetch(`/api/listas/${lista._id}/canciones/${cancion._id}`, {
            method: 'DELETE',
            credentials: 'include'
          })

          if (!response.ok) {
            throw new Error('Error al eliminar la canción de la lista')
          }

          lista.canciones.splice(indice, 1)
          mostrarCancionesLista(lista)
          mostrarMensaje(`"${cancion.trackName}" eliminada de la lista`, "exito")
        } catch (error) {
          console.error('Error:', error)
          mostrarMensaje('Error al eliminar la canción de la lista', 'error')
        }
      })
    })
  }

  function mostrarFormularioLista(cancion) {
    // Crear el modal de selección de lista
    const modal = document.createElement('div')
    modal.className = 'modal-lista'
    modal.innerHTML = `
      <div class="modal-contenido">
        <h3>Añadir a lista de reproducción</h3>
        <div class="listas-disponibles">
          ${listasUsuario.length === 0 
            ? '<p class="sin-listas">No tienes listas de reproducción. Crea una nueva lista.</p>'
            : listasUsuario.map(lista => `
                <div class="elemento-lista-seleccion" data-id="${lista._id}">
                  <div class="lista-info">
                    <i class="fas fa-music"></i>
                    <span>${lista.nombre}</span>
                    <small>${lista.canciones.length} canciones</small>
                  </div>
                  <button class="boton-añadir" data-id="${lista._id}">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              `).join('')
          }
        </div>
        <div class="crear-nueva-lista">
          <input type="text" id="nombreNuevaLista" placeholder="Nombre de la nueva lista">
          <button id="crearListaNueva">Crear y añadir</button>
        </div>
        <button class="boton-cerrar">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `

    document.body.appendChild(modal)

    // Eventos del modal
    const botonesAñadir = modal.querySelectorAll('.boton-añadir')
    botonesAñadir.forEach(boton => {
      boton.addEventListener('click', async (e) => {
        e.stopPropagation()
        const listaId = boton.dataset.id
        try {
          const response = await fetch(`/api/listas/${listaId}/canciones`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cancionId: cancion._id }),
            credentials: 'include'
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.mensaje || 'Error al añadir la canción a la lista')
          }

          mostrarMensaje('Canción añadida a la lista', 'exito')
          modal.remove()
          
          // Actualizar la vista de listas
          await cargarListas()
        } catch (error) {
          console.error('Error:', error)
          mostrarMensaje(error.message, 'error')
        }
      })
    })

    // Evento para crear nueva lista
    const botonCrear = modal.querySelector('#crearListaNueva')
    const inputNombre = modal.querySelector('#nombreNuevaLista')
    
    botonCrear.addEventListener('click', async () => {
      const nombre = inputNombre.value.trim()
      if (!nombre) {
        mostrarMensaje('Por favor, ingresa un nombre para la lista', 'error')
        return
      }

      try {
        // Crear la lista
        const responseCrear = await fetch('/api/listas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nombre }),
          credentials: 'include'
        })

        if (!responseCrear.ok) {
          const data = await responseCrear.json()
          throw new Error(data.mensaje || 'Error al crear la lista')
        }

        const data = await responseCrear.json()
        listasUsuario.push(data.lista)

        // Actualizar contadores y listas rápidas
        actualizarContadores()
        actualizarListasRapidas()

        // Si hay una canción para agregar, agregarla a la nueva lista
        if (cancionParaAgregar) {
          await fetch(`/api/listas/${data.lista._id}/canciones/${cancionParaAgregar._id}`, {
            method: "POST",
            credentials: "include"
          })
          cancionParaAgregar = null
        }

        ocultarFormularioLista()
        mostrarMensaje("Lista creada exitosamente", "exito")
        cargarListas()
      } catch (error) {
        console.error('Error:', error)
        mostrarMensaje(error.message, 'error')
      }
    })

    // Evento para cerrar el modal
    const botonCerrar = modal.querySelector('.boton-cerrar')
    botonCerrar.addEventListener('click', () => {
      modal.remove()
    })

    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })
  }

  function ocultarFormularioLista() {
    crearListaForm.style.display = "none"
    nombreNuevaLista.value = ""
  }

  async function crearNuevaLista() {
    try {
      const nombre = nombreNuevaLista.value.trim()
      if (!nombre) {
        mostrarMensaje("Por favor, ingresa un nombre para la lista", "error")
        return
      }

      const response = await fetch("/api/listas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre }),
        credentials: "include"
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.mensaje || "Error al crear la lista")
      }

      const data = await response.json()
      listasUsuario.push(data.lista)

      // Actualizar contadores y listas rápidas
      actualizarContadores()
      actualizarListasRapidas()

      // Si hay una canción para agregar, agregarla a la nueva lista
      if (cancionParaAgregar) {
        await fetch(`/api/listas/${data.lista._id}/canciones/${cancionParaAgregar._id}`, {
          method: "POST",
          credentials: "include"
        })
        cancionParaAgregar = null
      }

      ocultarFormularioLista()
      mostrarMensaje("Lista creada exitosamente", "exito")
      cargarListas()
    } catch (error) {
      console.error("Error al crear lista:", error)
      mostrarMensaje(error.message || "Error al crear la lista", "error")
    }
  }

  function reproducirLista(lista) {
    if (lista.canciones.length === 0) {
      mostrarMensaje("Esta lista está vacía.", "error")
      return
    }

    listaCanciones = lista.canciones
    indiceCancionActual = 0
    reproducirCancion(lista.canciones[0])
  }

  async function eliminarLista(listaId) {
    try {
      const response = await fetch(`/api/listas/${listaId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.mensaje || "Error al eliminar la lista")
      }

      // Actualizar la lista local
      listasUsuario = listasUsuario.filter(lista => lista._id !== listaId)

      // Actualizar contadores y listas rápidas
      actualizarContadores()
      actualizarListasRapidas()

      mostrarMensaje("Lista eliminada exitosamente", "exito")
      cargarListas()
    } catch (error) {
      console.error("Error al eliminar lista:", error)
      mostrarMensaje(error.message || "Error al eliminar la lista", "error")
    }
  }

  function editarLista(lista) {
    // Implementar edición de lista (funcionalidad futura)
    mostrarMensaje("Función de edición próximamente.", "error")
  }

  // Funciones de historial
  async function cargarHistorial() {
    const contenedorHistorial = document.getElementById("contenedorHistorial")
    contenedorHistorial.innerHTML = ""

    if (historialReproduccion.length === 0) {
      contenedorHistorial.innerHTML = `
        <div class="sin-resultados">
          <i class="fas fa-history"></i>
          <p>No hay historial de reproducción</p>
        </div>
      `
      return
    }

    historialReproduccion.forEach((item, indice) => {
      const elementoCancion = crearElementoCancion(item.cancion, indice, true)
      contenedorHistorial.appendChild(elementoCancion)
    })
  }

  async function agregarAlHistorial(cancion) {
    try {
      const response = await fetch("/api/historial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cancionId: cancion._id }),
        credentials: "include"
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.mensaje || "Error al agregar al historial")
      }

      // Actualizar el historial local
      const data = await response.json()
      historialReproduccion = data.historial || []
    } catch (error) {
      console.error("Error al agregar al historial:", error)
      // No mostramos el mensaje de error al usuario para no interrumpir la experiencia
    }
  }

  // Funciones del reproductor
  function reproducirCancion(cancion) {
    if (!cancion.previewUrl) {
      mostrarMensaje("Esta canción no tiene vista previa disponible.", "error")
      return
    }

    // Agregar al historial
    agregarAlHistorial(cancion)

    // Si hay una canción reproduciéndose, hacer fade out
    if (cancionActual && !reproductorAudio.paused) {
      fadeOutAudio(() => {
        configurarNuevaCancion(cancion)
      })
    } else {
      configurarNuevaCancion(cancion)
    }
  }

  function configurarNuevaCancion(cancion) {
    cancionActual = cancion

    // Detener el visualizador actual y limpiar el contexto de audio
    detenerVisualizador()

    // Actualizar información del reproductor
    imagenCancion.src = cancion.artworkUrl100 || "/placeholder.svg?height=200&width=200"
    imagenCancion.alt = `Portada de ${cancion.trackName || "Canción"}`
    nombreArtista.textContent = cancion.artistName || "Artista desconocido"
    nombreAlbum.textContent = cancion.collectionName || "Álbum desconocido"
    nombreCancion.textContent = cancion.trackName || "Título desconocido"

    // Actualizar botón de favorito
    actualizarBotonFavoritoReproductor(cancion)

    // Crear un nuevo elemento de audio
    const nuevoAudio = document.createElement('audio')
    nuevoAudio.style.display = 'none'
    nuevoAudio.src = `/api/audio-proxy?url=${encodeURIComponent(cancion.previewUrl)}`
    
    // Asegurarnos de que el elemento de audio esté en el DOM
    const contenedorAudio = document.querySelector('.contenido-reproductor')
    if (reproductorAudio && reproductorAudio.parentNode) {
        reproductorAudio.parentNode.removeChild(reproductorAudio)
    }
    contenedorAudio.appendChild(nuevoAudio)
    reproductorAudio = nuevoAudio

    // Reconectar los event listeners
    reproductorAudio.addEventListener("loadedmetadata", () => {
        barraProgreso.max = reproductorAudio.duration
        tiempoTotal.textContent = formatearTiempoSegundos(reproductorAudio.duration)
    })

    reproductorAudio.addEventListener("timeupdate", () => {
        barraProgreso.value = reproductorAudio.currentTime
        tiempoActual.textContent = formatearTiempoSegundos(reproductorAudio.currentTime)
    })

    reproductorAudio.addEventListener("ended", () => {
        actualizarIconoReproducir(true)
        siguienteCancion()
    })

    // Mostrar reproductor con animación
    contenedorReproductor.style.display = "flex"
    document.body.style.overflow = "hidden"

    setTimeout(() => {
        contenedorReproductor.classList.add("visible")
        document.querySelector(".tarjeta-reproductor").classList.add("visible")
    }, 10)

    // Reproducir automáticamente con fade in
    reproductorAudio.volume = 0
    reproductorAudio
        .play()
        .then(() => {
            fadeInAudio()
            iniciarVisualizador()
            imagenCancion.classList.add("reproduciendo")
        })
        .catch((error) => {
            console.error("Error al reproducir audio:", error)
            mostrarMensaje("Error al reproducir la canción.", "error")
        })

    actualizarIconoReproducir(false)
  }

  function reproducirAudio() {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume()
    }
    reproductorAudio.play()
    actualizarIconoReproducir(false)
    iniciarVisualizador()
    imagenCancion.classList.add("reproduciendo")
  }

  function pausarAudio() {
    reproductorAudio.pause()
    actualizarIconoReproducir(true)
    detenerVisualizador()
    imagenCancion.classList.remove("reproduciendo")
  }

  function toggleReproduccion() {
    if (reproductorAudio.paused) {
      reproducirAudio()
    } else {
      pausarAudio()
    }
  }

  function actualizarIconoReproducir(pausado) {
    const icono = botonReproducir.querySelector("i")
    if (pausado) {
      icono.className = "fas fa-play"
      botonReproducir.setAttribute("aria-label", "Reproducir")
    } else {
      icono.className = "fas fa-pause"
      botonReproducir.setAttribute("aria-label", "Pausar")
    }
  }

  function siguienteCancion() {
    if (listaCanciones.length === 0) return

    let nextIndex = indiceCancionActual + 1
    if (nextIndex >= listaCanciones.length) {
      nextIndex = 0
    }

    indiceCancionActual = nextIndex
    reproducirCancion(listaCanciones[indiceCancionActual])
  }

  function cancionAnterior() {
    if (listaCanciones.length === 0) return

    let prevIndex = indiceCancionActual - 1
    if (prevIndex < 0) {
      prevIndex = listaCanciones.length - 1
    }

    indiceCancionActual = prevIndex
    reproducirCancion(listaCanciones[indiceCancionActual])
  }

  function cerrarReproductor() {
    contenedorReproductor.classList.remove("visible")
    document.querySelector(".tarjeta-reproductor").classList.remove("visible")

    setTimeout(() => {
      contenedorReproductor.style.display = "none"
      document.body.style.overflow = ""
      reproductorAudio.pause()
      reproductorAudio.currentTime = 0
      actualizarIconoReproducir(true)
      detenerVisualizador()
      imagenCancion.classList.remove("reproduciendo")
    }, 300)
  }

  // Funciones de audio
  function fadeOutAudio(callback) {
    let volumen = reproductorAudio.volume
    const intervalo = setInterval(() => {
      if (volumen > 0.1) {
        volumen -= 0.1
        reproductorAudio.volume = volumen
      } else {
        clearInterval(intervalo)
        reproductorAudio.pause()
        reproductorAudio.currentTime = 0
        if (callback) callback()
      }
    }, 50)
  }

  function fadeInAudio() {
    let volumen = 0
    reproductorAudio.volume = volumen
    const intervalo = setInterval(() => {
      if (volumen < 0.9) {
        volumen += 0.1
        reproductorAudio.volume = volumen
      } else {
        clearInterval(intervalo)
        reproductorAudio.volume = 1
      }
    }, 50)
  }

  // Visualizador de audio
  function iniciarVisualizador() {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        audioAnalyser = audioContext.createAnalyser()
        audioAnalyser.fftSize = 256
      }

      if (!audioSource) {
        audioSource = audioContext.createMediaElementSource(reproductorAudio)
        audioSource.connect(audioAnalyser)
        audioAnalyser.connect(audioContext.destination)
      }

      const bufferLength = audioAnalyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      const canvas = document.getElementById("visualizadorOnda")
      const canvasCtx = canvas.getContext("2d")

      function dibujarOnda() {
        animationFrameId = requestAnimationFrame(dibujarOnda)
        audioAnalyser.getByteFrequencyData(dataArray)

        canvasCtx.fillStyle = "rgb(0, 0, 0)"
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

        const barWidth = (canvas.width / bufferLength) * 2.5
        let barHeight
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2

          canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

          x += barWidth + 1
        }
      }

      dibujarOnda()
    } catch (error) {
      console.error("Error al iniciar el visualizador:", error)
    }
  }

  function detenerVisualizador() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  // Funciones de utilidad
  function actualizarContadores() {
    if (contadorFavoritos) {
      contadorFavoritos.textContent = cancionesFavoritas.length
    }
    if (contadorListas) {
      contadorListas.textContent = listasUsuario.length
    }
  }

  function actualizarListasRapidas() {
    if (!listasRapidas) return

    listasRapidas.innerHTML = ""

    if (listasUsuario.length === 0) {
      listasRapidas.innerHTML =
        "<p style='color: var(--color-text-muted); font-size: 0.8rem; text-align: center;'>No hay listas</p>"
      return
    }

    // Mostrar las últimas 3 listas
    const listasRecientes = listasUsuario.slice(-3)

    listasRecientes.forEach((lista) => {
      const listaElement = document.createElement("div")
      listaElement.className = "lista-rapida"
      listaElement.innerHTML = `
        <div class="lista-icono">
          <i class="fas fa-music"></i>
        </div>
        <div class="lista-info">
          <h5>${lista.nombre}</h5>
          <p>${lista.canciones.length} canciones</p>
        </div>
      `

      listaElement.addEventListener("click", () => {
        mostrarVista("listas")
        mostrarCancionesLista(lista)
      })

      listasRapidas.appendChild(listaElement)
    })
  }

  function formatearTiempo(milisegundos) {
    if (!milisegundos) return "0:00"
    const segundos = Math.floor(milisegundos / 1000)
    const minutos = Math.floor(segundos / 60)
    const segundosRestantes = segundos % 60
    return `${minutos}:${segundosRestantes.toString().padStart(2, "0")}`
  }

  function formatearTiempoSegundos(segundos) {
    if (isNaN(segundos)) return "0:00"
    const minutos = Math.floor(segundos / 60)
    const segundosRestantes = Math.floor(segundos % 60)
    return `${minutos}:${segundosRestantes.toString().padStart(2, "0")}`
  }

  function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO)
    const ahora = new Date()
    const diferencia = ahora - fecha
    const minutos = Math.floor(diferencia / 60000)
    const horas = Math.floor(diferencia / 3600000)
    const dias = Math.floor(diferencia / 86400000)

    if (minutos < 1) return "Hace un momento"
    if (minutos < 60) return `Hace ${minutos} minutos`
    if (horas < 24) return `Hace ${horas} horas`
    if (dias < 7) return `Hace ${dias} días`

    return fecha.toLocaleDateString()
  }

  function mostrarMensaje(mensaje, tipo) {
    const elementoMensaje = document.createElement("div")
    elementoMensaje.className = `mensaje-notificacion ${tipo}`
    elementoMensaje.textContent = mensaje

    document.body.appendChild(elementoMensaje)

    setTimeout(() => {
      elementoMensaje.classList.add("visible")
    }, 10)

    setTimeout(() => {
      elementoMensaje.classList.remove("visible")
      setTimeout(() => {
        elementoMensaje.remove()
      }, 300)
    }, 3000)
  }

  function cerrarSesion() {
    // Mostrar confirmación antes de cerrar sesión
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        // Mostrar mensaje de carga
        mostrarMensaje('Cerrando sesión...', 'info');
        
        // Limpiar datos de sesión
        fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cerrar sesión');
            }
            return response.json();
        })
        .then(() => {
            // Limpiar datos locales
            cancionesFavoritas = [];
            listasUsuario = [];
            historialReproduccion = [];
            
            // Mostrar mensaje de éxito
            mostrarMensaje('Sesión cerrada exitosamente', 'exito');
            
            // Redirigir a la página de inicio de sesión
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        })
        .catch(error => {
            console.error('Error al cerrar sesión:', error);
            mostrarMensaje('Error al cerrar sesión. Por favor, intenta nuevamente.', 'error');
        });
    }
  }

  function mostrarResultadosBusqueda(canciones) {
    const resultadosContainer = document.getElementById('resultadosBusqueda')
    resultadosContainer.innerHTML = ''

    if (!canciones || canciones.length === 0) {
      resultadosContainer.innerHTML = `
        <div class="no-resultados">
          <i class="fas fa-search"></i>
          <p>No se encontraron resultados</p>
        </div>
      `
      return
    }

    // Actualizar la lista de canciones con los resultados de búsqueda
    listaCanciones = canciones
    indiceCancionActual = 0

    canciones.forEach((cancion, indice) => {
      const elementoCancion = document.createElement('div')
      elementoCancion.className = 'elemento-cancion'
      elementoCancion.style.animationDelay = `${indice * 0.05}s`

      elementoCancion.innerHTML = `
        <div class="cancion-header">
          <img src="${cancion.artworkUrl100}" alt="${cancion.trackName}" class="imagen-miniatura">
          <div class="detalles-cancion">
            <h3>${cancion.trackName}</h3>
            <p>${cancion.artistName}</p>
            <p class="album">${cancion.collectionName}</p>
          </div>
        </div>
        <div class="cancion-acciones">
          <button class="boton-accion" aria-label="Reproducir">
            <i class="fas fa-play"></i>
          </button>
          <button class="boton-accion" aria-label="Añadir a favoritos">
            <i class="${cancionesFavoritas.some(fav => fav.trackId === cancion.trackId) ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <button class="boton-accion" aria-label="Añadir a lista">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      `

      // Eventos de los botones
      const botones = elementoCancion.querySelectorAll('.boton-accion')
      
      // Botón reproducir
      botones[0].addEventListener('click', (e) => {
        e.stopPropagation()
        reproducirCancion(cancion)
      })

      // Botón favorito
      botones[1].addEventListener('click', (e) => {
        e.stopPropagation()
        toggleFavorito(cancion)
        actualizarBotonFavorito(botones[1], cancion)
      })

      // Botón añadir a lista
      botones[2].addEventListener('click', (e) => {
        e.stopPropagation()
        mostrarFormularioLista(cancion)
      })

      // Click en la canción
      elementoCancion.addEventListener('click', () => {
        reproducirCancion(cancion)
      })

      resultadosContainer.appendChild(elementoCancion)
    })
  }

  function crearElementoCancion(cancion, indice, mostrarAcciones = true) {
    const elementoCancion = document.createElement('div')
    elementoCancion.className = 'elemento-cancion'
    elementoCancion.style.animationDelay = `${indice * 0.05}s`

    elementoCancion.innerHTML = `
      <div class="cancion-header">
        <img src="${cancion.artworkUrl100}" alt="${cancion.trackName}" class="imagen-miniatura">
        <div class="detalles-cancion">
          <h3>${cancion.trackName}</h3>
          <p>${cancion.artistName}</p>
          <p class="album">${cancion.collectionName}</p>
        </div>
      </div>
      ${mostrarAcciones ? `
        <div class="cancion-acciones">
          <button class="boton-accion" aria-label="Reproducir">
            <i class="fas fa-play"></i>
          </button>
          <button class="boton-accion" aria-label="Añadir a favoritos">
            <i class="${cancionesFavoritas.some(fav => fav.trackId === cancion.trackId) ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <button class="boton-accion" aria-label="Añadir a lista">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      ` : ''}
    `

    // Eventos de los botones si se muestran acciones
    if (mostrarAcciones) {
      const botones = elementoCancion.querySelectorAll('.boton-accion')
      
      // Botón reproducir
      botones[0].addEventListener('click', (e) => {
        e.stopPropagation()
        reproducirCancion(cancion)
      })

      // Botón favorito
      botones[1].addEventListener('click', (e) => {
        e.stopPropagation()
        toggleFavorito(cancion)
        actualizarBotonFavorito(botones[1], cancion)
      })

      // Botón añadir a lista
      botones[2].addEventListener('click', (e) => {
        e.stopPropagation()
        mostrarFormularioLista(cancion)
      })
    }

    // Click en la canción
    elementoCancion.addEventListener('click', () => {
      reproducirCancion(cancion)
    })

    return elementoCancion
  }

  function manejarTeclado(evento) {
    // Solo manejar eventos si el reproductor está visible
    if (!reproductor.classList.contains("visible")) return

    switch (evento.code) {
      case "Space":
        evento.preventDefault()
        toggleReproduccion()
        break
      case "ArrowRight":
        evento.preventDefault()
        siguienteCancion()
        break
      case "ArrowLeft":
        evento.preventDefault()
        cancionAnterior()
        break
      case "Escape":
        evento.preventDefault()
        cerrarReproductor()
        break
    }
  }

  // Inicializar la aplicación
  inicializarApp()
})
