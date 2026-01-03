-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  developer VARCHAR(255) NOT NULL,
  region VARCHAR(100) NOT NULL,
  input_type ENUM('ID', 'ID_SERVER') NOT NULL DEFAULT 'ID',
  category_id INT,
  image_url VARCHAR(500),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_active (is_active)
);

-- Create products table (denominations/variants)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  INDEX idx_game (game_id),
  INDEX idx_active (is_active)
);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('MOBA', 'Multiplayer Online Battle Arena games'),
('Battle Royale', 'Battle royale survival games'),
('RPG', 'Role-playing games'),
('Card Game', 'Digital card and strategy games');

-- Insert sample games
INSERT INTO games (name, developer, region, input_type, category_id, description) VALUES
('Mobile Legends', 'Moonton', 'Southeast Asia', 'ID_SERVER', 1, 'Popular MOBA game'),
('Free Fire', 'Garena', 'Global', 'ID', 2, 'Battle royale game'),
('PUBG Mobile', 'Tencent', 'Global', 'ID', 2, 'Battle royale shooter'),
('Genshin Impact', 'miHoYo', 'Global', 'ID', 3, 'Open-world action RPG');

-- Insert sample products for Mobile Legends
INSERT INTO products (game_id, name, price, description) VALUES
(1, '86 Diamonds', 20000, 'Mobile Legends 86 Diamonds'),
(1, '172 Diamonds', 40000, 'Mobile Legends 172 Diamonds'),
(1, '257 Diamonds', 60000, 'Mobile Legends 257 Diamonds'),
(1, 'Weekly Diamond Pass', 27000, 'Weekly Diamond Pass subscription');

-- Insert sample products for Free Fire
INSERT INTO products (game_id, name, price, description) VALUES
(2, '50 Diamonds', 7000, 'Free Fire 50 Diamonds'),
(2, '100 Diamonds', 14000, 'Free Fire 100 Diamonds'),
(2, '310 Diamonds', 42000, 'Free Fire 310 Diamonds'),
(2, 'Monthly Membership', 45000, 'Free Fire Monthly Membership');
