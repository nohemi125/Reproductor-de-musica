const express = require("express")
const router = express.Router()
const Cancion = require("../Modelo/Cancion")
const axios = require("axios")

// Buscar canciones
router.get("/", async (req, res) => {
  try {
    console.log('Query recibido:', req.query);
    const { q } = req.query;

    if (!q) {
      console.log('No se recibió término de búsqueda');
      return res.status(400).json({ 
        error: 'El término de búsqueda es requerido' 
      });
    }

    const terminoBusqueda = q.trim();
    if (terminoBusqueda === '') {
      console.log('Término de búsqueda vacío');
      return res.status(400).json({ 
        error: 'El término de búsqueda no puede estar vacío' 
      });
    }

    console.log('Buscando canciones para:', terminoBusqueda);

    // Buscar en la API de iTunes
    const response = await axios.get(`https://itunes.apple.com/search`, {
      params: {
        term: terminoBusqueda,
        media: 'music',
        entity: 'song',
        limit: 20
      }
    });

    console.log('Respuesta de iTunes:', response.data);

    if (!response.data || !response.data.results) {
      return res.status(404).json({ 
        error: 'No se encontraron resultados' 
      });
    }

    // Procesar y guardar las canciones
    const cancionesGuardadas = await Promise.all(
      response.data.results.map(async (cancion) => {
        try {
          // Buscar si la canción ya existe
          let cancionExistente = await Cancion.findOne({ 
            trackId: cancion.trackId 
          });

          if (cancionExistente) {
            // Actualizar la canción existente
            cancionExistente = await Cancion.findOneAndUpdate(
              { trackId: cancion.trackId },
              {
                trackName: cancion.trackName,
                artistName: cancion.artistName,
                collectionName: cancion.collectionName,
                artworkUrl100: cancion.artworkUrl100,
                previewUrl: cancion.previewUrl,
                trackTimeMillis: cancion.trackTimeMillis,
                primaryGenreName: cancion.primaryGenreName,
                releaseDate: cancion.releaseDate
              },
              { new: true }
            );
            return cancionExistente;
          } else {
            // Crear nueva canción
            const nuevaCancion = new Cancion({
              trackId: cancion.trackId,
              trackName: cancion.trackName,
              artistName: cancion.artistName,
              collectionName: cancion.collectionName,
              artworkUrl100: cancion.artworkUrl100,
              previewUrl: cancion.previewUrl,
              trackTimeMillis: cancion.trackTimeMillis,
              primaryGenreName: cancion.primaryGenreName,
              releaseDate: cancion.releaseDate
            });
            return await nuevaCancion.save();
          }
        } catch (error) {
          console.error('Error al procesar canción:', error);
          return null;
        }
      })
    );

    // Filtrar canciones nulas y enviar respuesta
    const cancionesValidas = cancionesGuardadas.filter(c => c !== null);

    if (cancionesValidas.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron canciones válidas' 
      });
    }

    console.log('Canciones encontradas:', cancionesValidas.length);
    res.json({ canciones: cancionesValidas });
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    res.status(500).json({ 
      error: 'Error al realizar la búsqueda',
      detalles: error.message 
    });
  }
});

module.exports = router; 