// ESTÁS EN: config/mongo.js
// ESTE ARCHIVO ES LLAMADO DESDE app.js EN EL "PASO 2"
const mongoose = require('mongoose'); // librería para manejar mongodb

/**
 * Función que establece la conexión con la base de datos MongoDB.
 */
const connectMongo = async () => {
  try {
    // usa la uri de las variables de entorno o una local por defecto
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saludplus');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Mongo Error:', error.message);
  }
};

// eventos para monitorear el estado de la conexión
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to:', mongoose.connection.name);
});

mongoose.connection.on('error', (err) => {
  console.error('Mongo connection error:', err);
});

// DESPUÉS DE ESTO, EL CAMINO VUELVE A app.js PARA SEGUIR CON LAS RUTAS
module.exports = connectMongo;