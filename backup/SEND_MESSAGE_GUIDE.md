# Cara Mengirimkan Pesan dari Reseller ke Admin

## 📝 Melalui UI (Recommended)

### 1. Login sebagai Reseller:
```
Email: reseller@dashboard.com
Password: reseller123
```

### 2. Buka Chat:
- Navigate ke: http://localhost:3000/dashboard/chat
- Sidebar kiri akan menampilkan list admin
- Klik nama admin untuk membuka chat

### 3. Kirim Pesan:
- Ketik pesan di input box bawah
- Klik tombol send (icon pesawat biru)
- Pesan langsung terkirim ke admin

---

## 🔧 Melalui API (Manual Testing)

### Menggunakan cURL:

```bash
# 1. Login sebagai reseller untuk mendapatkan token
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reseller@dashboard.com",
    "password": "reseller123"
  }'

# Response akan return cookie dengan JWT token

# 2. Kirim pesan ke admin (dengan cookie dari login)
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN_HERE" \
  -d '{
    "receiver_id": 1,
    "message": "Halo Admin, saya butuh bantuan"
  }'
```

### Menggunakan Postman:

```
Method: POST
URL: http://localhost:3000/api/messages
Headers:
  Content-Type: application/json
  Cookie: token=YOUR_JWT_TOKEN

Body (JSON):
{
  "receiver_id": 1,
  "message": "Halo Admin, saya butuh bantuan top up game"
}
```

---

## 💻 Melalui SQL Direct (Database)

### 1. Cek ID Admin:
```sql
SELECT id, name, email FROM users WHERE role = 'ADMIN';
```

### 2. Cek ID Reseller:
```sql
SELECT id, name, email FROM users WHERE role = 'RESELLER';
```

### 3. Insert Pesan:
```sql
INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
VALUES (
  2,  -- ID reseller
  1,  -- ID admin
  'Halo Admin, saya butuh bantuan',
  FALSE,
  NOW()
);
```

### 4. Verifikasi Pesan Terkirim:
```sql
SELECT 
  m.*,
  s.name as sender_name,
  r.name as receiver_name
FROM messages m
JOIN users s ON m.sender_id = s.id
JOIN users r ON m.receiver_id = r.id
ORDER BY m.created_at DESC
LIMIT 5;
```

---

## 🧪 Testing Flow Lengkap:

### Test sebagai Reseller:
```
1. Login: reseller@dashboard.com / reseller123
2. Go to: /dashboard/chat
3. Click admin name in sidebar
4. Type message: "Halo Admin, butuh bantuan topup"
5. Click send button
6. ✅ Message sent!
```

### Verify sebagai Admin:
```
1. Logout from reseller
2. Login: admin@dashboard.com / admin123
3. Go to: /dashboard/chat
4. You will see red badge with unread count
5. Click reseller name
6. ✅ See the message from reseller
7. Type reply: "Halo, ada yang bisa dibantu?"
8. Click send
```

### Back to Reseller:
```
1. Logout from admin
2. Login as reseller again
3. Go to chat
4. ✅ See admin's reply!
```

---

## 📊 Monitoring Pesan:

### Lihat Semua Pesan:
```sql
SELECT * FROM messages ORDER BY created_at DESC;
```

### Hitung Unread Messages:
```sql
SELECT 
  receiver_id,
  COUNT(*) as unread_count
FROM messages
WHERE is_read = FALSE
GROUP BY receiver_id;
```

### Pesan Terbaru per User:
```sql
SELECT 
  u.name,
  m.message,
  m.created_at
FROM messages m
JOIN users u ON m.sender_id = u.id
ORDER BY m.created_at DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting:

### Jika pesan tidak terkirim:
1. Cek console browser (F12) untuk error
2. Pastikan logged in (cookie token ada)
3. Cek network tab untuk API response
4. Verify database connection

### Jika admin tidak muncul di list:
```sql
-- Cek apakah ada admin
SELECT * FROM users WHERE role = 'ADMIN';

-- Jika tidak ada, buat admin
INSERT INTO users (email, name, password, role) VALUES
('admin@dashboard.com', 'System Admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN');
```

### Jika chat tidak refresh:
- Auto-refresh setiap 5 detik
- Manual refresh: reload browser (F5)
- Clear browser cache jika perlu

---

## 📱 API Endpoints yang Digunakan:

1. **GET /api/messages/users** - List users untuk chat
2. **GET /api/messages?user_id={id}** - Get chat history
3. **POST /api/messages** - Send new message

Semua endpoint memerlukan authentication via JWT cookie!
