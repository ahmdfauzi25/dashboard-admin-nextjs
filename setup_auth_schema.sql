-- ===================================
-- ADD MISSING COLUMNS TO EXISTING SCHEMA
-- ===================================

-- If otps table doesn't have verified_at column
ALTER TABLE otps ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL;

-- If users table doesn't have is_verified column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- If login_history doesn't have logout_time column
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS logout_time TIMESTAMP NULL;

-- Ensure login_history has login_time column (for index)
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- If otp_logs doesn't have error_message column
ALTER TABLE otp_logs ADD COLUMN IF NOT EXISTS error_message VARCHAR(255) NULL;

-- Ensure otp_logs has created_at column (for index)
ALTER TABLE otp_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Ensure users table has created_at column
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Ensure otp_templates table exists and has required columns
CREATE TABLE IF NOT EXISTS otp_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  channel ENUM('email', 'whatsapp', 'sms') NOT NULL,
  template_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_channel (channel)
);

-- Add template_text column if table exists but column doesn't
ALTER TABLE otp_templates ADD COLUMN IF NOT EXISTS template_text TEXT NOT NULL AFTER channel;

-- Create default admin user if it doesn't exist
INSERT IGNORE INTO users (name, email, phone, password_hash, role, is_verified, is_active)
VALUES (
  'Admin',
  'admin@gametopup.com',
  '+62812345678',
  '$2b$10$JJDmewrxH6CG/PxF0QEqnu3Y0V7VcREMH0VWdFQ7pNL0OBvMPMfEW',
  'admin',
  TRUE,
  TRUE
);

-- Create default OTP templates if they don't exist
INSERT IGNORE INTO otp_templates (channel, template_text) VALUES
(
  'email',
  'Your OTP verification code is: {{OTP_CODE}}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.'
),
(
  'whatsapp',
  'Kode OTP Anda: {{OTP_CODE}}\n\nKode ini berlaku selama 10 menit.\n\nJangan bagikan kode ini kepada siapa pun.'
),
(
  'sms',
  'OTP Anda: {{OTP_CODE}} (Berlaku 10 menit)'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified);

CREATE INDEX IF NOT EXISTS idx_otps_user_id ON otps(user_id);
CREATE INDEX IF NOT EXISTS idx_otps_code ON otps(otp_code);
CREATE INDEX IF NOT EXISTS idx_otps_channel ON otps(channel);
CREATE INDEX IF NOT EXISTS idx_otps_expiry ON otps(expires_at);

CREATE INDEX IF NOT EXISTS idx_otp_logs_user_id ON otp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_logs_status ON otp_logs(status);
CREATE INDEX IF NOT EXISTS idx_otp_logs_channel ON otp_logs(channel);
CREATE INDEX IF NOT EXISTS idx_otp_logs_created ON otp_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_status ON login_history(login_status);
CREATE INDEX IF NOT EXISTS idx_login_history_time ON login_history(login_time);

CREATE INDEX IF NOT EXISTS idx_blacklist_value ON blacklist(value);
CREATE INDEX IF NOT EXISTS idx_blacklist_type ON blacklist(type);
CREATE INDEX IF NOT EXISTS idx_blacklist_expiry ON blacklist(expires_at);

-- Verify data
SELECT '=== USERS ===' as info;
DESCRIBE users;

SELECT '=== OTP TEMPLATES ===' as info;
SELECT * FROM otp_templates;

SELECT '=== DEFAULT ADMIN ===' as info;
SELECT id, name, email, role, is_verified FROM users WHERE role = 'admin';

-- Test default admin login
-- Email: admin@gametopup.com
-- Password: admin123 (hashed with bcrypt)
