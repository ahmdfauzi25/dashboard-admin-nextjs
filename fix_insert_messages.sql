-- FIX: Insert test messages dari reseller ke admin

-- 1. Cek users
SELECT id, name, email, role FROM users ORDER BY id;

-- 2. Cek apakah ada reseller dan admin
SELECT 'ADMIN' as type, COUNT(*) as count FROM users WHERE UPPER(role) = 'ADMIN'
UNION ALL
SELECT 'RESELLER' as type, COUNT(*) as count FROM users WHERE UPPER(role) = 'RESELLER';

-- 3. Insert test message dari reseller (ID 5) ke admin (ID 1)
INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
VALUES (
  5,  -- reseller@dashboard.com (ID: 5)
  1,  -- Administrator (ID: 1)
  'Halo Admin, saya butuh bantuan',
  FALSE,
  NOW()
);

-- 4. Insert beberapa pesan lagi
INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at) VALUES
(5, 1, 'Apakah bisa top up game ML?', FALSE, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(5, 1, 'Berapa harganya?', FALSE, DATE_SUB(NOW(), INTERVAL 5 MINUTE));

-- 5. Verifikasi pesan terkirim
SELECT 
  m.id,
  m.sender_id,
  s.name as sender_name,
  m.receiver_id,
  r.name as receiver_name,
  m.message,
  m.created_at
FROM messages m
JOIN users s ON m.sender_id = s.id
JOIN users r ON m.receiver_id = r.id
ORDER BY m.created_at DESC;

-- 6. Simulasi query API untuk admin melihat reseller
SELECT 
  u.id,
  u.name,
  u.role,
  (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = 1 AND is_read = FALSE) as unread_count,
  (SELECT message FROM messages WHERE (sender_id = u.id AND receiver_id = 1) OR (sender_id = 1 AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message
FROM users u
WHERE UPPER(u.role) = 'RESELLER'
ORDER BY id;
