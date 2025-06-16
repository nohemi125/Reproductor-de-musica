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
  const cancionesFavoritas = JSON.parse(localStorage.getItem("cancionesFavoritas")) || []
  const listasUsuario = JSON.parse(localStorage.getItem("listasReproduccion")) || []
  const historialReproduccion = JSON.parse(localStorage.getItem("historialReproduccion")) || []

  // Variables del visualizador
  let contextoAudio = null
  let analizador = null
  let bufferLength = null
  let dataArray = null
  let fuenteAudio = null
  let animacionID = null

  // Inicialización
  inicializarApp()

  function inicializarApp() {
    configurarEventos()
    actualizarContadores()
    actualizarListasRapidas()
    mostrarVista("inicio")
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
    botonReproducir?.addEventListener("click", reproducirAudio)
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
    evento.preventDefault()
    const entradaArtista = document.getElementById("entradaArtista")
    const artista = entradaArtista.value.trim()

    if (!artista) {
      mostrarMensaje("Por favor, ingresa el nombre de un artista.", "error")
      return
    }

    resultadosBusqueda.innerHTML = '<div class="cargando">🎵 Buscando música...</div>'

    try {
      const respuesta = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(artista)}&entity=song&limit=20`,
      )

      if (!respuesta.ok) {
        throw new Error(`Error en la solicitud: ${respuesta.status} ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()
      listaCanciones = datos.results || []
      mostrarResultados(listaCanciones)
    } catch (error) {
      console.error("Error al buscar canciones:", error)
      resultadosBusqueda.innerHTML = '<div class="error">❌ Error al buscar canciones. Intenta nuevamente.</div>'
    }
  }

  function mostrarResultados(canciones) {
    resultadosBusqueda.innerHTML = ""

    if (canciones.length === 0) {
      resultadosBusqueda.innerHTML = '<div class="sin-resultados">🎵 No se encontraron canciones.</div>'
      return
    }

    canciones.forEach((cancion, indice) => {
      const elementoCancion = crearElementoCancion(cancion, indice)
      resultadosBusqueda.appendChild(elementoCancion)
    })
  }

  // Función para crear elemento de canción
  function crearElementoCancion(cancion, indice, mostrarAcciones = true) {
    const elementoCancion = document.createElement("div")
    elementoCancion.className = "elemento-cancion"
    elementoCancion.style.animationDelay = `${indice * 0.05}s`

    const esFavorita = cancionesFavoritas.some((fav) => fav.trackId === cancion.trackId)

    elementoCancion.innerHTML = `
      <div class="cancion-header">
        <img src="${cancion.artworkUrl100 || "/placeholder.svg?height=60&width=60"}" 
             alt="Portada de ${cancion.trackName || "Canción"}" class="imagen-miniatura">
        <div class="detalles-cancion-lista">
          <h3>${cancion.trackName || "Título desconocido"}</h3>
          <p>${cancion.artistName || "Artista desconocido"} • ${cancion.collectionName || "Álbum desconocido"}</p>
        </div>
        <div class="duracion-cancion">
          ${formatearTiempo(cancion.trackTimeMillis)}
        </div>
      </div>
      ${
        mostrarAcciones
          ? `
        <div class="cancion-acciones">
          <button class="boton-favorito-lista ${esFavorita ? "activo" : ""}" data-indice="${indice}" 
                  aria-label="${esFavorita ? "Quitar de favoritos" : "Añadir a favoritos"}">
            <i class="${esFavorita ? "fas" : "far"} fa-heart"></i>
          </button>
          <button class="boton-accion" aria-label="Añadir a lista">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      `
          : ""
      }
    `

    // Evento para reproducir
    elementoCancion.addEventListener("click", (e) => {
      if (e.target.closest(".cancion-acciones")) return
      indiceCancionActual = indice
      reproducirCancion(cancion)
    })

    // Eventos de acciones
    if (mostrarAcciones) {
      const botonFavorito = elementoCancion.querySelector(".boton-favorito-lista")
      botonFavorito?.addEventListener("click", (e) => {
        e.stopPropagation()
        toggleFavorito(cancion)
        actualizarBotonFavorito(botonFavorito, cancion)
      })
    }

    return elementoCancion
  }

  // Funciones de favoritos
  function cargarFavoritos() {
    contenedorFavoritos.innerHTML = ""

    if (cancionesFavoritas.length === 0) {
      contenedorFavoritos.innerHTML = '<div class="sin-resultados">❤️ No tienes canciones favoritas aún.</div>'
      return
    }

    cancionesFavoritas.forEach((cancion, indice) => {
      const elementoCancion = crearElementoCancion(cancion, indice, false)

      // Agregar botón para quitar de favoritos
      const accionesDiv = document.createElement("div")
      accionesDiv.className = "cancion-acciones"
      accionesDiv.innerHTML = `
        <button class="boton-accion" aria-label="Quitar de favoritos">
          <i class="fas fa-heart-broken"></i>
        </button>
      `

      const botonQuitar = accionesDiv.querySelector(".boton-accion")
      botonQuitar.addEventListener("click", (e) => {
        e.stopPropagation()
        toggleFavorito(cancion)
        cargarFavoritos() // Recargar la vista
      })

      elementoCancion.appendChild(accionesDiv)
      contenedorFavoritos.appendChild(elementoCancion)
    })
  }

  function toggleFavorito(cancion) {
    const indice = cancionesFavoritas.findIndex((fav) => fav.trackId === cancion.trackId)

    if (indice === -1) {
      // Agregar a favoritos
      cancionesFavoritas.push({
        trackId: cancion.trackId,
        trackName: cancion.trackName,
        artistName: cancion.artistName,
        collectionName: cancion.collectionName,
        artworkUrl100: cancion.artworkUrl100,
        previewUrl: cancion.previewUrl,
        trackTimeMillis: cancion.trackTimeMillis,
      })
      mostrarMensaje(`"${cancion.trackName}" agregada a favoritos`, "exito")
    } else {
      // Quitar de favoritos
      cancionesFavoritas.splice(indice, 1)
      mostrarMensaje(`"${cancion.trackName}" eliminada de favoritos`, "exito")
    }

    // Guardar en localStorage
    localStorage.setItem("cancionesFavoritas", JSON.stringify(cancionesFavoritas))

    // Actualizar contadores y UI
    actualizarContadores()

    // Actualizar botón del reproductor si es la canción actual
    if (cancionActual && cancionActual.trackId === cancion.trackId) {
      actualizarBotonFavoritoReproductor(cancion)
    }
  }

  function actualizarBotonFavorito(boton, cancion) {
    const esFavorita = cancionesFavoritas.some((fav) => fav.trackId === cancion.trackId)
    boton.classList.toggle("activo", esFavorita)
    boton.innerHTML = `<i class="${esFavorita ? "fas" : "far"} fa-heart"></i>`
    boton.setAttribute("aria-label", esFavorita ? "Quitar de favoritos" : "Añadir a favoritos")
  }

  function actualizarBotonFavoritoReproductor(cancion) {
    const esFavorita = cancionesFavoritas.some((fav) => fav.trackId === cancion.trackId)
    botonFavorito.innerHTML = `<i class="${esFavorita ? "fas" : "far"} fa-heart"></i>`
    botonFavorito.classList.toggle("activo", esFavorita)
    botonFavorito.setAttribute("aria-label", esFavorita ? "Quitar de favoritos" : "Añadir a favoritos")
  }

  // Funciones de listas de reproducción
  function cargarListas() {
    contenedorListas.innerHTML = ""

    if (listasUsuario.length === 0) {
      contenedorListas.innerHTML = '<div class="sin-resultados">📝 No tienes listas de reproducción aún.</div>'
      return
    }

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
          <button class="boton-accion" data-id="${lista.id}" aria-label="Reproducir lista">
            <i class="fas fa-play"></i>
          </button>
          <button class="boton-accion" data-id="${lista.id}" aria-label="Editar lista">
            <i class="fas fa-edit"></i>
          </button>
          <button class="boton-accion" data-id="${lista.id}" aria-label="Eliminar lista">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `

      // Eventos de acciones
      const botones = elementoLista.querySelectorAll(".boton-accion")
      botones[0].addEventListener("click", () => reproducirLista(lista))
      botones[1].addEventListener("click", () => editarLista(lista))
      botones[2].addEventListener("click", () => eliminarLista(lista.id))

      contenedorListas.appendChild(elementoLista)
    })
  }

  function mostrarFormularioLista() {
    crearListaForm.style.display = "block"
    nombreNuevaLista.focus()
  }

  function ocultarFormularioLista() {
    crearListaForm.style.display = "none"
    nombreNuevaLista.value = ""
  }

  function crearNuevaLista() {
    const nombre = nombreNuevaLista.value.trim()

    if (!nombre) {
      mostrarMensaje("Por favor, ingresa un nombre para la lista.", "error")
      return
    }

    if (listasUsuario.some((lista) => lista.nombre === nombre)) {
      mostrarMensaje("Ya existe una lista con ese nombre.", "error")
      return
    }

    const nuevaLista = {
      id: Date.now().toString(),
      nombre: nombre,
      canciones: [],
      fechaCreacion: new Date().toISOString(),
    }

    listasUsuario.push(nuevaLista)
    localStorage.setItem("listasReproduccion", JSON.stringify(listasUsuario))

    ocultarFormularioLista()
    cargarListas()
    actualizarContadores()
    actualizarListasRapidas()

    mostrarMensaje(`Lista "${nombre}" creada correctamente.`, "exito")
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

  function eliminarLista(listaId) {
    const indice = listasUsuario.findIndex((l) => l.id === listaId)

    if (indice !== -1) {
      const nombreLista = listasUsuario[indice].nombre
      listasUsuario.splice(indice, 1)

      localStorage.setItem("listasReproduccion", JSON.stringify(listasUsuario))

      cargarListas()
      actualizarContadores()
      actualizarListasRapidas()

      mostrarMensaje(`Lista "${nombreLista}" eliminada.`, "exito")
    }
  }

  function editarLista(lista) {
    // Implementar edición de lista (funcionalidad futura)
    mostrarMensaje("Función de edición próximamente.", "error")
  }

  // Funciones de historial
  function cargarHistorial() {
    contenedorHistorial.innerHTML = ""

    if (historialReproduccion.length === 0) {
      contenedorHistorial.innerHTML = '<div class="sin-resultados">🕒 No hay historial de reproducción aún.</div>'
      return
    }

    // Mostrar las últimas 50 canciones del historial
    const historialReciente = historialReproduccion.slice(-50).reverse()

    historialReciente.forEach((cancion, indice) => {
      const elementoCancion = crearElementoCancion(cancion, indice, false)

      // Agregar información de fecha
      const fechaDiv = document.createElement("div")
      fechaDiv.className = "fecha-reproduccion"
      fechaDiv.innerHTML = `<small>Reproducida: ${formatearFecha(cancion.fechaReproduccion)}</small>`

      elementoCancion.appendChild(fechaDiv)
      contenedorHistorial.appendChild(elementoCancion)
    })
  }

  function agregarAlHistorial(cancion) {
    const cancionConFecha = {
      ...cancion,
      fechaReproduccion: new Date().toISOString(),
    }

    // Evitar duplicados consecutivos
    const ultimaCancion = historialReproduccion[historialReproduccion.length - 1]
    if (!ultimaCancion || ultimaCancion.trackId !== cancion.trackId) {
      historialReproduccion.push(cancionConFecha)

      // Mantener solo las últimas 100 canciones
      if (historialReproduccion.length > 100) {
        historialReproduccion.shift()
      }

      localStorage.setItem("historialReproduccion", JSON.stringify(historialReproduccion))
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
    if (reproductorAudio.paused) {
      reproductorAudio
        .play()
        .then(() => {
          actualizarIconoReproducir(false)
          iniciarVisualizador()
          imagenCancion.classList.add("reproduciendo")
        })
        .catch((error) => {
          console.error("Error al reproducir:", error)
          mostrarMensaje("Error al reproducir la canción.", "error")
        })
    } else {
      reproductorAudio.pause()
      actualizarIconoReproducir(true)
      detenerVisualizador()
      imagenCancion.classList.remove("reproduciendo")
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
    if (!visualizadorOnda) return

    detenerVisualizador()

    try {
      if (!contextoAudio) {
        contextoAudio = new (window.AudioContext || window.webkitAudioContext)()
      }

      analizador = contextoAudio.createAnalyser()
      analizador.fftSize = 256
      bufferLength = analizador.frequencyBinCount
      dataArray = new Uint8Array(bufferLength)

      // Crear nueva fuente de audio
      fuenteAudio = contextoAudio.createMediaElementSource(reproductorAudio)
      fuenteAudio.connect(analizador)
      analizador.connect(contextoAudio.destination)

      const ctx = visualizadorOnda.getContext("2d")
      visualizadorOnda.width = visualizadorOnda.offsetWidth
      visualizadorOnda.height = visualizadorOnda.offsetHeight

      function dibujarOnda() {
        animacionID = requestAnimationFrame(dibujarOnda)

        analizador.getByteFrequencyData(dataArray)

        ctx.clearRect(0, 0, visualizadorOnda.width, visualizadorOnda.height)

        const barWidth = (visualizadorOnda.width / bufferLength) * 2.5
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * visualizadorOnda.height

          const r = 255 - i * 2
          const g = 100 + i
          const b = 200

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`
          ctx.fillRect(x, visualizadorOnda.height - barHeight, barWidth, barHeight)

          x += barWidth + 1
        }
      }

      dibujarOnda()
    } catch (error) {
      console.error("Error al iniciar el visualizador:", error)
    }
  }

  function detenerVisualizador() {
    if (animacionID) {
      cancelAnimationFrame(animacionID)
      animacionID = null
    }

    if (fuenteAudio) {
      try {
        fuenteAudio.disconnect()
        fuenteAudio = null
      } catch (error) {
        console.log("Error al desconectar fuente de audio:", error)
      }
    }

    if (analizador) {
      try {
        analizador.disconnect()
        analizador = null
      } catch (error) {
        console.log("Error al desconectar analizador:", error)
      }
    }

    if (contextoAudio) {
      try {
        contextoAudio.close()
        contextoAudio = null
      } catch (error) {
        console.log("Error al cerrar contexto de audio:", error)
      }
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
      elementoMensaje.style.animation = "slideInLeft 0.3s ease reverse"
      setTimeout(() => {
        if (document.body.contains(elementoMensaje)) {
          document.body.removeChild(elementoMensaje)
        }
      }, 300)
    }, 3000)
  }

  function manejarTeclado(evento) {
    if (evento.key === "Escape") {
      if (contenedorReproductor.style.display === "flex") {
        cerrarReproductor()
      } else if (sidebar?.classList.contains("active")) {
        cerrarSidebar()
      }
    }

    // Atajos de teclado para el reproductor
    if (cancionActual) {
      switch (evento.key) {
        case " ":
          evento.preventDefault()
          reproducirAudio()
          break
        case "ArrowRight":
          siguienteCancion()
          break
        case "ArrowLeft":
          cancionAnterior()
          break
      }
    }
  }

  function cerrarSesion() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      // Limpiar datos de sesión si es necesario
      mostrarMensaje("Sesión cerrada correctamente", "exito")

      // Aquí podrías redirigir a una página de login
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }

  // Responsive - Ajustar sidebar en cambio de tamaño de ventana
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      cerrarSidebar()
    }
  })
})
