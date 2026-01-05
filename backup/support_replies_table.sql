-- Create support_replies table for admin responses
CREATE TABLE IF NOT EXISTS support_replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  admin_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ticket (ticket_id),
  INDEX idx_admin (admin_id)
);

-- Add admin_response column to support_tickets for quick access
ALTER TABLE support_tickets 
ADD COLUMN admin_response TEXT NULL AFTER message;
