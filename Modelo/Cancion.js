const mongoose = require('mongoose');

const cancionSchema = new mongoose.Schema({
    trackId: {
        type: String,
        required: true,
        unique: true
    },
    trackName: {
        type: String,
        required: true
    },
    artistName: {
        type: String,
        required: true
    },
    collectionName: {
        type: String,
        required: true
    },
    artworkUrl100: {
        type: String,
        required: true
    },
    previewUrl: {
        type: String,
        required: true
    },
    trackTimeMillis: {
        type: Number,
        required: true
    },
    primaryGenreName: {
        type: String,
        required: true
    },
    releaseDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Método para formatear la duración
cancionSchema.methods.formatearDuracion = function() {
    const minutos = Math.floor(this.trackTimeMillis / 60000);
    const segundos = Math.floor((this.trackTimeMillis % 60000) / 1000);
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
};

// Método para obtener la URL de la imagen en mejor calidad
cancionSchema.methods.getArtworkUrl = function() {
    return this.artworkUrl100.replace('100x100', '600x600');
};

const Cancion = mongoose.model('Cancion', cancionSchema);

module.exports = Cancion; 