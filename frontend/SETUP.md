# Setup Frontend Top Up Website

## Instalasi

1. Masuk ke folder frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy file environment:
```bash
# Windows PowerShell
Copy-Item env.example .env.local

# Linux/Mac
cp env.example .env.local
```

4. Edit `.env.local` dan sesuaikan URL API backend:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Menjalankan Development Server

```bash
npm run dev
```

Website akan berjalan di `http://localhost:3001`

## Build untuk Production

```bash
npm run build
npm start
```

## Struktur Project

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Halaman utama
│   │   ├── globals.css   # Global styles
│   │   ├── loading.tsx   # Loading component
│   │   └── error.tsx     # Error boundary
│   ├── components/       # React components
│   │   ├── GameSelection.tsx
│   │   └── TopUpForm.tsx
│   ├── lib/              # Utilities
│   │   └── api.ts        # API client
│   └── types/            # TypeScript types
│       └── game.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## API Endpoints yang Digunakan

- `GET /api/games` - Mendapatkan daftar game
- `POST /api/topup` - Submit top up order
- `GET /api/topup` - Mendapatkan history top up

## Catatan

- Frontend berjalan di port 3001 (backend di port 3000)
- Pastikan backend sudah running sebelum menjalankan frontend
- Frontend menggunakan TypeScript untuk type safety
- Styling menggunakan Tailwind CSS

