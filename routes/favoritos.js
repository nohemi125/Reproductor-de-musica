const express = require('express');
const router = express.Router();
const User = require('../Modelo/User');
const Cancion = require('../Modelo/Cancion');

// Obtener favoritos del usuario
router.get('/', async (req, res) => {
    try {
        console.log('=== Solicitud de favoritos ===');
        console.log('ID de usuario en sesión:', req.session.userId);

        if (!req.session.userId) {
            return res.status(401).json({ mensaje: 'No hay usuario en sesión' });
        }

        const usuario = await User.findById(req.session.userId);
        console.log('Usuario encontrado:', usuario ? 'Sí' : 'No');
        
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Obtener las canciones favoritas
        const favoritos = await Cancion.find({ _id: { $in: usuario.favoritos } });
        console.log('Favoritos encontrados:', favoritos);

        res.json({ favoritos });
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({ mensaje: 'Error al obtener favoritos' });
    }
});

// Agregar canción a favoritos
router.post('/:cancionId', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ mensaje: 'No hay usuario en sesión' });
        }

        const usuario = await User.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const cancionId = req.params.cancionId;
        
        // Verificar si la canción existe
        const cancion = await Cancion.findById(cancionId);
        if (!cancion) {
            return res.status(404).json({ mensaje: 'Canción no encontrada' });
        }

        if (!usuario.favoritos.includes(cancionId)) {
            usuario.favoritos.push(cancionId);
            await usuario.save();
            res.json({ mensaje: 'Canción agregada a favoritos' });
        } else {
            res.json({ mensaje: 'La canción ya está en favoritos' });
        }
    } catch (error) {
        console.error('Error al agregar a favoritos:', error);
        res.status(500).json({ mensaje: 'Error al agregar a favoritos' });
    }
});

// Eliminar canción de favoritos
router.delete('/:cancionId', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ mensaje: 'No hay usuario en sesión' });
        }

        const usuario = await User.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const cancionId = req.params.cancionId;
        usuario.favoritos = usuario.favoritos.filter(id => id.toString() !== cancionId);
        await usuario.save();

        res.json({ mensaje: 'Canción eliminada de favoritos' });
    } catch (error) {
        console.error('Error al eliminar de favoritos:', error);
        res.status(500).json({ mensaje: 'Error al eliminar de favoritos' });
    }
});

module.exports = router; 