# Promo Banners Setup Guide

## Database Setup

### 1. Create Table

Jalankan file SQL untuk membuat tabel `promo_banners`:

```sql
-- File: create_promo_banners_table.sql
```

**Cara menjalankan:**

**Via phpMyAdmin:**
1. Buka phpMyAdmin (http://localhost/phpmyadmin)
2. Pilih database Anda (misalnya: `db_dashboard_nextjs`)
3. Klik tab "SQL"
4. Copy-paste isi file `create_promo_banners_table.sql`
5. Klik "Go" atau "Kirim"

**Via Command Line:**
```bash
mysql -u root -p db_dashboard_nextjs < create_promo_banners_table.sql
```

### 2. Table Structure

Tabel `promo_banners` memiliki struktur:

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key, auto increment |
| `title` | VARCHAR(255) | Judul banner (required) |
| `description` | TEXT | Deskripsi banner (optional) |
| `image_url` | VARCHAR(500) | URL gambar banner (optional) |
| `link_url` | VARCHAR(500) | URL redirect saat banner diklik (optional) |
| `position` | INT | Urutan tampil (default: 0) |
| `is_active` | BOOLEAN | Status aktif/nonaktif (default: TRUE) |
| `start_date` | DATETIME | Tanggal mulai tampil (optional) |
| `end_date` | DATETIME | Tanggal akhir tampil (optional) |
| `created_at` | TIMESTAMP | Waktu dibuat (auto) |
| `updated_at` | TIMESTAMP | Waktu diupdate (auto) |

### 3. Indexes

Tabel memiliki index untuk performa:
- `idx_active` - untuk filter banner aktif
- `idx_position` - untuk sorting berdasarkan posisi
- `idx_dates` - untuk filter berdasarkan tanggal

## API Endpoints

### Public Endpoints (No Auth)

- `GET /api/promo-banners` - Get all active banners (public)
  - Query params:
    - `includeInactive=true` - Include inactive banners
    - `admin=true` - Admin view (includes inactive)

### Admin Endpoints (Auth Required)

- `POST /api/promo-banners` - Create new banner
- `GET /api/promo-banners/[id]` - Get banner by ID
- `PUT /api/promo-banners/[id]` - Update banner
- `DELETE /api/promo-banners/[id]` - Delete banner

## Usage

### 1. Access Admin Page

```
http://localhost:3000/dashboard/promo-banners
```

### 2. Create Banner

1. Klik "Tambah Banner"
2. Isi form:
   - **Title**: Judul banner (wajib)
   - **Description**: Deskripsi (opsional)
   - **Image URL**: URL gambar banner
   - **Link URL**: URL redirect saat diklik (opsional)
   - **Position**: Urutan tampil (0 = pertama)
   - **Status**: Active/Inactive
   - **Start Date**: Tanggal mulai (opsional)
   - **End Date**: Tanggal akhir (opsional)
3. Klik "Create"

### 3. Edit Banner

1. Klik "Edit" pada banner yang ingin diubah
2. Ubah data yang diperlukan
3. Klik "Update"

### 4. Delete Banner

1. Klik "Delete" pada banner yang ingin dihapus
2. Konfirmasi penghapusan

## Frontend Display

Banner akan otomatis tampil di:
- `http://localhost:3001` (website top up)
- Posisi: Di atas Main Banner
- Fitur:
  - Auto-slider (ganti setiap 5 detik)
  - Navigation dots
  - Navigation arrows
  - Clickable (jika ada link_url)

## Banner Filtering

Banner yang ditampilkan di frontend:
- `is_active = TRUE`
- `start_date <= NOW()` (atau NULL)
- `end_date >= NOW()` (atau NULL)
- Diurutkan berdasarkan `position ASC`

## Sample Data

Untuk testing, Anda bisa insert sample data:

```sql
INSERT INTO promo_banners (title, description, image_url, link_url, position, is_active) VALUES
('Promo Spesial', 'Dapatkan diskon hingga 50% untuk semua game!', 'https://via.placeholder.com/800x300/FF6B35/FFFFFF?text=Promo+Spesial', 'https://example.com/promo', 1, TRUE),
('Top Up Lebih Hemat', 'Beli sekarang dan dapatkan bonus diamond tambahan', 'https://via.placeholder.com/800x300/4ECDC4/FFFFFF?text=Top+Up+Hemat', NULL, 2, TRUE);
```

## Troubleshooting

### Banner tidak muncul di frontend

1. Cek apakah banner `is_active = TRUE`
2. Cek apakah tanggal masih dalam range (start_date <= NOW() <= end_date)
3. Cek apakah `image_url` valid
4. Cek browser console untuk error

### Error saat create/update banner

1. Pastikan title tidak kosong
2. Pastikan image_url format valid (URL lengkap)
3. Cek apakah user sudah login sebagai ADMIN
4. Cek terminal backend untuk error details

### Banner tidak auto-slide

1. Pastikan ada lebih dari 1 banner aktif
2. Cek browser console untuk error
3. Refresh halaman

