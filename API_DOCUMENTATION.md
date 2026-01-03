# API Documentation - Register & Login

## Base URL
```
http://localhost:3000/api
```

## Authentication
API menggunakan JWT (JSON Web Token) untuk autentikasi. Token dikirim melalui:
- **HTTP-only Cookie** (otomatis oleh browser)
- **Authorization Header** (opsional): `Bearer <token>`

---

## 1. Register API

### Endpoint
```
POST /api/register
```

### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER" // optional, default: "USER"
}
```

### Validation Rules
- **name**: Required, minimum 2 characters
- **email**: Required, valid email format
- **password**: Required, minimum 6 characters
- **role**: Optional, values: "USER", "ADMIN", "MODERATOR" (default: "USER")

### Success Response (201)
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

#### 400 - Bad Request
```json
{
  "error": "Email, name, and password are required"
}
```

```json
{
  "error": "Invalid email format"
}
```

```json
{
  "error": "Password must be at least 6 characters"
}
```

#### 409 - Conflict
```json
{
  "error": "User with this email already exists"
}
```

#### 503 - Service Unavailable
```json
{
  "error": "Database connection failed. Please check your database configuration."
}
```

---

## 2. Login API

### Endpoint
```
POST /api/login
```

### Request Body
```json
{
  "username": "john@example.com", // or name
  "password": "password123"
}
```

### Notes
- `username` dapat berupa **email** atau **name** (case-insensitive untuk email)
- Password akan di-verify dengan hash yang tersimpan di database

### Success Response (200)
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

#### 400 - Bad Request
```json
{
  "error": "Username and password are required"
}
```

#### 401 - Unauthorized
```json
{
  "error": "Invalid username or password"
}
```

#### 503 - Service Unavailable
```json
{
  "error": "Database connection failed. Please check your database configuration."
}
```

---

## 3. Get Current User API

### Endpoint
```
GET /api/me
```

### Headers
```
Authorization: Bearer <token>
```
atau menggunakan cookie (otomatis)

### Success Response (200)
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Responses

#### 401 - Unauthorized
```json
{
  "error": "Unauthorized - Please login first"
}
```

---

## 4. Logout API

### Endpoint
```
POST /api/logout
```

### Success Response (200)
```json
{
  "message": "Logout successful"
}
```

---

## Testing dengan cURL

### Register
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User (dengan token)
```bash
curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Security Features

1. **Password Hashing**: Menggunakan bcrypt dengan salt rounds 10
2. **JWT Tokens**: Token-based authentication dengan expiration
3. **HTTP-only Cookies**: Token disimpan di cookie yang tidak bisa diakses JavaScript
4. **Input Validation**: Validasi di backend untuk semua input
5. **Error Handling**: Error messages yang informatif tanpa expose sensitive data

---

## Environment Variables

Pastikan file `.env` berisi:
```env
DATABASE_URL="mysql://user:password@host:port/database"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
```

---

## Troubleshooting

### Error: "Database connection failed"
- Pastikan MySQL server berjalan
- Cek `DATABASE_URL` di file `.env`
- Pastikan database sudah dibuat


### Error: "Invalid token"
- Pastikan `JWT_SECRET` sudah di-set di `.env`
- Token mungkin sudah expired (default: 7 hari)

