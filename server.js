const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: true, // Permitir todas las origenes en desarrollo
    credentials: true
}));
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// URL de MongoDB
const mongoUrl = 'mongodb+srv://root:root@cluster0.pulc8fc.mongodb.net/ReproductorMusic?retryWrites=true&w=majority';

// Configuración de sesión
app.use(session({
    secret: 'tu_secreto_seguro_para_la_sesion',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoUrl,
        ttl: 24 * 60 * 60 // 1 día
    }),
    cookie: {
        secure: false, // Cambiar a true en producción con HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    }
}));

// Conexión a MongoDB
mongoose.connect(mongoUrl)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// Rutas API
const authRoutes = require('./routes/auth');
const favoritosRoutes = require('./routes/favoritos');
const listasRoutes = require('./routes/listas');
const historialRoutes = require('./routes/historial');
const buscarRoutes = require('./routes/buscar');

app.use('/api/auth', authRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/listas', listasRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/buscar', buscarRoutes);

// Ruta de proxy para audio
app.get('/api/audio-proxy', async (req, res) => {
    try {
        const audioUrl = req.query.url;
        if (!audioUrl) {
            return res.status(400).json({ error: 'URL de audio no proporcionada' });
        }

        const response = await axios({
            method: 'get',
            url: audioUrl,
            responseType: 'stream'
        });

        // Establecer los headers necesarios
        res.setHeader('Content-Type', response.headers['content-type']);
        res.setHeader('Content-Length', response.headers['content-length']);
        res.setHeader('Accept-Ranges', 'bytes');

        // Pipe la respuesta directamente al cliente
        response.data.pipe(res);
    } catch (error) {
        console.error('Error en el proxy de audio:', error);
        res.status(500).json({ error: 'Error al obtener el audio' });
    }
});

// Rutas para las páginas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/inicio', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Manejo de errores 404
app.use((req, res) => {
    console.log('Ruta no encontrada:', req.method, req.url);
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error('Error en el servidor:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 2000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log('URL: http://localhost:2000');
});
