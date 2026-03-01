const pool = require('../../config/mysql');
const PatientHistory = require('../../models/patientHistory');

/**
 * Retrieves the list of doctors. Allows filtering by specialty via query string.
 */
exports.getDoctors = async (req, res) => {
    try {
        const { specialty } = req.query;
        let query = 'SELECT * FROM doctors';
        let params = [];
        if (specialty) {
            query += ' WHERE specialty = ?';
            params.push(specialty);
        }
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving doctors' });
    }
};

/**
 * Retrieves a specific doctor by their MySQL ID.
 */
exports.getDoctorById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving the doctor' });
    }
};

/**
 * Updates a doctor's data and ensures cross-consistency.
 * If the doctor's name changes, all their mentions in MongoDB are updated.
 */
exports.updateDoctor = async (req, res) => {
    try {
        const { name, specialty } = req.body;
        const doctorId = req.params.id;

        // 1. Get current name for synchronization later
        const [current] = await pool.query('SELECT name FROM doctors WHERE id = ?', [doctorId]);
        if (current.length === 0) return res.status(404).json({ message: 'Not found' });
        const oldName = current[0].name;

        // 2. Update in MySQL (Relational Source of Truth)
        await pool.query(
            'UPDATE doctors SET name = ?, specialty = ? WHERE id = ?',
            [name, specialty, doctorId]
        );

        // 3. Cross-DB Synchronization (MongoDB Consistency)
        // If the name changed, update all histories where this doctor appears
        if (name !== oldName) {
            await PatientHistory.updateMany(
                { 'appointments.doctorName': oldName },
                { $set: { 'appointments.$[elem].doctorName': name } },
                { arrayFilters: [{ 'elem.doctorName': oldName }] }
            );
        }

        res.json({ message: 'Successfully updated in SQL and MongoDB' });
    } catch (error) {
        res.status(500).json({ message: 'Update error' });
    }
};
