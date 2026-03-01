const pool = require('../../config/mysql');
const PatientHistory = require('../../models/patientHistory');

/**
 * Processes a CSV row to migrate it to MySQL and MongoDB using a hybrid approach.
 * Ensures idempotency using ON DUPLICATE KEY UPDATE in MySQL 
 * and a pull/push strategy in MongoDB.
 * 
 * @param {Object} row - Object containing data from a CSV row.
 */
async function processRow(row) {
    console.log(`Processing row: ${row.appointment_id}`);
    try {
        let insuranceId = null;
        // Clean and normalize insurance data
        const insuranceName = row.insurance_provider ? row.insurance_provider.trim() : 'NoInsurance';
        const coverage = parseFloat(row.coverage_percentage) || 0;

        // 1. Insurance Management (MySQL)
        if (insuranceName && insuranceName !== 'NoInsurance') {
            await pool.query(`
                INSERT INTO insurances (name, coverage_percentage)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE coverage_percentage = VALUES(coverage_percentage)
            `, [insuranceName, coverage]);

            // Retrieve generated or existing ID
            const [insurance] = await pool.query(
                'SELECT id FROM insurances WHERE name = ?',
                [insuranceName]
            );
            insuranceId = insurance[0].id;
        }

        // 2. Patient Management (MySQL)
        // Identify patient by email (Unique)
        await pool.query(`
            INSERT INTO patients (name, email, phone, address)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                phone = VALUES(phone),
                address = VALUES(address)
        `, [row.patient_name, row.patient_email, row.patient_phone, row.patient_address]);

        const [patient] = await pool.query(
            'SELECT id FROM patients WHERE email = ?',
            [row.patient_email]
        );
        const patientId = patient[0].id;

        // 3. Doctor Management (MySQL)
        // Identify doctor by email (Unique)
        await pool.query(`
            INSERT INTO doctors (name, email, specialty)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE specialty = VALUES(specialty)
        `, [row.doctor_name, row.doctor_email, row.specialty]);

        const [doctor] = await pool.query(
            'SELECT id FROM doctors WHERE email = ?',
            [row.doctor_email]
        );
        const doctorId = doctor[0].id;

        // 4. Appointment Management (MySQL)
        // Idempotency key is appointment_id
        await pool.query(`
            INSERT INTO appointments (
                appointment_id, appointment_date, patient_id, doctor_id, 
                insurance_id, treatment_code, treatment_description, 
                treatment_cost, amount_paid
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                amount_paid = VALUES(amount_paid),
                treatment_description = VALUES(treatment_description),
                treatment_cost = VALUES(treatment_cost)
        `, [
            row.appointment_id, row.appointment_date, patientId, doctorId,
            insuranceId, row.treatment_code, row.treatment_description,
            parseFloat(row.treatment_cost) || 0, parseFloat(row.amount_paid) || 0
        ]);

        // 5. Denormalized Clinical History (MongoDB)
        // Strategy: "Pull and Push" to ensure real idempotency in arrays

        // Step 1: Remove the appointment if it already exists to prevent subdocument duplication
        await PatientHistory.updateOne(
            { patientEmail: row.patient_email },
            { $pull: { appointments: { appointmentId: row.appointment_id } } }
        );

        // Step 2: Insert the most recent version of the appointment
        await PatientHistory.updateOne(
            { patientEmail: row.patient_email },
            {
                $set: { patientName: row.patient_name },
                $push: {
                    appointments: {
                        appointmentId: row.appointment_id,
                        date: row.appointment_date,
                        doctorName: row.doctor_name,
                        specialty: row.specialty,
                        treatmentDescription: row.treatment_description,
                        amountPaid: parseFloat(row.amount_paid) || 0
                    }
                }
            },
            { upsert: true } // Create patient document if it doesn't exist
        );
    } catch (error) {
        console.error(`Error processing row ${row.appointment_id}:`, error.message);
        throw error;
    }
}

module.exports = { processRow };
