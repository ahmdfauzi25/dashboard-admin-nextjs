-- Query untuk mengirimkan pesan dari Reseller ke Admin

-- 1. Cek ID admin yang tersedia
SELECT id, name, email, role 
FROM users 
WHERE role = 'ADMIN' OR role = 'admin'
ORDER BY id;

-- 2. Cek ID reseller yang akan mengirim pesan
SELECT id, name, email, role 
FROM users 
WHERE role = 'RESELLER' OR role = 'reseller'
ORDER BY id;

-- 3. Kirim pesan dari Reseller ke Admin (SAFE - menggunakan subquery)
-- Query ini akan gagal jika tidak ada admin atau reseller
INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
SELECT 
  (SELECT id FROM users WHERE role IN ('RESELLER', 'reseller') LIMIT 1) as sender_id,
  (SELECT id FROM users WHERE role IN ('ADMIN', 'admin') LIMIT 1) as receiver_id,
  'Halo Admin, saya butuh bantuan untuk top up game Mobile Legends' as message,
  FALSE as is_read,
  NOW() as created_at
WHERE EXISTS (SELECT 1 FROM users WHERE role IN ('RESELLER', 'reseller'))
  AND EXISTS (SELECT 1 FROM users WHERE role IN ('ADMIN', 'admin'));

-- 4. Kirim pesan dengan image (SAFE)
INSERT INTO messages (sender_id, receiver_id, message, has_image, image_url, is_read, created_at)
SELECT 
  (SELECT id FROM users WHERE role IN ('RESELLER', 'reseller') LIMIT 1),
  (SELECT id FROM users WHERE role IN ('ADMIN', 'admin') LIMIT 1),
  'Berikut screenshot masalah yang saya alami',
  TRUE,
  '/uploads/screenshot_20260104.png',
  FALSE,
  NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE role IN ('RESELLER', 'reseller'))
  AND EXISTS (SELECT 1 FROM users WHERE role IN ('ADMIN', 'admin'));

-- 5. Lihat semua pesan antara reseller dan admin (SAFE - dynamic IDs)
SELECT 
  m.id,
  m.sender_id,
  s.name as sender_name,
  m.receiver_id,
  r.name as receiver_name,
  m.message,
  m.is_read,
  m.created_at
FROM messages m
JOIN users s ON m.sender_id = s.id
JOIN users r ON m.receiver_id = r.id
WHERE ((s.role IN ('RESELLER', 'reseller') AND r.role IN ('ADMIN', 'admin'))
   OR (s.role IN ('ADMIN', 'admin') AND r.role IN ('RESELLER', 'reseller')))
ORDER BY m.created_at ASC;

-- 6. Lihat pesan yang belum dibaca dari reseller ke admin (SAFE)
SELECT 
  m.id,
  m.message,
  s.name as sender_name,
  s.role as sender_role,
  m.created_at
FROM messages m
JOIN users s ON m.sender_id = s.id
JOIN users r ON m.receiver_id = r.id
WHERE s.role IN ('RESELLER', 'reseller')
  AND r.role IN ('ADMIN', 'admin')
  AND m.is_read = FALSE
ORDER BY m.created_at DESC;

-- 7. Mark pesan sebagai sudah dibaca (ketika admin membuka chat) - SAFE
UPDATE messages m
JOIN users s ON m.sender_id = s.id
JOIN users r ON m.receiver_id = r.id
SET m.is_read = TRUE, m.updated_at = NOW()
WHERE r.role IN ('ADMIN', 'admin')  -- Receiver adalah admin
  AND s.role IN ('RESELLER', 'reseller')  -- Sender adalah reseller
  AND m.is_read = FALSE;

-- 8. Hitung jumlah unread messages untuk admin dari semua reseller (SAFE)
SELECT 
  m.sender_id,
  u.name as reseller_name,
  COUNT(*) as unread_count
FROM messages m
JOIN users u ON m.sender_id = u.id
JOIN users r ON m.receiver_id = r.id
WHERE r.role IN ('ADMIN', 'admin')
  AND u.role IN ('RESELLER', 'reseller')
  AND m.is_read = FALSE
GROUP BY m.sender_id, u.name
ORDER BY unread_count DESC;

-- 9. Contoh pesan lengkap dari reseller ke admin (SAFE - menggunakan subquery)
INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
SELECT 
  (SELECT id FROM users WHERE role IN ('RESELLER', 'reseller') LIMIT 1),
  (SELECT id FROM users WHERE role IN ('ADMIN', 'admin') LIMIT 1),
  msg.message,
  FALSE,
  NOW()
FROM (
  SELECT 'Permisi Admin, saya mau tanya tentang harga diamonds ML' as message
  UNION ALL SELECT 'Apakah ada diskon untuk pembelian dalam jumlah besar?'
  UNION ALL SELECT 'Mohon infonya, terima kasih'
) msg
WHERE EXISTS (SELECT 1 FROM users WHERE role IN ('RESELLER', 'reseller'))
  AND EXISTS (SELECT 1 FROM users WHERE role IN ('ADMIN', 'admin'));

-- 10. Delete pesan tertentu (jika diperlukan) - Dengan verifikasi
DELETE m FROM messages m
JOIN users s ON m.sender_id = s.id
WHERE m.id = 1  -- ID pesan yang akan dihapus
  AND s.role IN ('RESELLER', 'reseller');  -- Pastikan pengirim adalah reseller

-- 11. Get last message antara reseller dan admin (SAFE)
SELECT 
  m.id,
  m.message,
  m.created_at,
  s.name as sender_name,
  s.role as sender_role
FROM messages m
JOIN users s ON m.sender_id = s.id
JOIN users r ON m.receiver_id = r.id
WHERE ((s.role IN ('RESELLER', 'reseller') AND r.role IN ('ADMIN', 'admin'))
   OR (s.role IN ('ADMIN', 'admin') AND r.role IN ('RESELLER', 'reseller')))
ORDER BY m.created_at DESC
LIMIT 1;

-- BONUS: Query untuk troubleshooting error Foreign Key

-- 12. Cek apakah user dengan ID tertentu ada
SELECT id, name, email, role FROM users WHERE id IN (1, 2);

-- 13. Lihat struktur tabel users untuk verifikasi
DESCRIBE users;

-- 14. Lihat foreign key constraints pada tabel messages
SHOW CREATE TABLE messages;

-- 15. Test insert dengan ID yang valid (menggunakan ID dari query #1 dan #2)
-- Jalankan query #1 dan #2 terlebih dahulu untuk mendapatkan ID yang benar
-- Kemudian ganti @reseller_id dan @admin_id dengan ID yang sesuai
SET @reseller_id = (SELECT id FROM users WHERE role IN ('RESELLER', 'reseller') LIMIT 1);
SET @admin_id = (SELECT id FROM users WHERE role IN ('ADMIN', 'admin') LIMIT 1);

-- Cek apakah ID berhasil di-set
SELECT @reseller_id as reseller_id, @admin_id as admin_id;

-- Insert dengan ID yang sudah di-set
INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
SELECT @reseller_id, @admin_id, 'Test message menggunakan variable', FALSE, NOW()
WHERE @reseller_id IS NOT NULL AND @admin_id IS NOT NULL;
