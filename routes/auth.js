const express = require('express');
const { register, login } = require('../Controlador/authControlador');
const router = express.Router();

// Ruta para registrar un usuario
router.post('/register', register);

// Ruta para iniciar sesión
router.post('/login', login);

module.exports = router;