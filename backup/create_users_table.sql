CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER', 'RESELLER') DEFAULT 'USER',
    avatar LONGBLOB,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Update existing MODERATOR role to RESELLER
UPDATE users SET role = 'RESELLER' WHERE role = 'MODERATOR';

-- Ensure at least one admin exists for resellers to chat with
-- Check if admin exists, if not create default admin
INSERT INTO users (email, name, password, role)
SELECT 'admin@dashboard.com', 'System Admin', '$2a$10$YourHashedPasswordHere', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN');
