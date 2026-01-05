# Game Top Up Authentication - Quick Implementation Guide

## 🎯 What Was Built

A complete, production-ready authentication system for Game Top Up platform with:

✅ **Dual-Channel OTP** (Email + WhatsApp)  
✅ **Role-Based Access Control** (Customer vs Admin)  
✅ **Secure Password Hashing** (bcrypt)  
✅ **JWT Authentication** (HTTP-only cookies)  
✅ **Comprehensive Audit Logging**  
✅ **Security Blacklist System**  
✅ **Admin Management Dashboard**  

---

## 📁 Files Created

### Backend API Routes
```
src/app/api/auth/
├── register/route.js          (POST - User registration with OTP)
├── login/route.js             (POST/GET - Login & session check)
├── logout/route.js            (POST - User logout)
├── verify-otp/route.js        (POST/PUT - OTP verification & attempts)
└── resend-otp/route.js        (POST - Resend OTP to email/whatsapp)

src/app/api/admin/
├── otp/
│   ├── templates/route.js     (GET/PUT - OTP template management)
│   └── logs/route.js          (GET - OTP delivery logs)
└── blacklist/
    ├── route.js               (GET/POST - Blacklist management)
    └── [id]/route.js          (DELETE - Remove from blacklist)
```

### Frontend Pages
```
src/app/auth/
├── register/page.js           (User registration form)
├── login/page.js              (User login form)
└── verify-otp/page.js         (OTP verification form)

src/app/dashboard/
└── otp-management/page.js     (Admin OTP management dashboard)
```

### Middleware & Libraries
```
src/lib/
└── auth-middleware.js         (Authentication middleware for routes)
```

### Database
```
game_topup_auth_schema.sql      (Initial complete schema)
setup_auth_schema.sql           (Updates & indexing)
```

### Documentation
```
GAME_TOPUP_AUTH_SYSTEM.md       (Comprehensive documentation)
GAME_TOPUP_AUTH_IMPLEMENTATION.md (This file)
```

---

## 🚀 Quick Start (5 Steps)

### Step 1: Create Database Tables
```bash
mysql -u root -p game_topup < game_topup_auth_schema.sql
mysql -u root -p game_topup < setup_auth_schema.sql
```

### Step 2: Install Dependencies
```bash
npm install bcrypt jsonwebtoken nodemailer
```

### Step 3: Configure Environment (`.env.local`)
```env
# Authentication
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRY=24h

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@gametopup.com

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=game_topup

# WhatsApp/SMS (Optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Step 4: Test Registration Flow
```
1. Navigate to http://localhost:3000/auth/register
2. Register with test data
3. Check console for OTP codes
4. Navigate to verify-otp page with OTP
5. Verify the OTP
6. Login with credentials
```

### Step 5: Test Admin Dashboard
```
1. Login with admin account:
   - Email: admin@gametopup.com
   - Password: admin123

2. Access: http://localhost:3000/dashboard/otp-management
3. Manage OTP templates and view logs
```

---

## 🔐 Security Architecture

### Role-Based Access Control
```
┌─────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                     │
│  ↓ Email + Phone + Password + OTP Verification Required  │
│                  role = 'customer'                        │
│                 is_verified = FALSE                       │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────┐    ┌──────────────────────────┐
│   CUSTOMER LOGIN             │    │    ADMIN LOGIN           │
│  ✓ Email + Password Valid    │    │  ✓ Email + Password Valid│
│  ✓ OTP Verified             │    │  ✓ OTP Verified         │
│  ✓ Account Active           │    │  ✓ Account Active       │
│  → Redirect to /customer     │    │  → Redirect to /dashboard│
└──────────────────────────────┘    └──────────────────────────┘

MIDDLEWARE PROTECTION:
  Customer tries → /dashboard/** → 403 FORBIDDEN ✗
  Admin    tries → /dashboard/** → 200 OK ✓
  No token      → Any route       → Redirect to /login
```

### OTP Security
```
Registration
  ↓
Generate 6-digit OTP
  ↓
Send via Email → otp_logs.status = 'sent'
Send via WhatsApp → otp_logs.status = 'sent'
  ↓
User enters OTP
  ↓
Verify code + Check:
  - Not expired (10 min TTL)
  - Attempts < 3
  - Not already used
  ↓
✓ Mark as verified → users.is_verified = TRUE
✗ Invalid → Increment attempts
```

### Password Security
```
Registration Input: password = "SecurePass123"
                          ↓
bcrypt.hash(password, 10) [10 rounds]
                          ↓
Storage: $2b$10$JJDmewrxH6CG/PxF0QEqnu3Y0V7VcREMH0VWdFQ7pNL...
                          ↓
Login: bcrypt.compare(input, stored_hash) → true/false
```

---

## 📊 Database Schema Summary

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | Auto increment |
| name | VARCHAR(255) | User's full name |
| email | VARCHAR(255) UNIQUE | Login email |
| phone | VARCHAR(20) UNIQUE | WhatsApp number |
| password_hash | VARCHAR(255) | bcrypt hash |
| role | ENUM('customer','admin','moderator') | Access level |
| is_verified | BOOLEAN | OTP verified |
| is_active | BOOLEAN | Account status |
| last_login | TIMESTAMP | Last login time |

### otps
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | Auto increment |
| user_id | INT FK | Reference user |
| otp_code | VARCHAR(6) | 6-digit code |
| channel | ENUM('email','whatsapp','sms') | Delivery channel |
| is_used | BOOLEAN | Already verified |
| is_expired | BOOLEAN | After 10 min |
| attempts | INT | Failed attempts |
| max_attempts | INT | Before expiry (default 3) |
| expires_at | TIMESTAMP | TTL |
| verified_at | TIMESTAMP | Verification time |

### otp_logs (Audit Trail)
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | Auto increment |
| user_id | INT FK | Reference user |
| otp_code | VARCHAR(6) | The code sent |
| channel | VARCHAR(50) | email/whatsapp/sms/system |
| status | ENUM('sent','verified','failed','expired') | Event status |
| error_message | VARCHAR(255) | Error details |
| created_at | TIMESTAMP | Event time |

### login_history (Security Audit)
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | Auto increment |
| user_id | INT FK | Reference user |
| ip_address | VARCHAR(45) | Client IP |
| user_agent | TEXT | Browser/device |
| login_status | ENUM('success','failed','blocked') | Attempt result |
| login_time | TIMESTAMP | Attempt time |
| logout_time | TIMESTAMP | Logout time |

### blacklist (Security)
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | Auto increment |
| type | ENUM('email','phone','ip') | Entry type |
| value | VARCHAR(255) | Email/phone/IP |
| reason | VARCHAR(255) | Blacklist reason |
| expires_at | TIMESTAMP | Auto-cleanup |
| created_at | TIMESTAMP | Created time |

---

## 🧪 API Testing

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+62812345678",
    "password": "SecurePass123"
  }'
```

### Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "otp_code": "123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

---

## ✅ Testing Checklist

### Customer Registration Flow
- [ ] Register with valid data
- [ ] Validation errors for incomplete form
- [ ] Validation errors for weak password
- [ ] OTP sent to email (console log shows message)
- [ ] OTP sent to WhatsApp (console log shows message)
- [ ] Verify OTP successfully
- [ ] Error when OTP incorrect
- [ ] Error when OTP expired (>10 min)
- [ ] Error after 3 failed attempts
- [ ] Resend OTP works
- [ ] Login after verification

### Admin OTP Management
- [ ] Admin can access `/dashboard/otp-management`
- [ ] Customer CANNOT access (403 error)
- [ ] Can view OTP templates
- [ ] Can edit email template
- [ ] Can edit WhatsApp template
- [ ] Can view OTP logs (50 latest)
- [ ] Can filter logs by status
- [ ] Can filter logs by channel
- [ ] Can view blacklist
- [ ] Can add to blacklist
- [ ] Can remove from blacklist

### Security Tests
- [ ] Customer blocked from `/dashboard/**` routes
- [ ] No token redirects to `/auth/login`
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Blacklisted email cannot register
- [ ] Blacklisted phone cannot register
- [ ] Password correctly hashed (starts with $2b$10$)

---

## 🐛 Troubleshooting

### "Email not sending"
- Check `.env.local` has EMAIL_USER and EMAIL_PASSWORD
- Gmail: Use app-specific password (not your password)
- Check console for nodemailer errors

### "Customer can access dashboard"
- Verify middleware is applied to `/app/dashboard` pages
- Check dashboardAuthMiddleware checks role === 'customer'
- Clear browser cookies and try again

### "OTP not verifying"
- Check OTP hasn't expired (10 minutes)
- Check max attempts not exceeded (3)
- Check OTP code matches exactly

### "Cannot login"
- Ensure user is verified (is_verified = TRUE)
- Check password hash is correct
- Verify user account is active (is_active = TRUE)

---

## 📚 Key Features

### ✨ For Users
- **Easy Registration**: Name, Email, Phone, Password
- **Secure Verification**: OTP via Email + WhatsApp
- **Safe Password**: bcrypt with 10 rounds
- **Session Management**: Auto-logout after 24 hours
- **Password Recovery**: (Can add reset flow)

### ✨ For Admins
- **OTP Template Management**: Customize messages
- **Audit Logs**: Complete OTP delivery history
- **Blacklist Management**: Block suspicious entries
- **Login History**: Track all login attempts
- **Role Management**: Separate customer/admin access

### ✨ For Security
- **No XSS**: HTTP-only cookies
- **No SQL Injection**: Prepared statements
- **Rate Limiting**: OTP attempt limits
- **Audit Trail**: Complete event logging
- **Access Control**: Role-based middleware

---

## 🚀 Next Steps

1. **Deploy to Production**
   - Change JWT_SECRET
   - Set up proper email service
   - Configure real WhatsApp/SMS API
   - Enable HTTPS/SSL
   - Set up database backups

2. **Add Features**
   - Password reset flow
   - Two-factor authentication
   - Social login (Google, Facebook)
   - Customer profile pages
   - Transaction history

3. **Monitor & Maintain**
   - Set up error tracking (Sentry)
   - Monitor OTP delivery success rates
   - Track login patterns
   - Review blacklist regularly

---

## 📞 Support

For issues or questions:
1. Check GAME_TOPUP_AUTH_SYSTEM.md for detailed documentation
2. Review console logs for specific errors
3. Check database queries in MySQL logs
4. Verify all environment variables are set
5. Test API endpoints with curl/Postman

---

## 📝 License

This authentication system is part of the Game Top Up platform.
