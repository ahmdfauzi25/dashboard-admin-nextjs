# Debug Guide: Masalah "Gagal memuat daftar game"

## Langkah-langkah Debug

### 1. Pastikan Backend Berjalan

**Cek apakah backend berjalan:**
```bash
# Di terminal, pastikan backend berjalan di port 3000
# Buka browser dan akses:
http://localhost:3000/api/games
```

**Jika backend tidak berjalan:**
```bash
# Di root project (dashboard-nextjs)
npm run dev
```

**Expected response:**
```json
{
  "success": true,
  "games": [...]
}
```

### 2. Cek Browser Console

Buka browser console (F12) dan periksa:

**Log yang seharusnya muncul:**
- `Fetching games from: http://localhost:3000/api/games`
- `Games API response: {...}`
- `Games fetched: X games`

**Jika ada error:**
- `Error fetching games: ...` - Lihat detail error
- `Tidak dapat terhubung ke server` - Backend tidak berjalan
- `Server error: 500` - Ada masalah di backend

### 3. Cek Network Tab

Di browser DevTools > Network tab:

1. Refresh halaman
2. Cari request ke `/api/games` atau `localhost:3000`
3. Klik request tersebut
4. Periksa:
   - **Status**: Harus 200 (OK)
   - **Response**: Harus berisi JSON dengan `success: true`
   - **Headers**: Periksa CORS headers

**Jika status 404:**
- Backend tidak berjalan atau URL salah

**Jika status 500:**
- Ada error di backend, cek terminal backend

**Jika status CORS error:**
- Backend tidak mengirim CORS headers dengan benar

### 4. Cek Environment Variables

**Pastikan file `.env.local` ada di folder frontend:**
```bash
cd frontend
ls -la .env.local  # Linux/Mac
dir .env.local     # Windows
```

**Isi file `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Restart frontend setelah mengubah .env.local:**
```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

### 5. Test API Langsung

**Test dengan curl atau browser:**
```bash
# Test API endpoint
curl http://localhost:3000/api/games

# Atau buka di browser:
http://localhost:3000/api/games
```

**Expected response:**
```json
{
  "success": true,
  "games": [
    {
      "id": 1,
      "name": "Mobile Legends",
      "imageUrl": "...",
      ...
    }
  ]
}
```

### 6. Cek Database

**Pastikan ada data game di database:**
```sql
SELECT * FROM games WHERE is_active = TRUE;
```

**Jika tidak ada data:**
- Tambahkan game melalui dashboard admin di `/dashboard/games`
- Atau insert manual ke database

### 7. Cek CORS

**Jika ada error CORS di console:**
- Backend sudah menambahkan CORS headers
- Pastikan backend route `/api/games` mengembalikan headers:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`

### 8. Common Issues

#### Issue: "Tidak dapat terhubung ke server"
**Solusi:**
- Pastikan backend berjalan di port 3000
- Cek firewall tidak memblokir port 3000
- Cek apakah ada aplikasi lain menggunakan port 3000

#### Issue: "Server error: 500"
**Solusi:**
- Cek terminal backend untuk error details
- Cek koneksi database
- Cek apakah tabel `games` dan `categories` ada

#### Issue: "Tidak ada game tersedia"
**Solusi:**
- Tambahkan game melalui dashboard admin
- Atau set `is_active = TRUE` di database

#### Issue: CORS Error
**Solusi:**
- Backend sudah menambahkan CORS headers
- Pastikan menggunakan `OPTIONS` handler untuk preflight

## Quick Fix Checklist

- [ ] Backend berjalan di `http://localhost:3000`
- [ ] Frontend berjalan di `http://localhost:3001`
- [ ] File `.env.local` ada dan berisi `NEXT_PUBLIC_API_URL=http://localhost:3000/api`
- [ ] Database memiliki data game dengan `is_active = TRUE`
- [ ] Tidak ada error di browser console
- [ ] Network tab menunjukkan request berhasil (status 200)
- [ ] API endpoint `/api/games` bisa diakses langsung di browser

## Test Manual

1. **Test Backend API:**
   ```
   http://localhost:3000/api/games
   ```
   Harus return JSON dengan `success: true`

2. **Test Frontend:**
   ```
   http://localhost:3001
   ```
   Harus menampilkan daftar game atau error message yang jelas

3. **Check Console:**
   - Buka browser console (F12)
   - Refresh halaman
   - Periksa semua log dan error

## Still Not Working?

Jika masih gagal setelah semua langkah di atas:

1. **Copy error message lengkap dari browser console**
2. **Copy response dari Network tab**
3. **Cek terminal backend untuk error logs**
4. **Pastikan semua dependencies terinstall:**
   ```bash
   # Di root
   npm install
   
   # Di frontend
   cd frontend
   npm install
   ```

