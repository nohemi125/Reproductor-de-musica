const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Verificar variables de entorno requeridas
const requiredEnvVars = ['MONGODB_URI', 'SESSION_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Variables de entorno faltantes:');
    missingEnvVars.forEach(envVar => {
        console.error(`   - ${envVar}`);
    });
    console.error('\nPor favor, configura estas variables en Railway:');
    console.error('1. Ve a tu proyecto en Railway');
    console.error('2. Haz clic en la pestaña "Variables"');
    console.error('3. Agrega cada variable con su valor correspondiente');
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://reproductor-de-musica-2.onrender.com'
        : ['http://localhost:2000', 'http://127.0.0.1:2000'],
    credentials: true
}));
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// URL de MongoDB
const mongoUrl = process.env.MONGODB_URI;

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoUrl,
        ttl: 24 * 60 * 60, // 1 día
        autoRemove: 'native',
        touchAfter: 24 * 3600 // 24 horas
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 día
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Conexión a MongoDB con reintentos y mejor manejo de errores
const connectWithRetry = async () => {
    const maxRetries = 5;
    let retries = 0;

    const tryConnect = async () => {
        try {
            console.log('Intentando conectar a MongoDB...');
            console.log('URL de MongoDB:', mongoUrl.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // Oculta credenciales en logs
            
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                ssl: true,
                tls: true,
                tlsAllowInvalidCertificates: false,
                tlsAllowInvalidHostnames: false,
                retryWrites: true,
                w: 'majority'
            });
            
            console.log('✅ Conexión a MongoDB establecida');
            
            // Verificar la conexión
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('Colecciones disponibles:', collections.map(c => c.name));
            
        } catch (err) {
            console.error(' Error al conectar con MongoDB:', err.message);
            retries++;
            
            if (retries < maxRetries) {
                console.log(`Reintentando conexión (${retries}/${maxRetries}) en 5 segundos...`);
                setTimeout(tryConnect, 5000);
            } else {
                console.error(' Número máximo de reintentos alcanzado. No se pudo conectar a MongoDB.');
                process.exit(1); // Terminar la aplicación si no se puede conectar
            }
        }
    };

    tryConnect();
};

// Manejar eventos de conexión
mongoose.connection.on('connected', () => {
    console.log('Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Error en la conexión de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose desconectado de MongoDB');
});

// Intentar conectar
connectWithRetry();

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

        res.setHeader('Content-Type', response.headers['content-type']);
        res.setHeader('Content-Length', response.headers['content-length']);
        res.setHeader('Accept-Ranges', 'bytes');

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
    console.log('Headers:', req.headers);
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error('Error en el servidor:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 2000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
});
