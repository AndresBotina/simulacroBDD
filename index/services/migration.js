// ESTÁS EN EL CORAZÓN DE LA MIGRACIÓN: index/services/migration.js
// AQUÍ SE DEFINE CÓMO UNA FILA DEL CSV SE REPARTE ENTRE MYSQL Y MONGODB
const pool = require('../../config/mysql');
const PatientHistory = require('../../models/patientHistory');

/**
 * PROCESAR FILA DEL CSV (PASO 6: LÓGICA DE MIGRACIÓN HÍBRIDA)
 * PROPÓSITO: Leer una línea del archivo Excel/CSV y guardarla en ambos mundos (SQL y NoSQL).
 * FUNCIONAMIENTO:
 * Esta función es el "puente" que une MySQL y MongoDB. Sigue 5 pasos críticos:
 */
async function processRow(row) {
    console.log(`Processing row: ${row.appointment_id}`);
    try {
        let insuranceId = null;
        const insuranceName = row.insurance_provider ? row.insurance_provider.trim() : 'NoInsurance';
        const coverage = parseFloat(row.coverage_percentage) || 0;

        // PASO 6.1: GESTIÓN DE SEGUROS (MySQL)
        // Usamos "ON DUPLICATE KEY UPDATE" para que si el seguro ya existe, solo se actualice la cobertura.
        if (insuranceName && insuranceName !== 'NoInsurance') {
            await pool.query(`
                INSERT INTO insurances (name, coverage_percentage)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE coverage_percentage = VALUES(coverage_percentage)
            `, [insuranceName, coverage]);

            // obtenemos el ID generado por MySQL para usarlo como llave foránea después
            const [insurance] = await pool.query(
                'SELECT id FROM insurances WHERE name = ?',
                [insuranceName]
            );
            insuranceId = insurance[0].id;
        }

        // PASO 6.2: GESTIÓN DE PACIENTES (MySQL)
        // Si el paciente ya existe (mismo email), actualizamos sus datos de contacto.
        await pool.query(`
            INSERT INTO patients (name, email, phone, address)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), address = VALUES(address)
        `, [row.patient_name, row.patient_email, row.patient_phone, row.patient_address]);

        const [patient] = await pool.query('SELECT id FROM patients WHERE email = ?', [row.patient_email]);
        const patientId = patient[0].id;

        // PASO 6.3: GESTIÓN DE DOCTORES (MySQL)
        // Guardamos la información oficial del doctor. La base de verdad es SQL.
        await pool.query(`
            INSERT INTO doctors (name, email, specialty)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE specialty = VALUES(specialty)
        `, [row.doctor_name, row.doctor_email, row.specialty]);

        const [doctor] = await pool.query('SELECT id FROM doctors WHERE email = ?', [row.doctor_email]);
        const doctorId = doctor[0].id;

        // PASO 6.4: REGISTRO DE LA CITA MÉDICA (MySQL - RELACIONAL)
        // Aquí unimos todo usando los IDs que recuperamos en los pasos anteriores (Foreign Keys).
        await pool.query(`
            INSERT INTO appointments (
                appointment_id, appointment_date, patient_id, doctor_id, 
                insurance_id, treatment_code, treatment_description, 
                treatment_cost, amount_paid
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE amount_paid = VALUES(amount_paid), treatment_description = VALUES(treatment_description)
        `, [
            row.appointment_id, row.appointment_date, patientId, doctorId,
            insuranceId, row.treatment_code, row.treatment_description,
            parseFloat(row.treatment_cost) || 0, parseFloat(row.amount_paid) || 0
        ]);

        // PASO 6.5: HISTORIA CLÍNICA DESNORMALIZADA (MongoDB - NoSQL)
        // ESTRATEGIA: "Eliminar y Re-insertar" para evitar datos duplicados en los arrays.
        // Aquí guardamos el nombre del doctor DIRECTAMENTE (Denormalización).

        // A. Limpia la cita si ya existía para evitar duplicados en el array de 'appointments'
        await PatientHistory.updateOne(
            { patientEmail: row.patient_email },
            { $pull: { appointments: { appointmentId: row.appointment_id } } }
        );

        // B. Inserta la versión más actualizada de la cita en el expediente del paciente
        await PatientHistory.updateOne(
            { patientEmail: row.patient_email },
            {
                $set: { patientName: row.patient_name }, // asegura que el nombre del paciente sea el correcto
                $push: {
                    appointments: { // agregamos la cita al array de MongoDB
                        appointmentId: row.appointment_id,
                        date: row.appointment_date,
                        doctorName: row.doctor_name, // guardamos el nombre, no solo el ID
                        specialty: row.specialty,
                        treatmentDescription: row.treatment_description,
                        amountPaid: parseFloat(row.amount_paid) || 0
                    }
                }
            },
            { upsert: true } // si el paciente no tiene documento en Mongo, créalo automáticamente
        );
    } catch (error) {
        console.error(`Error processing row ${row.appointment_id}:`, error.message);
        throw error;
    }
}

module.exports = { processRow };
