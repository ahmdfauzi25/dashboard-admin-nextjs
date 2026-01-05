-- Create promo_banners table
CREATE TABLE IF NOT EXISTS promo_banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  position INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATETIME,
  end_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_position (position),
  INDEX idx_dates (start_date, end_date)
);

-- Insert sample promo banners (optional - for testing)
-- Uncomment below to insert sample data

-- INSERT INTO promo_banners (title, description, image_url, link_url, position, is_active) VALUES
-- ('Promo Spesial', 'Dapatkan diskon hingga 50% untuk semua game!', 'https://example.com/promo1.jpg', 'https://example.com/promo', 1, TRUE),
-- ('Top Up Lebih Hemat', 'Beli sekarang dan dapatkan bonus diamond tambahan', 'https://example.com/promo2.jpg', NULL, 2, TRUE);

