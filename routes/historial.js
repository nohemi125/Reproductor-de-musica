const express = require('express');
const router = express.Router();
const Usuario = require('../Modelo/User');
const Cancion = require('../Modelo/Cancion');

// Obtener historial de reproducción
router.get('/', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Obtener el historial con los detalles de las canciones
        const historial = await Promise.all(
            usuario.historialReproduccion.map(async (item) => {
                const cancion = await Cancion.findById(item.cancion);
                return {
                    cancion,
                    fechaReproduccion: item.fechaReproduccion
                };
            })
        );

        res.json({ historial });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ mensaje: 'Error al obtener historial' });
    }
});

// Agregar canción al historial
router.post('/', async (req, res) => {
    try {
        const { cancionId } = req.body;
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

        // Agregar al historial
        usuario.historialReproduccion.unshift({
            cancion: cancionId,
            fechaReproduccion: new Date()
        });

        // Mantener solo las últimas 100 canciones
        if (usuario.historialReproduccion.length > 100) {
            usuario.historialReproduccion = usuario.historialReproduccion.slice(0, 100);
        }

        await usuario.save();

        // Obtener el historial actualizado con los detalles de las canciones
        const historial = await Promise.all(
            usuario.historialReproduccion.map(async (item) => {
                const cancion = await Cancion.findById(item.cancion);
                return {
                    cancion,
                    fechaReproduccion: item.fechaReproduccion
                };
            })
        );

        res.json({ mensaje: 'Canción agregada al historial', historial });
    } catch (error) {
        console.error('Error al agregar al historial:', error);
        res.status(500).json({ mensaje: 'Error al agregar al historial' });
    }
});

// Limpiar historial
router.delete('/', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        usuario.historialReproduccion = [];
        await usuario.save();

        res.json({ mensaje: 'Historial limpiado correctamente' });
    } catch (error) {
        console.error('Error al limpiar historial:', error);
        res.status(500).json({ mensaje: 'Error al limpiar historial' });
    }
});

module.exports = router; 