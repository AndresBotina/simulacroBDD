const pool = require('../config/mysql');

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
        console.error(error);
        res.status(500).json({ message: 'Error obteniendo médicos' });
    }
};