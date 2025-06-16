const express = require('express');
const router = express.Router();
const User = require('../Modelo/User');
const Cancion = require('../Modelo/Cancion');

// Obtener todas las listas del usuario
router.get('/', async (req, res) => {
    try {
        const usuario = await User.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Obtener las listas con los detalles de las canciones
        const listas = await Promise.all(
            usuario.listasReproduccion.map(async (lista) => {
                const canciones = await Promise.all(
                    lista.canciones.map(async (cancionId) => {
                        return await Cancion.findById(cancionId);
                    })
                );
                return {
                    _id: lista._id,
                    nombre: lista.nombre,
                    canciones: canciones.filter(c => c !== null),
                    fechaCreacion: lista.fechaCreacion
                };
            })
        );

        res.json({ listas });
    } catch (error) {
        console.error('Error al obtener listas:', error);
        res.status(500).json({ mensaje: 'Error al obtener listas' });
    }
});

// Crear nueva lista
router.post('/', async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ mensaje: 'Nombre de lista requerido' });
        }

        const usuario = await User.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Verificar si ya existe una lista con el mismo nombre
        const listaExistente = usuario.listasReproduccion.find(
            (lista) => lista.nombre.toLowerCase() === nombre.toLowerCase()
        );
        if (listaExistente) {
            return res.status(400).json({ mensaje: 'Ya existe una lista con ese nombre' });
        }

        // Crear nueva lista
        usuario.listasReproduccion.push({
            nombre,
            canciones: [],
            fechaCreacion: new Date()
        });

        await usuario.save();

        // Obtener la lista recién creada
        const nuevaLista = usuario.listasReproduccion[usuario.listasReproduccion.length - 1];
        res.status(201).json({
            mensaje: 'Lista creada correctamente',
            lista: {
                _id: nuevaLista._id,
                nombre: nuevaLista.nombre,
                canciones: [],
                fechaCreacion: nuevaLista.fechaCreacion
            }
        });
    } catch (error) {
        console.error('Error al crear lista:', error);
        res.status(500).json({ mensaje: 'Error al crear lista' });
    }
});

// Agregar canción a una lista
router.post('/:listaId/canciones', async (req, res) => {
    try {
        const { listaId } = req.params;
        const { cancionId } = req.body;

        if (!cancionId) {
            return res.status(400).json({ mensaje: 'ID de canción requerido' });
        }

        const usuario = await User.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Buscar la lista
        const lista = usuario.listasReproduccion.id(listaId);
        if (!lista) {
            return res.status(404).json({ mensaje: 'Lista no encontrada' });
        }

        // Verificar si la canción existe
        const cancion = await Cancion.findById(cancionId);
        if (!cancion) {
            return res.status(404).json({ mensaje: 'Canción no encontrada' });
        }

        // Verificar si la canción ya está en la lista
        if (lista.canciones.includes(cancionId)) {
            return res.status(400).json({ mensaje: 'La canción ya está en la lista' });
        }

        // Agregar la canción a la lista
        lista.canciones.push(cancionId);
        await usuario.save();

        // Obtener la lista actualizada con los detalles de las canciones
        const canciones = await Promise.all(
            lista.canciones.map(async (id) => {
                return await Cancion.findById(id);
            })
        );

        res.json({
            mensaje: 'Canción agregada a la lista',
            lista: {
                _id: lista._id,
                nombre: lista.nombre,
                canciones: canciones.filter(c => c !== null),
                fechaCreacion: lista.fechaCreacion
            }
        });
    } catch (error) {
        console.error('Error al agregar canción a la lista:', error);
        res.status(500).json({ mensaje: 'Error al agregar canción a la lista' });
    }
});

// Eliminar canción de una lista
router.delete('/:listaId/canciones/:cancionId', async (req, res) => {
    try {
        const { listaId, cancionId } = req.params;

        const usuario = await User.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Buscar la lista
        const lista = usuario.listasReproduccion.id(listaId);
        if (!lista) {
            return res.status(404).json({ mensaje: 'Lista no encontrada' });
        }

        // Eliminar la canción de la lista
        lista.canciones = lista.canciones.filter(id => id.toString() !== cancionId);
        await usuario.save();

        res.json({ mensaje: 'Canción eliminada de la lista' });
    } catch (error) {
        console.error('Error al eliminar canción de la lista:', error);
        res.status(500).json({ mensaje: 'Error al eliminar canción de la lista' });
    }
});

// Eliminar lista
router.delete('/:listaId', async (req, res) => {
    try {
        const { listaId } = req.params;

        const usuario = await User.findById(req.session.userId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Eliminar la lista
        usuario.listasReproduccion = usuario.listasReproduccion.filter(
            lista => lista._id.toString() !== listaId
        );
        await usuario.save();

        res.json({ mensaje: 'Lista eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar lista:', error);
        res.status(500).json({ mensaje: 'Error al eliminar lista' });
    }
});

module.exports = router; 