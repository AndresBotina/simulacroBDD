const mongoose = require('mongoose');

/**
 * Schema for medical appointments within the history.
 * _id is disabled to avoid technical redundancy issues in denormalized arrays.
 */
const appointmentSchema = new mongoose.Schema({
    appointmentId: String,
    date: Date,
    doctorName: String,
    specialty: String,
    treatmentDescription: String,
    amountPaid: Number
}, { _id: false });

/**
 * Main Clinical History schema.
 * This document represents the "aggregated" view of a patient, optimized for fast reads.
 */
const patientHistorySchema = new mongoose.Schema({
    patientEmail: {
        type: String,
        required: true,
        unique: true // Key identifier for searching histories
    },
    patientName: String,
    appointments: [appointmentSchema] // Denormalized array of appointments
});

module.exports = mongoose.model('PatientHistory', patientHistorySchema);
