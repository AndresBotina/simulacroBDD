const pool = require('../../config/mysql');

/**
 * Controller to generate revenue reports.
 * Provides total revenue and a breakdown by insurance provider.
 */
exports.getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let whereClause = '';
        let params = [];

        // Optional date range filtering
        if (startDate && endDate) {
            whereClause = 'WHERE appointment_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        // Global revenue aggregation
        const [totalRows] = await pool.query(`SELECT SUM(amount_paid) as totalRevenue FROM appointments ${whereClause}`, params);

        // Revenue breakdown by insurance provider
        const [insuranceRows] = await pool.query(`
            SELECT i.name as insurance, SUM(a.amount_paid) as total 
            FROM appointments a 
            LEFT JOIN insurances i ON a.insurance_id = i.id 
            ${whereClause} 
            GROUP BY i.name
        `, params);

        res.json({
            totalRevenue: totalRows[0].totalRevenue || 0,
            byInsurance: insuranceRows
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating report' });
    }
};
