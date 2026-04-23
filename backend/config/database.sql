CREATE DATABASE IF NOT EXISTS smart_health_db;
USE smart_health_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  age INT NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  weight FLOAT NOT NULL,
  height FLOAT NOT NULL,
  bmi FLOAT,
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  blood_sugar FLOAT,
  heart_rate INT,
  sleep_hours FLOAT,
  exercise_per_week INT,
  smoking TINYINT(1) DEFAULT 0,
  alcohol TINYINT(1) DEFAULT 0,
  symptoms TEXT,
  health_status ENUM('healthy', 'at_risk', 'unhealthy') DEFAULT 'healthy',
  recovery_days INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  health_record_id INT NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  activity TEXT NOT NULL,
  category ENUM('diet','exercise','medication','sleep','hydration','monitoring') NOT NULL,
  FOREIGN KEY (health_record_id) REFERENCES health_records(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS health_instructions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  health_record_id INT NOT NULL,
  instruction TEXT NOT NULL,
  priority ENUM('high','medium','low') DEFAULT 'medium',
  FOREIGN KEY (health_record_id) REFERENCES health_records(id) ON DELETE CASCADE
);

SELECT 'Database setup complete!' AS Status;