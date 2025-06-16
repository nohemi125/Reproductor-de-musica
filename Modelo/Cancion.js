const mongoose = require('mongoose');

const cancionSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true
    },
    artista: {
        type: String,
        required: [true, 'El artista es requerido'],
        trim: true
    },
    url: {
        type: String,
        required: [true, 'La URL de la canción es requerida']
    },
    duracion: {
        type: String,
        default: '00:00'
    },
    imagen: {
        type: String,
        default: 'imagenes/default-song.png'
    }
}, {
    timestamps: true
});

const Cancion = mongoose.model('Cancion', cancionSchema);

module.exports = Cancion; 