// ESTÁS EN: index/controllers/patient.js
// AQUÍ SE BUSCA LA INFORMACIÓN DENORMALIZADA EN MONGODB
const PatientHistory = require('../../models/patientHistory'); // modelo de la historia clínica

/**
 * OBTENER HISTORIA POR EMAIL (PASO 5: CONSULTA NOSQL / MONGODB)
 * PROPÓSITO: Recuperar el expediente completo de un paciente desde la base de datos NoSQL.
 * FUNCIONAMIENTO:
 * 1. Recibimos el "email" como parámetro único en la URL.
 * 2. Usamos el modelo "PatientHistory" para buscar en la colección de MongoDB.
 * 3. A diferencia de SQL, aquí no hacemos JOINs. El documento ya contiene un array 
 *    con todas las citas (denormalización) lo que hace la lectura instantánea.
 * 4. Si el paciente no tiene historia clínica registrada, devolvemos un error 404.
 */
exports.getHistoryByEmail = async (req, res) => {
    try {
        // realizamos la búsqueda en mongodb filtrando por el campo indexado 'patientEmail'
        const history = await PatientHistory.findOne({ patientEmail: req.params.email });

        // validamos si encontramos el documento en la base de datos nosql
        if (!history) {
            return res.status(404).json({ message: 'History not found for this email' });
        }

        // enviamos el documento completo (incluyendo el array de citas 'appointments')
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving patient history from MongoDB' });
    }
};
