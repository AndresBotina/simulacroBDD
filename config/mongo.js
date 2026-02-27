const mongoose = require('mongoose');

const connectMongo = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/saludplus');
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error Mongo:', error.message);
  }
};

mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado a:', mongoose.connection.name);
});

mongoose.connection.on('error', (err) => {
  console.error('Error en la conexión Mongo:', err);
});

module.exports = connectMongo;