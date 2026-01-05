# Backend Setup & Troubleshooting

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Buat file `.env` di root project:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=db_dashboard_nextjs
DB_PORT=3306

# JWT Secret
JWT_SECRET=your-secret-key-here

# Base URL (optional)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Setup Database
```bash
# Jalankan migration SQL files:
# - create_users_table.sql
# - create_games_tables.sql
# - create_topup_orders_table.sql
```

### 4. Start Backend
```bash
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

## Health Check

Test apakah backend berjalan:
```bash
# Browser atau curl
http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-05T...",
  "database": "connected",
  "message": "Backend is running and database is connected"
}
```

## API Endpoints

### Public Endpoints (No Auth Required)

- `GET /api/health` - Health check
- `GET /api/games` - Get all active games
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Protected Endpoints (Auth Required)

- `GET /api/me` - Get current user
- `POST /api/topup` - Submit top up order
- `GET /api/topup` - Get top up history

## CORS Configuration

Backend sudah dikonfigurasi untuk menerima request dari frontend:
- **Allowed Origins:** `*` (all origins)
- **Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Allowed Headers:** Content-Type, Authorization, X-Requested-With

CORS headers otomatis ditambahkan di:
- `src/middleware.js` - Global middleware untuk semua `/api/*` routes
- Setiap API route juga menambahkan CORS headers secara eksplisit

## Common Issues

### Issue: "Database connection refused"

**Symptoms:**
- Error: `ECONNREFUSED`
- Health check returns `database: "disconnected"`

**Solutions:**
1. Pastikan MySQL/XAMPP berjalan
2. Cek credentials di `.env`
3. Test koneksi:
   ```bash
   mysql -u root -p
   ```
4. Pastikan database sudah dibuat:
   ```sql
   CREATE DATABASE db_dashboard_nextjs;
   ```

### Issue: "Table does not exist"

**Symptoms:**
- Error: `ER_NO_SUCH_TABLE`
- API returns 500 error

**Solutions:**
1. Jalankan migration SQL files:
   ```sql
   -- Di phpMyAdmin atau MySQL client
   SOURCE create_users_table.sql;
   SOURCE create_games_tables.sql;
   SOURCE create_topup_orders_table.sql;
   ```
2. Atau copy-paste SQL dari file-file tersebut

### Issue: "Access denied"

**Symptoms:**
- Error: `ER_ACCESS_DENIED_ERROR`

**Solutions:**
1. Cek username dan password di `.env`
2. Pastikan user MySQL memiliki privileges:
   ```sql
   GRANT ALL PRIVILEGES ON db_dashboard_nextjs.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Issue: CORS Error

**Symptoms:**
- Browser console shows CORS error
- Request blocked by browser

**Solutions:**
1. Backend sudah memiliki CORS middleware di `src/middleware.js`
2. Pastikan `OPTIONS` handler ada di setiap route
3. Cek Network tab untuk melihat CORS headers

### Issue: Port 3000 Already in Use

**Symptoms:**
- Error: `EADDRINUSE: address already in use :::3000`

**Solutions:**
1. Cari process yang menggunakan port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```
2. Kill process atau gunakan port lain:
   ```bash
   # Edit package.json
   "dev": "next dev -p 3001"
   ```

## Testing Backend

### 1. Test Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Test Games API
```bash
curl http://localhost:3000/api/games
```

### 3. Test dengan Browser
Buka di browser:
- `http://localhost:3000/api/health`
- `http://localhost:3000/api/games`

## Logging

Backend akan log:
- Database queries (di development mode)
- API requests
- Errors dengan detail (di development mode)

**Check logs di terminal** tempat backend berjalan.

## Database Connection Pool

Backend menggunakan connection pool untuk efisiensi:
- Pool size: Default MySQL2 pool settings
- Auto-reconnect: Enabled
- Error handling: Comprehensive dengan helpful messages

## Production Considerations

Untuk production:
1. Set `NODE_ENV=production`
2. Gunakan secure JWT secret
3. Restrict CORS origins (jangan `*`)
4. Setup proper database credentials
5. Enable SSL untuk database connection
6. Setup proper logging (Winston, Pino, etc.)

## Next Steps

Setelah backend berjalan:
1. Test health check endpoint
2. Test games API endpoint
3. Setup frontend dengan URL backend yang benar
4. Test full flow: Frontend → Backend → Database

