// AQUÍ EMPIEZA TODO: ESTE ES EL PUNTO DE ENTRADA DE TU APLICACIÓN
// PRIMERO: SE CARGAN LAS VARIABLES DE ENTORNO Y LAS DEPENDENCIAS NECESARIAS
require('dotenv').config(); // carga las variables del archivo .env
const express = require('express'); // importa el framework express para el servidor
const connectMongo = require('./config/mongo'); // trae la función para conectar a mongodb
const pool = require('./config/mysql'); // trae el grupo de conexiones para mysql

const app = express(); // inicializa la aplicación de express

/**
 * Middleware para procesar JSON en el cuerpo de las peticiones
 */
app.use(express.json()); // permite que el servidor entienda datos en formato json

// PASO 1.5: SERVIR ARCHIVOS ESTÁTICOS (FRONTEND)
// ESTO PERMITE QUE EL NAVEGADOR CARGUE EL index.html DE LA CARPETA "public"
app.use(express.static('public'));

// PASO 2: INICIALIZAR LA CONEXIÓN A LA BASE DE DATOS NOSQL (MONGODB)
// SI QUIERES VER CÓMO SE CONECTA, VE AL ARCHIVO "config/mongo.js"
connectMongo(); // ejecuta la conexión definida en la carpeta config

// PASO 3: DEFINICIÓN DE LAS RUTAS DE LA API
// AQUÍ DICES QUÉ "CAMINO" O URL DEBE SEGUIR EL USUARIO PARA LLEGAR A CIERTA LÓGICA
const migrationRoutes = require('./routes/migration'); // lógica para importar datos desde CSV
const doctorsRoutes = require('./routes/doctors');     // gestión de doctores (SQL + Sincronización NoSQL)
const reportsRoutes = require('./routes/reports');     // reportes financieros (Agregaciones SQL)
const patientsRoutes = require('./routes/patients');   // búsqueda de historias (NoSQL)

// MONTAJE DE RUTAS: AQUÍ ASIGNAS UN PREFIJO (/api) A CADA GRUPO DE RUTAS
// DESPUÉS DE AQUÍ, DEBES IR A LOS ARCHIVOS EN LA CARPETA "routes/" PARA SEGUIR EL CAMINO
app.use('/api', migrationRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/patients', patientsRoutes);

// PASO FINAL: ARRANCAR EL SERVIDOR
// ESTE ES EL FINAL DEL ORDEN LÓGICO DE CONFIGURACIÓN
const PORT = process.env.PORT || 3000; // define el puerto (usando variable de entorno o por defecto 3000)
app.listen(PORT, () => {
    console.log(`SaludPlus server running on port ${PORT}`);
});
