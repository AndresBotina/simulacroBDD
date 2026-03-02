// ESTÁS EN: index/controllers/doctor.js
// AQUÍ SE PROCESAN LAS SOLICITUDES RELACIONADAS CON LOS DOCTORES
const pool = require('../../config/mysql'); // conexión a sql
const PatientHistory = require('../../models/patientHistory'); // modelo de mongodb

/**
 * OBTENER TODOS LOS DOCTORES (PASO 5A: CONSULTA SQL)
 * PROPÓSITO: Recuperar la lista completa de doctores o filtrada por especialidad.
 * FUNCIONAMIENTO:
 * 1. Extraemos la "specialty" de los parámetros de búsqueda (query string).
 * 2. Preparamos una consulta SQL SELECT básica.
 * 3. Si hay una especialidad, agregamos la cláusula "WHERE" para que MySQL filtre los resultados.
 * 4. Ejecutamos la consulta usando el "pool" (un grupo de conexiones abiertas que ahorra tiempo).
 * 5. Enviamos la respuesta en formato JSON al cliente (el navegador).
 */
exports.getDoctors = async (req, res) => {
    try {
        const { specialty } = req.query; // capturamos el filtro de la url (ej: ?specialty=Cardiologia)
        let query = 'SELECT * FROM doctors';
        let params = [];

        if (specialty) {
            query += ' WHERE specialty = ?'; // usamos '?' por seguridad para evitar inyecciones sql
            params.push(specialty);
        }

        // realizamos la consulta asíncrona a la base de datos mysql
        const [rows] = await pool.query(query, params);
        res.json(rows); // respondemos con los datos encontrados
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving doctors' });
    }
};

/**
 * OBTENER UN DOCTOR POR ID (PASO 5C: CONSULTA SQL POR ID)
 * PROPÓSITO: Mostrar el detalle de un solo médico utilizando su ID único.
 * FUNCIONAMIENTO:
 * 1. Tomamos el ID que viene en la URL (req.params.id).
 * 2. Ejecutamos un SELECT con un "WHERE id = ?".
 * 3. Si no hay resultados (rows.length === 0), respondemos con un error 404 (No Encontrado).
 * 4. Si existe, devolvemos solo el primer objeto del array resultante.
 */
exports.getDoctorById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Not found' }); // el doctor con ese id no existe
        }

        res.json(rows[0]); // enviamos el doctor solicitado
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving the doctor' });
    }
};

/**
 * CREAR UN DOCTOR (PASO 5B: INSERCIÓN EN SQL)
 * PROPÓSITO: Registrar un nuevo médico en el sistema.
 * FUNCIONAMIENTO:
 * 1. Recibimos el nombre, correo y especialidad desde el JSON que envía el frontend.
 * 2. Validamos que el usuario haya llenado todos los campos básicos.
 * 3. Intentamos insertar el nuevo registro en la tabla 'doctors' de MySQL.
 * 4. MySQL genera automáticamente un nuevo ID (AUTO_INCREMENT).
 * 5. Devolvemos un código 201 (Creado) junto con el ID generado.
 */
exports.createDoctor = async (req, res) => {
    try {
        const { name, email, specialty } = req.body; // desestructuramos los datos del cuerpo de la petición

        // comprobación manual para evitar entradas vacías
        if (!name || !email || !specialty) {
            return res.status(400).json({ message: 'Nombre, email y especialidad son obligatorios' });
        }

        // guardamos en sql. el orden de los campos debe coincidir con los values
        const [result] = await pool.query(
            'INSERT INTO doctors (name, email, specialty) VALUES (?, ?, ?)',
            [name, email, specialty]
        );

        // respondemos al cliente que la operación fue exitosa
        res.status(201).json({
            message: 'Doctor creado exitosamente',
            id: result.insertId // enviamos el nuevo id para que el frontend lo sepa
        });
    } catch (error) {
        // controlamos el error de correo duplicado para dar una respuesta amigable
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }
        res.status(500).json({ message: 'Error al crear el doctor' });
    }
};

/**
 * ACTUALIZAR UN DOCTOR (PASO 5D: SINCRONIZACIÓN HÍBRIDA SQL + NOSQL)
 * PROPÓSITO: Cambiar los datos de un médico y asegurar que el cambio se vea en todas partes.
 * FUNCIONAMIENTO:
 * 1. Buscamos el nombre actual del doctor en MySQL antes del cambio.
 * 2. Ejecutamos el UPDATE en MySQL (fuente de verdad relacional).
 * 3. Si el nombre cambió (ej: de "Dr. Juan" a "Juan Perez"), debemos actualizar 
 *    el campo "doctorName" en la base de datos MongoDB (PatientHistory).
 * 4. Esto es CRUCIAL porque en MongoDB guardamos el nombre directamente 
 *    para que las búsquedas de pacientes sean súper rápidas.
 */
exports.updateDoctor = async (req, res) => {
    try {
        const { name, specialty } = req.body;
        const doctorId = req.params.id;

        // A. primero consultamos cómo se llama ahora para comparar luego
        const [current] = await pool.query('SELECT name FROM doctors WHERE id = ?', [doctorId]);
        if (current.length === 0) return res.status(404).json({ message: 'Not found' });
        const oldName = current[0].name; // guardamos el nombre anterior

        // B. actualizamos los datos en la tabla relacional mysql
        await pool.query(
            'UPDATE doctors SET name = ?, specialty = ? WHERE id = ?',
            [name, specialty, doctorId]
        );

        // C. SINCRONIZACIÓN CROSS-DB: Sincronizamos con NoSQL (MongoDB).
        // Si no hiciéramos esto, las historias clínicas verían el nombre viejo del doctor.
        if (name !== oldName) {
            // usamos updateMany para cambiar el nombre en todas las citas donde aparezca
            await PatientHistory.updateMany(
                { 'appointments.doctorName': oldName }, // busca citas con el nombre viejo
                { $set: { 'appointments.$[elem].doctorName': name } }, // pone el nombre nuevo
                { arrayFilters: [{ 'elem.doctorName': oldName }] } // aplica el filtro dentro del array
            );
        }

        res.json({ message: 'Successfully updated in SQL and MongoDB' });
    } catch (error) {
        res.status(500).json({ message: 'Update error' });
    }
};

/**
 * ELIMINAR UN DOCTOR (PASO 5E: BORRADO EN CASCADA SQL)
 * PROPÓSITO: Borrar a un médico de la base de datos definitivamente.
 * FUNCIONAMIENTO:
 * 1. Intentamos ejecutar un DELETE en MySQL por su ID.
 * 2. Si el doctor tiene citas, el sistema por defecto podría fallar por integridad.
 * 3. Si la base de datos está en "ON DELETE CASCADE", MySQL borrará también las citas.
 * 4. Si se borra algo (affectedRows > 0), avisamos al frontend.
 */
exports.deleteDoctor = async (req, res) => {
    try {
        // realizamos la eliminación física en la tabla doctors
        const [result] = await pool.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doctor no encontrado' });
        }

        res.json({ message: 'Doctor eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el doctor' });
    }
};
