# Game Management Setup Guide

## Database Setup

Setelah mengikuti setup XAMPP di `SETUP_XAMPP.md`, jalankan script SQL berikut untuk membuat tabel Game Management:

### Cara 1: Menggunakan phpMyAdmin

1. Buka **phpMyAdmin**: `http://localhost/phpmyadmin`
2. Pilih database `db_dashboard_nextjs`
3. Klik tab **"SQL"**
4. Copy semua isi dari file `create_games_tables.sql`
5. Paste ke SQL query box
6. Klik **"Go"** atau **"Execute"**

### Cara 2: Menggunakan MySQL Command Line (XAMPP)

```bash
# Masuk ke folder MySQL XAMPP (biasanya)
cd C:\xampp\mysql\bin

# Import SQL file
mysql -u root db_dashboard_nextjs < "d:\POC Code\Dashboard\dashboard-nextjs\create_games_tables.sql"
```

### Cara 3: Copy Paste Manual

Buka file `create_games_tables.sql` dan copy paste query SQL-nya secara manual ke phpMyAdmin atau MySQL client lainnya.

## Struktur Tabel

Script akan membuat 3 tabel:

1. **categories** - Kategori game (MOBA, Battle Royale, RPG, dll)
2. **games** - Daftar game dengan info developer, region, input type
3. **products** - Produk/denominasi untuk setiap game (diamonds, pass, dll)

## Sample Data

Script juga menyertakan sample data:
- 4 kategori game
- 4 game (Mobile Legends, Free Fire, PUBG Mobile, Genshin Impact)
- 8 produk sample (diamonds & membership untuk Mobile Legends dan Free Fire)

## Akses Game Management

Setelah database setup selesai, akses halaman game management di:

```
http://localhost:3000/dashboard/games
```

Fitur yang tersedia:
- ✅ CRUD Games (Tambah/Edit/Hapus)
- ✅ CRUD Products/Denominations
- ✅ CRUD Categories
- ✅ Filter products by game
- ✅ Input type validation (ID only atau ID+Server)
- ✅ Status active/inactive
