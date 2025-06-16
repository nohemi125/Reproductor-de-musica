const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../Modelo/User');

// Ruta de registro
router.post('/registro', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        console.log('Intento de registro para:', email);

        // Verificar si el usuario ya existe
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            console.log('Usuario ya existe:', email);
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Crear nuevo usuario
        const usuario = new User({
            nombre,
            email,
            password
        });

        // Guardar usuario
        await usuario.save();
        console.log('Usuario registrado exitosamente:', email);

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Ruta de login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Intento de login para:', email);

        // Buscar usuario
        const usuario = await User.findOne({ email });
        if (!usuario) {
            console.log('Usuario no encontrado');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            console.log('Contraseña incorrecta');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Crear sesión
        req.session.userId = usuario._id;
        console.log('Login exitoso para:', email);

        res.json({
            mensaje: 'Login exitoso',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Ruta para verificar sesión
router.get('/verificar', (req, res) => {
    if (req.session.userId) {
        res.json({ autenticado: true });
    } else {
        res.json({ autenticado: false });
    }
});

// Ruta de logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.json({ mensaje: 'Sesión cerrada exitosamente' });
    });
});

// Obtener usuario actual
router.get('/usuario-actual', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }

        const usuario = await User.findById(req.session.userId).select('-password');
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

// Ruta para obtener información del usuario actual
router.get('/usuario', async (req, res) => {
    try {
        console.log('=== Solicitud de información de usuario ===');
        console.log('ID de sesión:', req.session.userId);
        console.log('Sesión completa:', req.session);

        if (!req.session.userId) {
            console.log('No hay usuario en sesión');
            return res.status(401).json({ mensaje: 'No hay usuario en sesión' });
        }

        const usuario = await User.findById(req.session.userId);
        console.log('Usuario encontrado en BD:', usuario);

        if (!usuario) {
            console.log('Usuario no encontrado en la base de datos');
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Crear objeto de respuesta sin la contraseña
        const usuarioResponse = {
            nombre: usuario.nombre,
            email: usuario.email
        };

        console.log('Enviando respuesta:', usuarioResponse);
        res.json({ usuario: usuarioResponse });
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        res.status(500).json({ mensaje: 'Error al obtener información del usuario' });
    }
});

module.exports = router;