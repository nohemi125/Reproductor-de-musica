const express = require('express');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config({ path: './config.env' });

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
app.use(cors({
    origin: true,
    credentials: true
}));

// Configuración de sesión
app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'tu_secreto_seguro_para_la_sesion',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Conexión a MongoDB
const DB = process.env.DB_CONNECTION;
if (!DB) {
    console.error('Error: La URI de MongoDB no está definida en las variables de entorno');
    process.exit(1);
}

console.log('Intentando conectar a MongoDB...');
mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4
})
.then(() => {
    console.log('✅ Conectado exitosamente a MongoDB Atlas');
})
.catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
});

// Importar rutas
const authRoutes = require('./routes/auth');
const favoritosRoutes = require('./routes/favoritos');

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/favoritos', favoritosRoutes);

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

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para la página de inicio
app.get('/inicio', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

// Middleware para manejar errores 404
app.use((req, res, next) => {
    console.log('Ruta no encontrada:', req.method, req.url);
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error('Error en el servidor:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
