# Website Top Up - Frontend

Website top up terpisah dari dashboard admin, menggunakan Next.js dengan TypeScript.

## Struktur Project

```
dashboard-nextjs/
├── src/                    # Dashboard Admin (Backend)
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   └── dashboard/     # Admin dashboard pages
│   └── ...
├── frontend/              # Website Top Up (Frontend)
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API client & utilities
│   │   └── types/        # TypeScript types
│   └── ...
└── ...
```

## Setup

### 1. Setup Backend (Dashboard Admin)

Backend sudah ada di root project. Pastikan:
- MySQL database sudah running
- Environment variables sudah dikonfigurasi
- Jalankan migration SQL untuk tabel `topup_orders`:
  ```sql
  -- Jalankan file: create_topup_orders_table.sql
  ```

### 2. Setup Frontend (Website Top Up)

1. Masuk ke folder frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment:
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Jalankan development server:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3001`

## Fitur

### Frontend (Website Top Up)
- ✅ Halaman utama dengan daftar game
- ✅ Form top up dengan validasi
- ✅ Integrasi dengan backend API
- ✅ Responsive design dengan Tailwind CSS
- ✅ TypeScript untuk type safety

### Backend API
- ✅ `GET /api/games` - Daftar game (hanya yang aktif)
- ✅ `POST /api/topup` - Submit top up order
- ✅ `GET /api/topup` - History top up user

## Database

Tabel yang diperlukan:
- `games` - Data game (sudah ada)
- `topup_orders` - Order top up (buat dengan `create_topup_orders_table.sql`)
- `users` - User accounts (sudah ada)

## Development

### Backend (Port 3000)
```bash
npm run dev
```

### Frontend (Port 3001)
```bash
cd frontend
npm run dev
```

## Production Build

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Catatan

- Frontend dan backend berjalan di port berbeda (3001 dan 3000)
- Frontend menggunakan TypeScript, backend menggunakan JavaScript
- Frontend hanya untuk customer, backend untuk admin dashboard
- Authentication menggunakan JWT cookies (shared antara frontend dan backend)

