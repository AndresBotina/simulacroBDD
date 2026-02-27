CREATE DATABASE IF NOT EXISTS salud_plus;
USE salud_plus;

-- Tabla pacientes
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(255)
);

-- Tabla doctores
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    specialty VARCHAR(100) NOT NULL
);

-- Tabla seguros
CREATE TABLE insurances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    coverage_percentage DECIMAL(5,2) NOT NULL
);

-- Tabla citas
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id VARCHAR(50) NOT NULL,
    appointment_date DATETIME NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    insurance_id INT NULL,
    treatment_code VARCHAR(50) NOT NULL,
    treatment_description TEXT,
    treatment_cost DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_patient
        FOREIGN KEY (patient_id) REFERENCES patients(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_doctor
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_insurance
        FOREIGN KEY (insurance_id) REFERENCES insurances(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);