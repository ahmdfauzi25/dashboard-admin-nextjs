# Game Top Up Authentication System - Documentation

## Overview
Complete implementation of a Customer Authentication system for Game Top Up platform with:
- Dual-channel OTP verification (Email + WhatsApp)
- Role-based access control (Customer vs Admin/Moderator)
- Secure password hashing (bcrypt)
- JWT token authentication
- Comprehensive audit logging
- Security blacklist system

## Database Schema

### Tables Created
1. **users** - User accounts with role-based access
2. **otps** - OTP records with expiry tracking
3. **otp_logs** - Audit trail for OTP sending
4. **login_history** - Login attempts and security tracking
5. **otp_templates** - Customizable message templates
6. **blacklist** - Security blacklist (email, phone, IP)

## API Endpoints

### Authentication Endpoints

#### 1. Register User
- **Route**: `POST /api/auth/register`
- **Request**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+62812345678",
    "password": "SecurePass123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "user_id": 1,
    "email_sent": true,
    "whatsapp_sent": true
  }
  ```
- **Status Codes**:
  - 201: Success
  - 400: Validation error
  - 403: Blacklisted
  - 409: User already exists
  - 500: Server error

#### 2. Verify OTP
- **Route**: `POST /api/auth/verify-otp`
- **Request**:
  ```json
  {
    "user_id": 1,
    "otp_code": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Email verification successful",
    "user_id": 1
  }
  ```
- **Status Codes**:
  - 200: OTP verified
  - 401: Invalid/expired OTP
  - 404: User not found
  - 429: Max attempts exceeded
  - 500: Server error

**CRITICAL**: After OTP verification:
- `users.is_verified` set to TRUE
- User can now login

#### 3. Resend OTP
- **Route**: `POST /api/auth/resend-otp`
- **Request**:
  ```json
  {
    "user_id": 1
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP resent successfully",
    "email_sent": true,
    "whatsapp_sent": true
  }
  ```

#### 4. Login User
- **Route**: `POST /api/auth/login`
- **Request**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
  ```
- **Status Codes**:
  - 200: Success
  - 400: Not verified
  - 401: Invalid credentials
  - 403: Account inactive
  - 500: Server error

**CRITICAL - Role-Based Access Control**:
- Returns JWT token for all users
- Token includes: `{ userId, email, role }`
- Middleware blocks customers from accessing `/dashboard/**` routes
- Response code: `403 Forbidden` for customer accessing admin routes

**HTTP-Only Cookie**: Token set as secure HTTP-only cookie for enhanced security

#### 5. Logout
- **Route**: `POST /api/auth/logout`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- **Action**: Clears auth_token cookie

#### 6. Get Current User
- **Route**: `GET /api/auth/login`
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
  ```

### Admin Endpoints

#### OTP Templates Management
- **Route**: `GET /api/admin/otp/templates`
  - Requires: Admin role
  - Returns: List of OTP templates (email, whatsapp, sms)

- **Route**: `PUT /api/admin/otp/templates`
  - Requires: Admin role
  - Updates: OTP template text with {{OTP_CODE}} variable support

#### OTP Logs
- **Route**: `GET /api/admin/otp/logs?limit=50&status=sent&channel=email`
  - Requires: Admin role
  - Query params:
    - `limit`: Number of logs to return (default: 50)
    - `status`: Filter by status (sent, verified, failed, expired)
    - `channel`: Filter by channel (email, whatsapp, sms)

#### Blacklist Management
- **Route**: `GET /api/admin/blacklist`
  - Requires: Admin role
  - Returns: List of blacklisted entries

- **Route**: `POST /api/admin/blacklist`
  - Requires: Admin role
  - Request:
    ```json
    {
      "type": "email",
      "value": "spam@example.com",
      "reason": "Suspicious activity",
      "expires_at": "2024-12-31 23:59:59"
    }
    ```

- **Route**: `DELETE /api/admin/blacklist/{id}`
  - Requires: Admin role
  - Action: Remove item from blacklist

## Frontend Pages

### 1. Register Page (`/auth/register`)
- Form fields: Name, Email, Phone (WhatsApp), Password, Confirm Password
- Validation:
  - All fields required
  - Password ≥ 8 characters
  - Passwords must match
- On success: Redirects to `/auth/verify-otp?user_id={id}`
- OTP sent to: Email and WhatsApp

### 2. Verify OTP Page (`/auth/verify-otp`)
- Input: 6-digit OTP code
- Features:
  - Auto-focus on input
  - Resend button with 60-second countdown
  - Attempt tracking
- On success: Redirects to `/auth/login`

### 3. Login Page (`/auth/login`)
- Form fields: Email, Password
- Features:
  - Check current authentication status
  - Role-based redirect:
    - **Customer**: Redirects to `/customer`
    - **Admin/Moderator**: Redirects to `/dashboard`
  - "Forgot password?" link
  - Link to registration page

### 4. Admin OTP Management (`/dashboard/otp-management`)
- **Requirements**:
  - Admin role required
  - Middleware protection enforced
- **Features**:
  - **Tab 1 - OTP Templates**:
    - View all templates (email, whatsapp, sms)
    - Edit template text with {{OTP_CODE}} support
    - Last updated timestamp
  - **Tab 2 - OTP Logs**:
    - Table with user_id, channel, status, timestamp
    - Filter by status and channel
    - Real-time update capability
  - **Tab 3 - Blacklist**:
    - View all blacklisted entries (email, phone, IP)
    - Add new entries with expiry option
    - Remove entries
    - View reason and expiry dates

## Security Features

### 1. Password Security
- **Algorithm**: bcrypt with 10 rounds
- **Example**: `$2b$10$...`
- **No**: Plain text storage

### 2. OTP Security
- **Length**: 6 digits
- **Expiry**: 10 minutes from creation
- **Max Attempts**: 3 before expiry
- **Channels**: Email + WhatsApp (dual verification)
- **Audit Log**: All OTP events logged

### 3. Authentication
- **Token**: JWT with 24-hour expiry
- **Storage**: HTTP-only cookie (secure)
- **Payload**: userId, email, role
- **Refresh**: 24-hour cookie expiry

### 4. Role-Based Access Control
```
CUSTOMER:
  ✓ Can register, verify OTP, login
  ✓ Access: /customer routes only
  ✗ FORBIDDEN: /dashboard/** (403)

ADMIN/MODERATOR:
  ✓ Can login
  ✓ Access: /dashboard/** routes
  ✓ Can manage OTP templates, logs, blacklist
  ✓ Can view login history

BLOCKED BY MIDDLEWARE:
  - Customer attempting /dashboard/** → 403 Forbidden
  - No token → Redirect to /auth/login
  - Invalid token → 401 Unauthorized
```

### 5. Blacklist System
- **Types**: email, phone, ip_address
- **Features**:
  - Auto-check on registration
  - Admin management
  - Optional expiry date
  - Automatic cleanup of expired entries

### 6. Audit Logging
- **Tables**:
  - `login_history`: Every login attempt with status
  - `otp_logs`: Every OTP send/verify with status
- **Tracked**:
  - Successful logins
  - Failed login attempts
  - OTP generation and verification
  - OTP expiry and max attempts

## Middleware

### Auth Middleware (`lib/auth-middleware.js`)

#### dashboardAuthMiddleware(request)
- **Purpose**: Protect dashboard routes
- **Checks**:
  1. Token exists
  2. Token is valid
  3. Role !== 'customer' (CRITICAL REQUIREMENT)
- **Returns**:
  - 403 Forbidden if customer
  - Redirect to login if no token
  - Continues to route if admin/moderator

#### apiAuthMiddleware(request, requiredRoles)
- **Purpose**: Protect API endpoints
- **Parameters**:
  - `request`: Next.js request object
  - `requiredRoles`: Array of allowed roles (e.g., ['admin'])
- **Returns**: Object with:
  - `authenticated`: boolean
  - `user`: Decoded JWT payload
  - `statusCode`: 200, 401, or 403
  - `error`: Error message

#### logoutMiddleware(response)
- **Purpose**: Clear auth cookie on logout
- **Action**: Delete 'auth_token' cookie

## Environment Variables

Create `.env.local`:
```
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=24h

# Email Configuration (for Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@gametopup.com

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=game_topup

# Twilio/WhatsApp (for OTP delivery)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# WhatsApp Business API
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_ID=
```

## Setup Instructions

### 1. Database Setup
```sql
-- Execute game_topup_auth_schema.sql
mysql -u root -p game_topup < game_topup_auth_schema.sql
```

### 2. Install Dependencies
```bash
npm install bcrypt jsonwebtoken nodemailer
```

### 3. Create Auth Folder Structure
```
src/
  app/
    api/
      auth/
        register/route.js ✓
        login/route.js ✓
        logout/route.js ✓
        verify-otp/route.js ✓
        resend-otp/route.js ✓
      admin/
        otp/
          templates/route.js ✓
          logs/route.js ✓
        blacklist/
          route.js ✓
          [id]/route.js ✓
    auth/
      login/page.js ✓
      register/page.js ✓
      verify-otp/page.js ✓
    dashboard/
      otp-management/page.js ✓
  lib/
    auth-middleware.js ✓
    mysql.js (existing)
```

### 4. Configure Environment
- Update `.env.local` with real credentials
- Set up email provider (Gmail, SendGrid, etc.)
- Configure WhatsApp/SMS provider (Twilio, etc.)

### 5. Test Flow
1. Register: `/auth/register`
2. Enter email/OTP from console logs
3. Verify: `/auth/verify-otp`
4. Login: `/auth/login`
5. Access admin: `/dashboard/otp-management` (admin only)
6. Try customer access to dashboard: Should get 403 Forbidden

## Testing Checklist

### Customer Flow
- [ ] Register with valid data
- [ ] OTP sent to email (check console)
- [ ] OTP sent to WhatsApp (check console)
- [ ] Verify OTP correctly
- [ ] Verify OTP incorrectly (should fail)
- [ ] OTP attempts exceeded (should block)
- [ ] Login after verification
- [ ] Try accessing /dashboard (should get 403)
- [ ] Logout works

### Admin Flow
- [ ] Login as admin (must pre-create in DB with role='admin')
- [ ] Access /dashboard/otp-management
- [ ] Edit OTP templates
- [ ] View OTP logs
- [ ] Manage blacklist
- [ ] Add/remove blacklist entries

### Security Tests
- [ ] No token → Cannot access protected routes
- [ ] Invalid token → 401 Unauthorized
- [ ] Customer token → Cannot access /dashboard
- [ ] Expired OTP → Cannot verify
- [ ] Max OTP attempts → Cannot verify
- [ ] Blacklisted email → Cannot register

## Architecture Decisions

### Why Dual-Channel OTP?
- **Security**: Two independent channels reduce phishing risk
- **Reliability**: If one fails, user still has second channel
- **User Experience**: Flexibility in verification method

### Why HTTP-Only Cookies?
- **XSS Protection**: JavaScript cannot access token
- **CSRF Protection**: Automatic sending with requests
- **Security**: More secure than localStorage

### Why Role-Based Middleware?
- **Consistency**: Single point of authorization
- **Maintainability**: Easy to add/modify roles
- **Security**: Prevents customer access to admin features

### Why Comprehensive Audit Logging?
- **Compliance**: Track all authentication events
- **Security**: Identify suspicious patterns
- **Support**: Help troubleshoot user issues

## Future Enhancements

1. **Password Reset Flow**
   - Forgot password endpoint
   - Email verification
   - New password confirmation

2. **Two-Factor Authentication (2FA)**
   - TOTP (Google Authenticator)
   - Backup codes

3. **Social Login**
   - Google OAuth
   - Facebook OAuth

4. **IP Whitelisting**
   - Trusted device management
   - Location-based warnings

5. **Rate Limiting**
   - Login attempt rate limiting
   - OTP request rate limiting

6. **Advanced Analytics**
   - Login trends
   - Failed login patterns
   - Geographic distribution

## Troubleshooting

### OTP Not Sending
1. Check email credentials in `.env.local`
2. Check console logs for errors
3. Verify email account allows app passwords
4. Check spam folder

### Customer Can Access Dashboard
1. Verify middleware is applied to all dashboard routes
2. Check JWT token includes role
3. Verify dashboardAuthMiddleware checks role === 'customer'
4. Clear browser cookies

### Cannot Verify OTP
1. Check OTP hasn't expired (10 minutes)
2. Check max attempts not exceeded (3)
3. Check user is verified (is_verified=FALSE)
4. Check OTP code matches exactly (case-sensitive)

### JWT Token Invalid
1. Check JWT_SECRET is consistent
2. Verify token hasn't expired (24 hours)
3. Check token is sent in auth_token cookie
4. Verify user still exists and is_active=TRUE
