
CREATE DATABASE IF NOT EXISTS careplus_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE careplus_db;

CREATE TABLE IF NOT EXISTS patients (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) DEFAULT NULL,
  phone VARCHAR(25) DEFAULT NULL,
  dob DATE DEFAULT NULL,
  gender VARCHAR(30) DEFAULT NULL,
  blood_group VARCHAR(5) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctors (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  phone VARCHAR(25) DEFAULT NULL,
  email VARCHAR(150) DEFAULT NULL,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id INT UNSIGNED NOT NULL,
  doctor_id INT UNSIGNED NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(20) NOT NULL,
  reason VARCHAR(500) DEFAULT NULL,
  status ENUM('Scheduled','Completed','Cancelled') NOT NULL DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id)
    REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id)
    REFERENCES doctors(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS medical_records (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id INT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(80) DEFAULT NULL,
  record_date DATE DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_record_patient FOREIGN KEY (patient_id)
    REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id INT UNSIGNED NOT NULL,
  doctor_id INT UNSIGNED DEFAULT NULL,
  medication VARCHAR(150) NOT NULL,
  instructions TEXT NOT NULL,
  prescription_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rx_patient FOREIGN KEY (patient_id)
    REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_rx_doctor FOREIGN KEY (doctor_id)
    REFERENCES doctors(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bills (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id INT UNSIGNED NOT NULL,
  appointment_id INT UNSIGNED DEFAULT NULL,
  description VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  bill_date DATE NOT NULL,
  status ENUM('Pending','Paid') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id)
    REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_bill_appointment FOREIGN KEY (appointment_id)
    REFERENCES appointments(id) ON DELETE SET NULL
);

INSERT INTO doctors (full_name, department, fee)
SELECT 'Dr. Aarav Shah', 'Cardiology', 800
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE full_name='Dr. Aarav Shah');

INSERT INTO doctors (full_name, department, fee)
SELECT 'Dr. Meera Patel', 'Neurology', 900
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE full_name='Dr. Meera Patel');

INSERT INTO doctors (full_name, department, fee)
SELECT 'Dr. Rohan Desai', 'Orthopedics', 700
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE full_name='Dr. Rohan Desai');

INSERT INTO doctors (full_name, department, fee)
SELECT 'Dr. Nisha Mehta', 'Dermatology', 600
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE full_name='Dr. Nisha Mehta');

INSERT INTO doctors (full_name, department, fee)
SELECT 'Dr. Priya Joshi', 'Pediatrics', 700
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE full_name='Dr. Priya Joshi');

INSERT INTO doctors (full_name, department, fee)
SELECT 'Dr. Karan Shah', 'General Medicine', 500
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE full_name='Dr. Karan Shah');

INSERT INTO doctors (full_name, department, fee)
SELECT 'Dr. Anaya Trivedi', 'Dental', 500
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE full_name='Dr. Anaya Trivedi');