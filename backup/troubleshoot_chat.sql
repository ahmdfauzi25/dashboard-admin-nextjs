-- Troubleshooting: Admin tidak melihat reseller di chat

-- 1. Cek semua users dan role mereka
SELECT id, name, email, role FROM users ORDER BY role, id;

-- 2. Cek apakah ada reseller
SELECT id, name, email, role FROM users WHERE UPPER(role) = 'RESELLER';

-- 3. Cek apakah ada admin
SELECT id, name, email, role FROM users WHERE UPPER(role) = 'ADMIN';

-- 4. Cek semua pesan yang ada
SELECT 
  m.id,
  m.sender_id,
  s.name as sender_name,
  s.role as sender_role,
  m.receiver_id,
  r.name as receiver_name,
  r.role as receiver_role,
  m.message,
  m.created_at
FROM messages m
JOIN users s ON m.sender_id = s.id
JOIN users r ON m.receiver_id = r.id
ORDER BY m.created_at DESC;

-- 5. Cek role exact (dengan quotes untuk melihat spasi tersembunyi)
SELECT id, name, email, CONCAT('[', role, ']') as role_with_brackets FROM users;

-- 6. Update semua role ke uppercase jika ada inkonsistensi
UPDATE users SET role = 'ADMIN' WHERE UPPER(role) = 'ADMIN';
UPDATE users SET role = 'RESELLER' WHERE UPPER(role) = 'RESELLER';
UPDATE users SET role = 'USER' WHERE UPPER(role) = 'USER';

-- 7. Cek apakah ada message dari reseller ke admin
SELECT 
  m.*,
  s.name as sender_name,
  s.role as sender_role,
  r.name as receiver_name,
  r.role as receiver_role
FROM messages m
JOIN users s ON m.sender_id = s.id
JOIN users r ON m.receiver_id = r.id
WHERE UPPER(s.role) = 'RESELLER' AND UPPER(r.role) = 'ADMIN';

-- 8. Simulasi query yang digunakan API (untuk admin melihat reseller)
-- Ganti ? dengan ID admin Anda (misal ID 1)
SET @admin_id = (SELECT id FROM users WHERE UPPER(role) = 'ADMIN' LIMIT 1);

SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  (SELECT COUNT(*) 
   FROM messages 
   WHERE sender_id = u.id 
     AND receiver_id = @admin_id
     AND is_read = FALSE) as unread_count,
  (SELECT message 
   FROM messages 
   WHERE (sender_id = u.id AND receiver_id = @admin_id) 
      OR (sender_id = @admin_id AND receiver_id = u.id)
   ORDER BY created_at DESC 
   LIMIT 1) as last_message,
  (SELECT created_at 
   FROM messages 
   WHERE (sender_id = u.id AND receiver_id = @admin_id) 
      OR (sender_id = @admin_id AND receiver_id = u.id)
   ORDER BY created_at DESC 
   LIMIT 1) as last_message_time
FROM users u
WHERE UPPER(u.role) = 'RESELLER'
ORDER BY last_message_time DESC;

-- 9. Jika tidak ada hasil, berarti tidak ada reseller. Buat reseller:
INSERT INTO users (email, name, password, role)
SELECT 'reseller@dashboard.com', 'Sample Reseller', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RESELLER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE UPPER(role) = 'RESELLER');

-- 10. Test kirim pesan dari reseller ke admin
INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
SELECT 
  (SELECT id FROM users WHERE UPPER(role) = 'RESELLER' LIMIT 1),
  (SELECT id FROM users WHERE UPPER(role) = 'ADMIN' LIMIT 1),
  'Test message dari reseller ke admin',
  FALSE,
  NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE UPPER(role) = 'RESELLER')
  AND EXISTS (SELECT 1 FROM users WHERE UPPER(role) = 'ADMIN');

-- 11. Verifikasi pesan terkirim
SELECT * FROM messages ORDER BY created_at DESC LIMIT 5;
