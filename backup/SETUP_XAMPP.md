# Setup MySQL dengan XAMPP (Tanpa Prisma)

## Langkah 1: Pastikan XAMPP Berjalan

1. Buka **XAMPP Control Panel**
2. Start **MySQL** service (klik tombol "Start")
3. Pastikan status MySQL menunjukkan "Running"

## Langkah 2: Buat Database

### Cara 1: Menggunakan phpMyAdmin
1. Buka browser, akses: `http://localhost/phpmyadmin`
2. Klik tab **"New"** atau **"Databases"**
3. Buat database baru dengan nama: `db_dashboard_nextjs`
4. Pilih **Collation**: `utf8mb4_general_ci`
5. Klik **"Create"**

### Cara 2: Menggunakan MySQL Command Line
```sql
CREATE DATABASE db_dashboard_nextjs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Langkah 3: Buat File .env

Buat file `.env` di **root project** (folder `dashboard-nextjs`) dengan isi:

```env
# Database URL untuk XAMPP (default: no password)
DATABASE_URL="mysql://root:@localhost:3306/db_dashboard_nextjs"

# Jika MySQL XAMPP pakai password, gunakan:
# DATABASE_URL="mysql://root:password@localhost:3306/db_dashboard_nextjs"

# JWT Secret (generate dengan: node scripts/generate-jwt-secret.js)
JWT_SECRET="139188269452d52c5d3c0e44d65f119d7ea8a10efa82ef80010c9383e2fb395e3f4a574a981997db3d923d8ff157c5ae598ed568225ec2b46e9dfd69b136683"

# JWT Expiration
JWT_EXPIRES_IN="7d"
```

**Catatan:**
- XAMPP default biasanya **tidak pakai password** untuk user `root`
- Port default MySQL XAMPP adalah **3306**
- Jika Anda sudah set password untuk MySQL, tambahkan di DATABASE_URL


## Langkah 4: Buat Tabel Users

Setelah database `db_dashboard_nextjs` dibuat, Anda perlu membuat tabel `users` secara manual. Anda dapat menggunakan phpMyAdmin atau MySQL Command Line.

### Cara 1: Menggunakan phpMyAdmin
1. Buka browser, akses: `http://localhost/phpmyadmin`
2. Pilih database `db_dashboard_nextjs` di sidebar kiri.
3. Klik tab **"SQL"**.
4. Masukkan query SQL berikut dan klik **"Go"**:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER', 'MODERATOR') DEFAULT 'USER',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Cara 2: Menggunakan MySQL Command Line
```bash
mysql -u root -p
# Masukkan password Anda jika ada, jika tidak, tekan Enter

USE db_dashboard_nextjs;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER', 'MODERATOR') DEFAULT 'USER',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Langkah 5: Verifikasi Setup

### Test 1: Cek Database Connection
Buka di browser:
```
http://localhost:3000/api/test
```

Harus return:
```json
{
  "status": "ok",
  "message": "Backend is working",
  "database": "connected",
  "userCount": 0
}
```

### Test 2: Cek Tabel di phpMyAdmin
1. Buka `http://localhost/phpmyadmin`
2. Pilih database `db_dashboard_nextjs`
3. Cek apakah tabel `users` sudah ada

## Troubleshooting

### Error: Can't reach database server
**Solusi:**
- Pastikan MySQL di XAMPP sudah **Start**
- Cek port MySQL (default: 3306)
- Cek apakah ada aplikasi lain yang menggunakan port 3306

### Error: Access denied for user 'root'@'localhost'
**Solusi:**
- Jika tidak pakai password: `DATABASE_URL="mysql://root:@localhost:3306/db_dashboard_nextjs"`
- Jika pakai password: `DATABASE_URL="mysql://root:password@localhost:3306/db_dashboard_nextjs"`

### Error: Unknown database 'db_dashboard_nextjs'
**Solusi:**
- Buat database terlebih dahulu (Langkah 2)
- Atau ubah nama database di `.env` sesuai database yang sudah ada

### Error: Table 'users' already exists
**Solusi:**
- Hapus tabel `users` yang sudah ada di phpMyAdmin (HATI-HATI: ini akan menghapus semua data!)

### Port 3306 sudah digunakan
**Solusi:**
1. Cek aplikasi lain yang menggunakan port 3306
2. Atau ubah port MySQL di XAMPP:
   - Edit file `my.ini` di folder XAMPP
   - Ubah `port=3306` ke port lain (contoh: `3307`)
   - Restart MySQL
   - Update DATABASE_URL: `mysql://root:@localhost:3307/db_dashboard_nextjs`

## Format DATABASE_URL untuk XAMPP

### Tanpa Password (Default XAMPP)
```
mysql://root:@localhost:3306/db_dashboard_nextjs
```

### Dengan Password
```
mysql://root:password123@localhost:3306/db_dashboard_nextjs
```

### Port Custom
```
mysql://root:@localhost:3307/db_dashboard_nextjs
```

### Dengan Username Custom
```
mysql://username:password@localhost:3306/db_dashboard_nextjs
```


## Next Steps

Setelah setup selesai:
1. ✅ Test koneksi: `http://localhost:3000/api/test`
2. ✅ Coba register: `http://localhost:3000/register`
3. ✅ Cek data di phpMyAdmin atau Prisma Studio

