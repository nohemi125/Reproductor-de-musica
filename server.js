const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

dotenv.config({path: 'config.env'});



const app = express();


// Middleware para parsear JSON
app.use(express.json());

//middleware para parsear urlencoded
app.use(express.static('public'));


// Conexión a MongoDB
mongoose.connect(process.env.DB_CONNECTION)
    .then(() => console.log('Conectado a MongoDB database'))
    .catch(console.log);

// Rutas
app.use('/api/auth', authRoutes);



// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
