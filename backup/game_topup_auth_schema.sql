-- ============================================
-- GAME TOP UP SYSTEM - DATABASE SCHEMA
-- ============================================

-- 1. USERS TABLE (dengan Role Management)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin', 'moderator') DEFAULT 'customer',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_role (role),
  INDEX idx_verified (is_verified)
);

-- Ensure users table has phone column
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;

-- Ensure users table has password_hash column
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Ensure users table has role column
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('customer', 'admin', 'moderator') DEFAULT 'customer';

-- Ensure users table has is_verified column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Ensure users table has is_active column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. OTP TABLE (untuk tracking OTP verification)
CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  channel ENUM('email', 'whatsapp', 'sms') NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  is_expired BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  verified_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_code (otp_code),
  INDEX idx_expires (expires_at)
);

-- 3. OTP LOGS TABLE (audit trail)
CREATE TABLE IF NOT EXISTS otp_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  otp_code VARCHAR(6) NOT NULL,
  channel ENUM('email', 'whatsapp', 'sms') NOT NULL,
  status ENUM('sent', 'verified', 'failed', 'expired') DEFAULT 'sent',
  provider VARCHAR(50) DEFAULT NULL,
  error_message TEXT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_sent_at (sent_at)
);

-- 4. LOGIN HISTORY TABLE (security tracking)
CREATE TABLE IF NOT EXISTS login_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device VARCHAR(100),
  login_status ENUM('success', 'failed', 'blocked') DEFAULT 'success',
  failure_reason VARCHAR(255) NULL,
  logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logged_out_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_logged_in (logged_in_at)
);

-- 5. OTP TEMPLATES TABLE (untuk customize OTP message)
CREATE TABLE IF NOT EXISTS otp_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  channel ENUM('email', 'whatsapp', 'sms') NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  variables JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_active_channel (channel, is_active)
);

-- 6. BLACKLIST TABLE (untuk block suspicious users/IPs)
CREATE TABLE IF NOT EXISTS blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('user_id', 'email', 'phone', 'ip_address') NOT NULL,
  value VARCHAR(255) NOT NULL,
  reason TEXT,
  blacklisted_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  UNIQUE KEY unique_blacklist (type, value),
  INDEX idx_expires (expires_at)
);

-- Insert default admin user
INSERT INTO users (name, email, phone, password_hash, role, is_verified, is_active)
VALUES ('Admin User', 'admin@topup.com', '6281234567890', '$2b$10$YourHashedPasswordHere', 'admin', TRUE, TRUE)
ON DUPLICATE KEY UPDATE id=id;

-- Insert default OTP templates
INSERT INTO otp_templates (channel, subject, body, is_active)
VALUES 
  ('email', 'Kode Verifikasi Game Top Up', 'Kode verifikasi Anda adalah: {{OTP_CODE}}\n\nKode ini berlaku selama 10 menit.\n\nJangan bagikan kode ini kepada siapapun.', TRUE),
  ('whatsapp', NULL, 'Kode verifikasi Game Top Up Anda: {{OTP_CODE}}\n\nKode ini berlaku selama 10 menit.', TRUE),
  ('sms', NULL, 'Game Top Up: {{OTP_CODE}} (jangan bagikan)', TRUE)
ON DUPLICATE KEY UPDATE id=id;

-- Verify schema
SHOW TABLES;
DESCRIBE users;
DESCRIBE otps;
DESCRIBE otp_logs;
DESCRIBE login_history;
DESCRIBE otp_templates;
DESCRIBE blacklist;
