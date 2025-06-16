const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Esquema del usuario
const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    fotoPerfil: {
        type: String,
        default: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    cancionesFavoritas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cancion'
    }],
    listasReproduccion: [{
        nombre: {
            type: String,
            required: true
        },
        canciones: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cancion'
        }],
        fechaCreacion: {
            type: Date,
            default: Date.now
        }
    }],
    historialReproduccion: [{
        cancion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cancion'
        },
        fechaReproduccion: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
userSchema.methods.compararPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Método para obtener un usuario sin la contraseña
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;


// 3132jovr7va5lto677yjzoymadpi