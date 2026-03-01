const PatientHistory = require('../../models/patientHistory');

/**
 * Controller to retrieve a patient's complete clinical history from MongoDB.
 */
exports.getHistoryByEmail = async (req, res) => {
    try {
        const history = await PatientHistory.findOne({ patientEmail: req.params.email });
        if (!history) return res.status(404).json({ message: 'History not found' });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving patient history' });
    }
};
