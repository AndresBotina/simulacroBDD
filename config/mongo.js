const mongoose = require('mongoose');

/**
 * Connects to the MongoDB database using Mongoose.
 */
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saludplus');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Mongo Error:', error.message);
  }
};

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to:', mongoose.connection.name);
});

mongoose.connection.on('error', (err) => {
  console.error('Mongo connection error:', err);
});

module.exports = connectMongo;