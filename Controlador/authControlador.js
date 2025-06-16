const User = require('../Modelo/User');

// Registrar un usuario
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Simular registro exitoso
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
};

// Iniciar sesión
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Simular inicio de sesión exitoso
        res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};