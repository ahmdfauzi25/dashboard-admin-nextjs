-- Create voucher_promos table
CREATE TABLE IF NOT EXISTS voucher_promos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type ENUM('PERCENTAGE', 'FIXED') NOT NULL DEFAULT 'PERCENTAGE',
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2) DEFAULT 0.00,
  max_discount DECIMAL(10, 2) DEFAULT NULL,
  usage_limit INT DEFAULT NULL,
  used_count INT DEFAULT 0,
  start_date DATETIME,
  end_date DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active),
  INDEX idx_dates (start_date, end_date)
);

-- Insert sample voucher promos (optional - for testing)
-- Uncomment below to insert sample data

-- INSERT INTO voucher_promos (code, name, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, start_date, end_date, is_active) VALUES
-- ('DISKON10', 'Diskon 10%', 'Dapatkan diskon 10% untuk pembelian minimal Rp 50.000', 'PERCENTAGE', 10.00, 50000.00, NULL, 100, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
-- ('HEMAT20K', 'Hemat Rp 20.000', 'Potongan langsung Rp 20.000 untuk pembelian minimal Rp 100.000', 'FIXED', 20000.00, 100000.00, NULL, 50, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), TRUE),
-- ('NEWUSER50', 'New User 50%', 'Diskon 50% untuk pengguna baru, maksimal Rp 50.000', 'PERCENTAGE', 50.00, 25000.00, 50000.00, 200, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), TRUE);

