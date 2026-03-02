// ESTÁS EN EL CAMINO: routes/doctors.js
// AQUÍ SE DEFINEN LAS RUTAS PARA GESTIONAR LA INFORMACIÓN DE LOS DOCTORES
const express = require('express');
const router = express.Router();
const doctorController = require('../index/controllers/doctor'); // importa el controlador de doctores

// DEFINICIÓN DE PUNTOS DE ENTRADA (ENDPOINTS)
// EL CAMINO AQUÍ SALTA AL ARCHIVO "index/controllers/doctor.js"
// 1. OBTENER TODOS LOS DOCTORES (PASO 4A)
router.get('/', doctorController.getDoctors); // ruta para obtener todos los doctores

// 2. CREAR UN NUEVO DOCTOR (PASO 4B)
router.post('/', doctorController.createDoctor); // ruta para insertar un nuevo doctor en SQL

// 3. OBTENER UN DOCTOR POR ID (PASO 4C)
router.get('/:id', doctorController.getDoctorById); // ruta para obtener un doctor por su ID de SQL

// 4. ACTUALIZAR UN DOCTOR Y SINCRONIZAR (PASO 4D)
router.put('/:id', doctorController.updateDoctor); // ruta para actualizar y sincronizar con NoSQL

// 5. ELIMINAR UN DOCTOR (PASO 4E)
router.delete('/:id', doctorController.deleteDoctor); // ruta para borrar un doctor de SQL

module.exports = router;