# Top Up Website Frontend

Website top up untuk customer menggunakan Next.js dengan TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.local.example` ke `.env.local`:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` dengan URL API backend yang sesuai.

4. Run development server:
```bash
npm run dev
```

Website akan berjalan di `http://localhost:3001`

## Struktur Project

- `src/app/` - Halaman dan routes
- `src/components/` - Komponen React
- `src/lib/` - Utilities dan API client
- `src/types/` - TypeScript type definitions

