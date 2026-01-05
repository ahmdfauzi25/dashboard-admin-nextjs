# Update User Roles untuk Chat System

## Perubahan yang Dilakukan:

### 1. Database Schema Update
- Role `MODERATOR` diganti menjadi `RESELLER`
- Enum di tabel users: `'ADMIN', 'USER', 'RESELLER'`

### 2. Ensure Admin Exists
Reseller membutuhkan minimal 1 admin untuk bisa chat. Script otomatis akan:
- Update semua MODERATOR → RESELLER
- Cek apakah ada admin di database
- Jika tidak ada, buat default admin account

---

## Cara Menjalankan Update:

### Opsi 1: Jalankan Script Node.js (Recommended)
```bash
cd "D:\POC Code\Dashboard\dashboard-nextjs"
node scripts/update-user-roles.js
```

**Output yang diharapkan:**
```
🔄 Updating user roles...
✅ Updated 2 MODERATOR roles to RESELLER
✅ Found 1 admin(s) in database

📋 Current users in database:
┌─────────┬────┬──────────────┬────────────────────────┬──────────┐
│ (index) │ id │     name     │         email          │   role   │
├─────────┼────┼──────────────┼────────────────────────┼──────────┤
│    0    │  1 │ System Admin │ admin@dashboard.com    │  ADMIN   │
│    1    │  2 │ Reseller 1   │ reseller1@example.com  │ RESELLER │
└─────────┴────┴──────────────┴────────────────────────┴──────────┘
```

### Opsi 2: Manual SQL (Jika script tidak jalan)
```sql
-- 1. Update MODERATOR ke RESELLER
UPDATE users SET role = 'RESELLER' WHERE role = 'MODERATOR';

-- 2. Cek apakah ada admin
SELECT * FROM users WHERE role = 'ADMIN';

-- 3. Jika tidak ada admin, buat manual:
-- (Password: admin123, hashed dengan bcrypt)
INSERT INTO users (email, name, password, role) 
VALUES (
  'admin@dashboard.com', 
  'System Admin', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'ADMIN'
);
```

---

## Testing Chat System:

### 1. Login sebagai Admin:
- Email: admin@dashboard.com
- Password: admin123 (jika menggunakan default)
- Buka: http://localhost:3000/dashboard/chat
- Anda akan melihat list resellers

### 2. Login sebagai Reseller:
- Gunakan akun reseller yang ada
- Buka: http://localhost:3000/dashboard/chat
- Anda akan melihat list admins
- Klik admin untuk mulai chat
- Ketik pesan dan klik send

### 3. Verifikasi:
- Admin bisa membalas pesan reseller
- Reseller bisa kirim pesan ke admin
- Unread count muncul dengan badge merah
- Last message tampil di sidebar
- Auto-refresh setiap 5 detik

---

## Troubleshooting:

### Jika reseller tidak melihat admin:
```sql
-- Pastikan ada user dengan role ADMIN
SELECT * FROM users WHERE role = 'ADMIN';

-- Jika tidak ada, buat admin baru di UI:
-- Dashboard → Users → Add User → Role: Admin
```

### Jika admin tidak melihat reseller:
```sql
-- Pastikan ada user dengan role RESELLER
SELECT * FROM users WHERE role = 'RESELLER';

-- Jika tidak ada, buat reseller baru di UI:
-- Dashboard → Users → Add User → Role: Reseller
```

### Check database connection:
```bash
# Test MySQL connection
mysql -u root -p db_dashboard_nextjs
```

---

## Default Admin Credentials (Jika dibuat oleh script):
- **Email:** admin@dashboard.com
- **Password:** admin123
- **⚠️ WAJIB GANTI PASSWORD SETELAH LOGIN PERTAMA!**

---

## File yang Diupdate:
1. ✅ `create_users_table.sql` - Schema update
2. ✅ `scripts/update-user-roles.js` - Automation script
3. ✅ `src/app/dashboard/users/page.js` - Form update (MODERATOR → RESELLER)
4. ✅ `src/app/api/messages/users/route.js` - Case-insensitive role check
5. ✅ `src/app/dashboard/chat/page.js` - Empty state message
