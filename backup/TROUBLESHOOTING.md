# Troubleshooting Guide - Register & Login

## Error 500: Server Error

Jika Anda mendapatkan error "Server error: Invalid response (500)", ikuti langkah-langkah berikut:

### 1. Cek File .env

Pastikan file `.env` ada di root project dengan isi:

```env
DATABASE_URL="mysql://root:@localhost:3306/db_dashboard_nextjs"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
```

**Format DATABASE_URL:**
```
mysql://[username]:[password]@[host]:[port]/[database_name]
```

**Contoh:**
- Tanpa password: `mysql://root:@localhost:3306/db_dashboard_nextjs`
- Dengan password: `mysql://root:password123@localhost:3306/db_dashboard_nextjs`
- XAMPP default: `mysql://root:@localhost:3306/db_dashboard_nextjs`

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Cek Database Connection

Test koneksi database dengan membuka:
```
http://localhost:3000/api/test
```

Jika berhasil, akan muncul:
```json
{
  "status": "ok",
  "message": "Backend is working",
  "database": "connected",
  "userCount": 0
}
```

Jika error, kemungkinan:
- MySQL server tidak berjalan
- DATABASE_URL salah
- Database belum dibuat

### 4. Cek MySQL Server

Pastikan MySQL/XAMPP berjalan:
- Windows: Cek XAMPP Control Panel
- Pastikan MySQL service berjalan

### 5. Cek Database

Pastikan database `db_dashboard_nextjs` sudah dibuat:
```sql
CREATE DATABASE IF NOT EXISTS db_dashboard_nextjs;
```

### 6. Run Migration

```bash
npm run prisma:migrate
```

Atau jika database sudah ada:
```bash
npm run prisma:push
```

### 7. Restart Development Server

Setelah membuat/mengubah file `.env`, restart server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

## Error Messages yang Umum

### "Database connection failed"
- **Solusi:** Cek DATABASE_URL di `.env` dan pastikan MySQL berjalan

### "Prisma Client is not generated"
- **Solusi:** Jalankan `npm run prisma:generate`

### "User with this email already exists"
- **Solusi:** Email sudah terdaftar, gunakan email lain atau login

### "Invalid email format"
- **Solusi:** Gunakan format email yang valid (contoh: user@example.com)

### "Password must be at least 6 characters"
- **Solusi:** Password minimal 6 karakter

## Debugging

### 1. Cek Console Browser
Buka Developer Tools (F12) → Console tab untuk melihat error dari frontend

### 2. Cek Terminal Server
Lihat terminal tempat `npm run dev` berjalan untuk melihat error dari backend

### 3. Cek Network Tab
Buka Developer Tools (F12) → Network tab:
- Cari request ke `/api/register`
- Klik untuk melihat Request/Response
- Cek Response untuk error message

## Quick Fix Checklist

- [ ] File `.env` sudah dibuat di root project
- [ ] `DATABASE_URL` sudah di-set dengan benar
- [ ] `JWT_SECRET` sudah di-set
- [ ] MySQL server berjalan
- [ ] Database `db_dashboard_nextjs` sudah dibuat
- [ ] Prisma Client sudah di-generate (`npm run prisma:generate`)
- [ ] Migration sudah dijalankan (`npm run prisma:migrate`)
- [ ] Development server sudah di-restart setelah membuat `.env`

## Test Endpoints

### Test Backend
```
GET http://localhost:3000/api/test
```

### Test Register (dengan cURL)
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Test Login (dengan cURL)
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password123"}'
```

## Masih Error?

Jika masih error setelah mengikuti langkah-langkah di atas:

1. **Cek error di terminal server** - Copy error message lengkap
2. **Cek error di browser console** - Copy error message
3. **Cek response dari `/api/test`** - Apakah berhasil atau error?
4. **Kirimkan informasi di atas** untuk bantuan lebih lanjut

