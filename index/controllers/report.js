// ESTÁS EN: index/controllers/report.js
// AQUÍ SE GENERAN REPORTES DE INGRESOS USANDO AGREGACIONES DE SQL
const pool = require('../../config/mysql'); // conexión a mysql

/**
 * GENERAR REPORTE DE INGRESOS (PASO 5: AGREGACÍON SQL)
 * PROPÓSITO: Calcular cuánto dinero ha ingresado a la clínica, con opción de filtrar por fechas.
 * FUNCIONAMIENTO:
 * 1. Definimos un rango de fechas opcional (startDate y endDate).
 * 2. Realizamos dos consultas de agregación (operaciones matemáticas sobre muchas filas):
 *    A. SUMA TOTAL: Sumamos todos los pagos de la tabla 'appointments'.
 *    B. DESGLOSE POR SEGURO: Usamos un JOIN para saber el nombre de la aseguradora 
 *       y sumamos los pagos agrupándolos por ese nombre (GROUP BY).
 * 3. Devolvemos ambos resultados en un solo objeto JSON.
 */
exports.getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query; // capturamos fechas de la url
        let whereClause = '';
        let params = [];

        // filtramos por fecha solo si el usuario envía ambas
        if (startDate && endDate) {
            whereClause = 'WHERE appointment_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        // AGREGACIÓN 1: Cálculo del ingreso bruto total
        // 'SUM' es una función de SQL que suma todos los valores de una columna
        const [totalRows] = await pool.query(`SELECT SUM(amount_paid) as totalRevenue FROM appointments ${whereClause}`, params);

        // AGREGACIÓN 2: Cálculo de ingresos por cada aseguradora
        // Combinamos la tabla de citas con la de seguros para obtener el nombre del seguro
        const [insuranceRows] = await pool.query(`
            SELECT i.name as insurance, SUM(a.amount_paid) as total 
            FROM appointments a 
            LEFT JOIN insurances i ON a.insurance_id = i.id 
            ${whereClause} 
            GROUP BY i.name
        `, params);

        // enviamos la respuesta estructurada
        res.json({
            totalRevenue: totalRows[0].totalRevenue || 0, // si no hay citas, devolvemos 0
            byInsurance: insuranceRows // array con el desglose
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating report' });
    }
};
