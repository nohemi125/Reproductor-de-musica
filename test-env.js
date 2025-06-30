require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

// Script para verificar la configuración del entorno
console.log('=== Verificación de configuración ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Configurada' : 'No configurada');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'Configurada' : 'No configurada');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'No configurada');
console.log('=== Fin de verificación ===');
