-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('EWALLET', 'BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'QRIS', 'CREDIT_CARD', 'OTHER') NOT NULL,
  logo_url VARCHAR(500),
  description TEXT,
  fee_percentage DECIMAL(5, 2) DEFAULT 0.00,
  fee_fixed DECIMAL(10, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  position INT DEFAULT 0,
  min_amount DECIMAL(10, 2) DEFAULT 0.00,
  max_amount DECIMAL(15, 2) DEFAULT 99999999999.99,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_type (type),
  INDEX idx_position (position),
  INDEX idx_code (code)
);

-- Insert default payment methods (Indonesia)
INSERT INTO payment_methods (name, code, type, logo_url, description, is_active, position) VALUES
('OVO', 'OVO', 'EWALLET', 'https://logos-world.net/wp-content/uploads/2021/03/OVO-Logo.png', 'E-Wallet OVO', TRUE, 1),
('DANA', 'DANA', 'EWALLET', 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg', 'E-Wallet DANA', TRUE, 2),
('GoPay', 'GOPAY', 'EWALLET', 'https://upload.wikimedia.org/wikipedia/commons/8/86/GoPay_logo.svg', 'E-Wallet GoPay', TRUE, 3),
('LinkAja', 'LINKAJA', 'EWALLET', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/LinkAja_logo.svg', 'E-Wallet LinkAja', TRUE, 4),
('ShopeePay', 'SHOPEEPAY', 'EWALLET', 'https://upload.wikimedia.org/wikipedia/commons/f/fe/ShopeePay_logo.svg', 'E-Wallet ShopeePay', TRUE, 5),
('BCA', 'BCA', 'BANK_TRANSFER', 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia_logo.svg', 'Bank Transfer BCA', TRUE, 6),
('Mandiri', 'MANDIRI', 'BANK_TRANSFER', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logo_Bank_Mandiri.svg', 'Bank Transfer Mandiri', TRUE, 7),
('BRI', 'BRI', 'BANK_TRANSFER', 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Bank_Rakyat_Indonesia_logo.svg', 'Bank Transfer BRI', TRUE, 8),
('BNI', 'BNI', 'BANK_TRANSFER', 'https://upload.wikimedia.org/wikipedia/commons/0/0e/BNI_logo.svg', 'Bank Transfer BNI', TRUE, 9),
('QRIS', 'QRIS', 'QRIS', 'https://qris.id/images/qris-logo.png', 'QRIS - Quick Response Indonesian Standard', TRUE, 10),
('BCA Virtual Account', 'BCA_VA', 'VIRTUAL_ACCOUNT', 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia_logo.svg', 'BCA Virtual Account', TRUE, 11),
('Mandiri Virtual Account', 'MANDIRI_VA', 'VIRTUAL_ACCOUNT', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logo_Bank_Mandiri.svg', 'Mandiri Virtual Account', TRUE, 12);

