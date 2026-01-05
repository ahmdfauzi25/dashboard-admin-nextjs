# Troubleshooting: Gambar Game Tidak Muncul

## Masalah
Gambar game dari database tidak muncul di frontend website top up.

## Solusi

### 1. Periksa Format URL Gambar di Database

Gambar game bisa disimpan dalam beberapa format:
- **URL lengkap**: `https://example.com/image.png`
- **URL relatif**: `/img/games/mobile-legends.png`
- **Base64**: `data:image/png;base64,iVBORw0KG...`

### 2. Pastikan Backend Berjalan

```bash
# Di root project (dashboard-nextjs)
npm run dev
```

Backend harus berjalan di `http://localhost:3000`

### 3. Periksa Console Browser

Buka browser console (F12) dan periksa:
- Apakah ada error CORS?
- Apakah URL gambar valid?
- Apakah gambar gagal dimuat?

### 4. Periksa Network Tab

Di browser DevTools > Network tab:
- Cek request ke `/api/games`
- Lihat response apakah `imageUrl` ada dan valid
- Cek apakah request gambar gagal (status 404, 403, dll)

### 5. Format URL yang Didukung

API akan otomatis mengkonversi:
- URL relatif (`/img/game.png`) → `http://localhost:3000/img/game.png`
- URL tanpa leading slash (`img/game.png`) → `http://localhost:3000/img/game.png`
- Base64 data URL → digunakan langsung
- URL lengkap → digunakan langsung

### 6. Test dengan URL Langsung

Coba akses URL gambar langsung di browser:
```
http://localhost:3000/api/games
```

Lihat response JSON, cek field `imageUrl` untuk setiap game.

### 7. Pastikan Gambar Ada di Public Folder (jika menggunakan path relatif)

Jika menggunakan path relatif seperti `/img/games/game.png`, pastikan file ada di:
```
dashboard-nextjs/public/img/games/game.png
```

### 8. Cek CORS

Jika gambar dari domain lain, pastikan:
- Domain mengizinkan CORS
- Atau gunakan proxy di backend

### 9. Debug Logging

Backend akan log:
- Format games yang dikembalikan
- URL gambar untuk setiap game

Frontend akan log:
- Games yang di-fetch
- Jumlah games dengan gambar
- URL gambar game pertama

## Contoh URL yang Valid

✅ **URL Lengkap:**
```
https://cdn.example.com/games/mobile-legends.png
```

✅ **URL Relatif:**
```
/img/games/mobile-legends.png
```

✅ **Base64:**
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

❌ **URL Invalid:**
```
img/games/game.png  (tanpa leading slash, akan dikonversi otomatis)
```

## Cara Menambahkan Gambar Game

### Via Dashboard Admin:
1. Buka `/dashboard/games`
2. Edit atau tambah game
3. Isi field "Image URL" dengan:
   - URL lengkap: `https://example.com/image.png`
   - Path relatif: `/img/games/game.png`
   - Base64: `data:image/png;base64,...`

### Via Database Langsung:
```sql
UPDATE games 
SET image_url = 'https://example.com/game-image.png' 
WHERE id = 1;
```

## Testing

1. Buka frontend: `http://localhost:3001`
2. Buka browser console (F12)
3. Periksa log:
   - "Games fetched: X games"
   - "Games with images: Y"
   - "First game image URL: ..."
4. Periksa Network tab untuk request gambar
5. Jika gambar gagal, akan muncul fallback icon 🎮

