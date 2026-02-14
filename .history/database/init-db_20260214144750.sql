-- ============================================
-- GLOBAL PATIENT TRACK SYSTEM - INITIALIZATION
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS global_patient_track_db;
USE global_patient_track_db;

-- ============================================
-- 1. ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(100),
  active BIT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. USERSDATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS usersdata (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  email VARCHAR(100),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50),
  organization_id BIGINT,
  active BIT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ============================================
-- 3. PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  age INT,
  gender VARCHAR(10),
  blood_type VARCHAR(10),
  phone VARCHAR(20),
  address VARCHAR(255),
  medical_history TEXT,
  current_medications TEXT,
  patient_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usersdata(id) ON DELETE CASCADE
);

-- ============================================
-- 4. PATIENT_HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT,
  doctor_id BIGINT,
  visit_date DATETIME,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  medications JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES usersdata(id) ON DELETE SET NULL
);

-- ============================================
-- 5. OAUTH_TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  access_token VARCHAR(500) UNIQUE,
  refresh_token VARCHAR(500) UNIQUE,
  username VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  access_token_expires_at DATETIME NOT NULL,
  refresh_token_expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME,
  active BIT DEFAULT 1
);

-- ============================================
-- 6. INSERT ORGANIZATIONS DATA
-- ============================================
INSERT IGNORE INTO organizations (id, name, code, description, address, phone, email, active, created_at, updated_at) VALUES
(1, 'Metro Medical Center', 'MMC', 'Main medical center', '123 Main St, City', '555-0001', 'admin@mmc.com', b'1', NOW(), NOW()),
(2, 'Downtown Hospital', 'DHC', 'Downtown location', '456 Park Ave, City', '555-0002', 'admin@dhc.com', b'1', NOW(), NOW());

-- ============================================
-- 7. USERS (with UNIQUE passwords for each user)
-- ============================================
-- MMC (Organization 1) Users - EACH USER HAS UNIQUE PASSWORD
INSERT IGNORE INTO usersdata (id, username, password, email, first_name, last_name, role, organization_id, active, created_at, updated_at) VALUES
-- Admin MMC (password: AdminMMC@2026)
(1, 'admin_mmc', '$2b$10$nOOqCRsAv5cd9f2x6GqxVe0ww/Jo8w2E54tBZ1Edm8Gj15LBYi9zO', 'admin@mmc.com', 'Admin', 'MMC', 'ADMIN', 1, b'1', NOW(), NOW()),
-- Doctors MMC - EACH HAS UNIQUE PASSWORD
(2, 'doctor_mmc_1', '$2b$10$NNGq/PExmQnqE17Fv58P8Oh3Ohlaqi7HtHtIItQsNC7/0W/0AgjTW', 'doctor1@mmc.com', 'Dr. Sarah', 'Johnson', 'DOCTOR', 1, b'1', NOW(), NOW()),
(3, 'doctor_mmc_2', '$2b$10$hHuWPRqXPUvyPHKG5HLy6.LRMOEHXBE5Lg6/i6RJRNFh8FqDbYLx.', 'doctor2@mmc.com', 'Dr. Emily', 'Brown', 'DOCTOR', 1, b'1', NOW(), NOW()),
(4, 'doctor_mmc_3', '$2b$10$y72QHPfii/3yYyKNBOxYBu8f5PEzaz55Guzrf/gYRYkXjvYEqIATi', 'doctor3@mmc.com', 'Dr. Michael', 'Davis', 'DOCTOR', 1, b'1', NOW(), NOW()),
(5, 'doctor_mmc_4', '$2b$10$w2QEsY28eyFTemZbj3Nj6eT2lEwAEdX6EaXmb/85lDgextoT5SUjq', 'doctor4@mmc.com', 'Dr. James', 'Miller', 'DOCTOR', 1, b'1', NOW(), NOW()),
-- Patients MMC - EACH HAS UNIQUE PASSWORD
(6, 'patient_mmc_1', '$2b$10$Mp2YMBRvbEYnGGIMtxGaluOx4JnVCUn1Bw9WlXlM51ZSn3P74xh66', 'patient1@mmc.com', 'Alice', 'Taylor', 'PATIENT', 1, b'1', NOW(), NOW()),
(7, 'patient_mmc_2', '$2b$10$iYyTMB3BPUXPquPSCTn.fO2m/pJ7Gjy7qk.tYdV6SGPk1IE6otn1C', 'patient2@mmc.com', 'Bob', 'Martin', 'PATIENT', 1, b'1', NOW(), NOW()),
(8, 'patient_mmc_3', '$2b$10$ozGhAZVhqG6nwTtyIgWSwObDgoUeCr9uzaPzG5.1qoKLeR4/maK12', 'patient3@mmc.com', 'Carol', 'White', 'PATIENT', 1, b'1', NOW(), NOW()),
(9, 'patient_mmc_4', '$2b$10$GSi7Cl.IgNl7jhrwUPdvN.sFy8yj5xVjYlC7uGjzuBgWur7bEezRS', 'patient4@mmc.com', 'David', 'Green', 'PATIENT', 1, b'1', NOW(), NOW()),
-- Lab Technicians MMC - EACH HAS UNIQUE PASSWORD
-- tech_mmc_1 (password: TechJohn@2026)
(15, 'tech_mmc_1', '$2a$10$CfGkzEzADlBwGIbdOVC5yeLvqeVVLdnFUydP8NPO4mhqyLjtkKqyu', 'tech1@mmc.com', 'John', 'Tech', 'LABTECHNICIAN', 1, b'1', NOW(), NOW()),
-- tech_mmc_2 (password: TechJane@2026)
(16, 'tech_mmc_2', '$2a$10$miTLYcCohy80nUOc8sSG.eUoq2YukfrA.Ey5bP1Jae.6r1Z/2v1QG', 'tech2@mmc.com', 'Jane', 'Technician', 'LABTECHNICIAN', 1, b'1', NOW(), NOW()),

-- DHC (Organization 2) Users - EACH USER HAS UNIQUE PASSWORD
-- Admin DHC (password: AdminDHC@2026)
(10, 'admin_dhc', '$2b$10$ct6olSgVeUzvdh.bHH05c.9vXeFpC3OkOQoEyDCOBvh2jNQRg2Es2', 'admin@dhc.com', 'Admin', 'DHC', 'ADMIN', 2, b'1', NOW(), NOW()),
-- Doctors DHC - EACH HAS UNIQUE PASSWORD
(11, 'doctor_dhc_1', '$2b$10$/fuUijLJSyKkmpm3l43TNe2p4/eYoZK/V1yh22D8r6ZW6Gg75preu', 'doctor1@dhc.com', 'Dr. Robert', 'Wilson', 'DOCTOR', 2, b'1', NOW(), NOW()),
(12, 'doctor_dhc_2', '$2b$10$NOUEdoJUmDpNIj1Kua5.0O8CRo.eNeG1PGSOvuqUNgI/ynp6dprR2', 'doctor2@dhc.com', 'Dr. Jennifer', 'Lee', 'DOCTOR', 2, b'1', NOW(), NOW()),
-- Patients DHC - EACH HAS UNIQUE PASSWORD
(13, 'patient_dhc_1', '$2b$10$2DHFZFd0PXomkz4JbdnOS.5cFsIkTkrtVTDz1F90B0gYpDfikN8OC', 'patient1@dhc.com', 'Frank', 'Miller', 'PATIENT', 2, b'1', NOW(), NOW()),
(14, 'patient_dhc_2', '$2b$10$YkiK1xUVJNGfehncks3XbeQ3APjZxeLB3/G/tue0Ou.1Iuli8qKwS', 'patient2@dhc.com', 'Grace', 'Robinson', 'PATIENT', 2, b'1', NOW(), NOW());

-- ============================================
-- 8. PATIENTS (Doctor-accessible patient data)
-- ============================================
INSERT IGNORE INTO patients (id, user_id, age, gender, blood_type, phone, address, medical_history, current_medications, patient_name, created_at, updated_at) VALUES
-- MMC Patients
(1, 6, 42, 'F', 'AB+', '555-0101', '789 Oak St', 'Migraine headaches - frequent. Food allergies (nuts, shellfish).', 'Sumatriptan 50mg as needed, Topiramate 100mg daily', 'Alice Taylor', NOW(), NOW()),
(2, 7, 58, 'M', 'O-', '555-0102', '321 Elm St', 'Hypertension. High cholesterol. Previous MI in 2020.', 'Lisinopril 10mg daily, Atorvastatin 20mg daily', 'Bob Martin', NOW(), NOW()),
(3, 8, 35, 'F', 'A-', '555-0103', '654 Maple Ave', 'Type 2 Diabetes. Obesity.', 'Metformin 1000mg twice daily', 'Carol White', NOW(), NOW()),
(4, 9, 28, 'M', 'B+', '555-0104', '987 Pine Rd', 'Seasonal allergies. Asthma (mild).', 'Albuterol inhaler as needed, Cetirizine 10mg daily', 'David Green', NOW(), NOW()),

-- DHC Patients
(5, 13, 55, 'M', 'AB-', '555-0105', '147 Cedar Ln', 'COPD. Former smoker.', 'Albuterol inhaler, Tiotropium 18mcg daily', 'Frank Miller', NOW(), NOW()),
(6, 14, 41, 'F', 'O+', '555-0106', '258 Birch St', 'Hypothyroidism. Depression.', 'Levothyroxine 75mcg daily, Sertraline 50mg daily', 'Grace Robinson', NOW(), NOW());

-- ============================================
-- 9. PATIENT HISTORY (VISITS)
-- ============================================
INSERT IGNORE INTO patient_history (id, patient_id, doctor_id, diagnosis, treatment, notes, visit_date, medications, created_at, updated_at) VALUES
(1, 1, 2, 'Migraine with aura', 'Prescribed Sumatriptan, advised rest and hydration', 'Patient reports 2-3 migraines per week. Triggers: stress, lack of sleep', '2025-12-15 10:30:00', 
 JSON_ARRAY(JSON_OBJECT('name', 'Sumatriptan', 'dosage', '50mg', 'frequency', 'As needed', 'duration', '30 days', 'prescribedBy', 'Dr. Sarah Johnson', 'active', true, 'notes', 'For acute migraine relief')),
 NOW(), NOW()),

(2, 2, 2, 'Hypertension follow-up', 'Blood pressure stable. Continue current medications', 'BP: 138/88 - improved from last visit. Patient compliant with diet', '2025-12-10 14:00:00',
 JSON_ARRAY(
   JSON_OBJECT('name', 'Lisinopril', 'dosage', '10mg', 'frequency', 'Once daily', 'duration', '30 days', 'prescribedBy', 'Dr. Sarah Johnson', 'active', true, 'notes', 'ACE inhibitor for BP control'),
   JSON_OBJECT('name', 'Atorvastatin', 'dosage', '20mg', 'frequency', 'Once daily at night', 'duration', '30 days', 'prescribedBy', 'Dr. Sarah Johnson', 'active', true, 'notes', 'Statin for cholesterol')
 ),
 NOW(), NOW()),

(3, 3, 3, 'Diabetes management', 'Continue Metformin. Discussed dietary changes and exercise', 'Fasting glucose: 156 mg/dL. Patient to increase physical activity', '2025-12-05 11:00:00',
 JSON_ARRAY(JSON_OBJECT('name', 'Metformin', 'dosage', '1000mg', 'frequency', 'Twice daily with meals', 'duration', '30 days', 'prescribedBy', 'Dr. Emily Brown', 'active', true, 'notes', 'First-line diabetes medication')),
 NOW(), NOW()),

(4, 4, 3, 'Asthma check-up', 'Mild persistent asthma. Prescribed rescue and maintenance inhalers', 'Lungs clear bilaterally. Patient demonstrates proper inhaler technique', '2025-12-01 15:30:00',
 JSON_ARRAY(
   JSON_OBJECT('name', 'Albuterol', 'dosage', '90mcg', 'frequency', '2 puffs as needed', 'duration', 'Refillable', 'prescribedBy', 'Dr. Emily Brown', 'active', true, 'notes', 'Rescue inhaler'),
   JSON_OBJECT('name', 'Fluticasone-Salmeterol', 'dosage', '100/50mcg', 'frequency', '2 puffs twice daily', 'duration', '30 days', 'prescribedBy', 'Dr. Emily Brown', 'active', true, 'notes', 'Maintenance inhaler')
 ),
 NOW(), NOW()),

(5, 5, 11, 'COPD exacerbation', 'Treated with nebulized albuterol and oral steroids', 'Patient presented with increased shortness of breath. Oxygen sat: 92%', '2025-12-12 09:00:00',
 JSON_ARRAY(
   JSON_OBJECT('name', 'Albuterol', 'dosage', '2.5mg', 'frequency', 'Nebulized 3 times daily', 'duration', '7 days', 'prescribedBy', 'Dr. Robert Wilson', 'active', true, 'notes', 'Acute exacerbation treatment'),
   JSON_OBJECT('name', 'Prednisone', 'dosage', '40mg', 'frequency', 'Once daily', 'duration', '5 days then taper', 'prescribedBy', 'Dr. Robert Wilson', 'active', true, 'notes', 'Oral corticosteroid')
 ),
 NOW(), NOW()),

(6, 6, 12, 'Hypothyroidism follow-up', 'TSH levels normal. Continue current dose of Levothyroxine', 'Patient reports improved energy and mood. Compliant with medication', '2025-12-08 13:15:00',
 JSON_ARRAY(
   JSON_OBJECT('name', 'Levothyroxine', 'dosage', '75mcg', 'frequency', 'Once daily on empty stomach', 'duration', '30 days', 'prescribedBy', 'Dr. Jennifer Lee', 'active', true, 'notes', 'Thyroid hormone replacement'),
   JSON_OBJECT('name', 'Sertraline', 'dosage', '50mg', 'frequency', 'Once daily', 'duration', '30 days', 'prescribedBy', 'Dr. Jennifer Lee', 'active', true, 'notes', 'SSRI for depression')
 ),
 NOW(), NOW());

-- ============================================
-- 10. SET AUTO_INCREMENT FOR NEXT INSERTS
-- ============================================
ALTER TABLE organizations AUTO_INCREMENT = 3;
ALTER TABLE usersdata AUTO_INCREMENT = 15;
ALTER TABLE patients AUTO_INCREMENT = 7;
ALTER TABLE patient_history AUTO_INCREMENT = 7;
ALTER TABLE oauth_tokens AUTO_INCREMENT = 1;

-- ============================================
-- 11. CREATE LAB TABLES (in global_patient_track_db)
-- ============================================

-- Lab Test Types table
CREATE TABLE IF NOT EXISTS lab_test_types (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  description TEXT,
  organization_id BIGINT,
  active BIT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_active (active)
);

-- Insert default lab test types
INSERT INTO lab_test_types (name, category, description, active) VALUES
('Blood Test', 'Hematology', 'Complete blood count and analysis', 1),
('Urine Test', 'Urinalysis', 'Urinalysis and culture', 1),
('X-Ray', 'Radiology', 'X-ray imaging', 1),
('CT Scan', 'Radiology', 'Computed tomography scan', 1),
('Ultrasound', 'Radiology', 'Ultrasound imaging', 1),
('ECG', 'Cardiology', 'Electrocardiogram', 1),
('Pathology', 'Histopathology', 'Tissue and specimen analysis', 1),
('Microbiology', 'Microbiology', 'Culture and sensitivity testing', 1),
('Biochemistry', 'Chemistry', 'Chemical analysis of body fluids', 1),
('Other', 'General', 'Other test types', 1);

-- Lab Prescriptions table
CREATE TABLE IF NOT EXISTS lab_prescriptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT NOT NULL,
  doctor_id BIGINT NOT NULL,
  organization_id BIGINT NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  test_type VARCHAR(100),
  reason TEXT,
  instructions TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_patient (patient_id),
  INDEX idx_doctor (doctor_id),
  INDEX idx_organization (organization_id),
  INDEX idx_status (status)
);

-- Lab Results table
CREATE TABLE IF NOT EXISTS lab_results (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  prescription_id BIGINT NOT NULL UNIQUE,
  patient_id BIGINT NOT NULL,
  lab_technician_id BIGINT NOT NULL,
  organization_id BIGINT NOT NULL,
  result_data LONGTEXT,
  reference_range TEXT,
  abnormal_flags TEXT,
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_patient (patient_id),
  INDEX idx_technician (lab_technician_id),
  INDEX idx_organization (organization_id),
  INDEX idx_prescription (prescription_id),
  INDEX idx_status (status),
  FOREIGN KEY (prescription_id) REFERENCES lab_prescriptions(id)
);

-- Set AUTO_INCREMENT for lab tables
ALTER TABLE lab_prescriptions AUTO_INCREMENT = 1;
ALTER TABLE lab_results AUTO_INCREMENT = 1;
