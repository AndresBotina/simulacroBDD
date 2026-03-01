# SaludPlus Hybrid Backend Migration API

## Overview
SaludPlus is a professional backend API designed to manage and migrate clinical data using a hybrid architecture. It leverages both relational (MySQL) and document-oriented (MongoDB) databases to ensure data integrity and high performance for clinical history retrieval.

## Architecture Decisions
- **MySQL**: Used as the primary source of truth for structured data (Patients, Doctors, Insurances, and Appointments). Ensures referential integrity and is normalized to 3FN.
- **MongoDB**: Used for denormalized Patient Clinical History. This allows for fast, O(1) retrieval of a patient's entire medical record without complex SQL joins.
- **Idempotency**: The migration service uses `ON DUPLICATE KEY UPDATE` in MySQL and a `pull/push` strategy in MongoDB to ensure that re-running the migration for the same data does not create duplicates.
- **Synchronization**: When a doctor's name is updated in the SQL database, the system automatically propagates this change to all corresponding records in MongoDB to maintain consistency.

## Tech Stack
- **Node.js + Express**
- **MySQL (mysql2/promise)**
- **MongoDB (Mongoose)**
- **CSV Parser**

## Project Structure
```text
simulacro/
├── config/             # Database connection settings
├── data/               # Source CSV data (ignored by git)
├── index/
│   ├── controllers/    # Business logic for requests
│   └── services/       # Core migration and processing logic
├── models/             # NoSQL database schemas
├── routes/             # API Endpoint definitions
├── SQL/                # SQL initialization scripts
└── app.js              # Server entry point
```

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- MySQL Server (running on port 3306)
- MongoDB Server (running on port 27017)

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=salud_plus
MONGO_URI=mongodb://127.0.0.1:27017/saludplus
```

### 3. Installation
```bash
npm install
```

### 4. Database Setup
Execute the contents of `SQL/sql_tables.sql` in your MySQL client to create the database and tables.

### 5. Running the Application
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Data Migration
- `POST /api/migration`: Triggers the processing of the CSV file in `data/` and fills both databases.

### Doctors
- `GET /api/doctors`: Get all doctors (Optional query: `?specialty=X`).
- `GET /api/doctors/:id`: Get specific doctor details.
- `PUT /api/doctors/:id`: Update doctor name or specialty (Syncs with MongoDB).

### Patients
- `GET /api/patients/:email/history`: Retrieve the full denormalized history from MongoDB.

### Reports
- `GET /api/reports/revenue`: Financial report (Optional query: `?startDate=Y-m-d&endDate=Y-m-d`).
