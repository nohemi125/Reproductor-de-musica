const express = require('express');
const router = express.Router();
const Usuario = require('../Modelo/User');
const Cancion = require('../Modelo/Cancion');

// Obtener favoritos del usuario
router.get('/', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Obtener los favoritos con los detalles de las canciones
        const favoritos = await Promise.all(
            usuario.cancionesFavoritas.map(async (cancionId) => {
                return await Cancion.findById(cancionId);
            })
        );

        res.json({ favoritos: favoritos.filter(c => c !== null) });
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({ mensaje: 'Error al obtener favoritos' });
    }
});

// Agregar canción a favoritos
router.post('/:cancionId', async (req, res) => {
    try {
        const { cancionId } = req.params;
        if (!cancionId) {
            return res.status(400).json({ mensaje: 'ID de canción requerido' });
        }

        const usuario = await Usuario.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Verificar si la canción existe
        const cancion = await Cancion.findById(cancionId);
        if (!cancion) {
            return res.status(404).json({ mensaje: 'Canción no encontrada' });
        }

        // Verificar si la canción ya está en favoritos
        if (usuario.cancionesFavoritas.includes(cancionId)) {
            return res.status(400).json({ mensaje: 'La canción ya está en favoritos' });
        }

        // Agregar a favoritos
        usuario.cancionesFavoritas.unshift(cancionId);
        await usuario.save();

        res.json({ mensaje: 'Canción agregada a favoritos' });
    } catch (error) {
        console.error('Error al agregar a favoritos:', error);
        res.status(500).json({ mensaje: 'Error al agregar a favoritos' });
    }
});

// Eliminar canción de favoritos
router.delete('/:cancionId', async (req, res) => {
    try {
        const { cancionId } = req.params;
        if (!cancionId) {
            return res.status(400).json({ mensaje: 'ID de canción requerido' });
        }

        const usuario = await Usuario.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Verificar si la canción está en favoritos
        if (!usuario.cancionesFavoritas.includes(cancionId)) {
            return res.status(400).json({ mensaje: 'La canción no está en favoritos' });
        }

        // Eliminar de favoritos
        usuario.cancionesFavoritas = usuario.cancionesFavoritas.filter(
            id => id.toString() !== cancionId
        );
        await usuario.save();

        res.json({ mensaje: 'Canción eliminada de favoritos' });
    } catch (error) {
        console.error('Error al eliminar de favoritos:', error);
        res.status(500).json({ mensaje: 'Error al eliminar de favoritos' });
    }
});

module.exports = router; 