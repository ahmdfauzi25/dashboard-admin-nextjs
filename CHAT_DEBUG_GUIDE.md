# 🔧 Chat System Debugging Guide

## Problem Summary
Admin user logs in to chat but sees "No users available" despite reseller messages existing in database.

## Fixed Issues
1. ✅ **JWT Token Field Mismatch**: 
   - Login generates token with `id` field
   - Chat API was looking for `decoded.userId` field
   - **Fix**: Updated `/api/messages/users` and `/api/messages` to use `decoded.id || decoded.userId`

2. ✅ **Test Data**: 
   - Created script `scripts/insert-test-messages.js` 
   - Verified admin (ID=1) and reseller (ID=4) exist
   - 13 messages from reseller to admin confirmed in database

3. ✅ **SQL Query Ordering**:
   - NULL last_message_time could cause ordering issues
   - Added fallback sort by `u.name ASC`

## How to Test

### Step 1: Ensure Next.js is Running
```bash
cd "d:\POC Code\Dashboard\dashboard-nextjs"
npm run dev
```

### Step 2: Login
1. Open browser: `http://localhost:3000/login`
2. Enter credentials:
   - **Email**: admin@superadmin.com
   - **Password**: admin123

### Step 3: Navigate to Chat
1. Go to Dashboard > Chat
2. Look at the Sidebar - should show list of resellers

### Step 4: Verify in Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. You should see logs from `/api/messages/users`:
   ```
   Current User ID: 1
   Current User Role: ADMIN
   SQL WHERE Clause: WHERE UPPER(u.role) = 'RESELLER'
   Found users: 1
   ```

### Step 5: Check Network Response
1. Go to Network tab
2. Look for `/api/messages/users` request
3. Response should contain:
   ```json
   {
     "success": true,
     "users": [
       {
         "id": 4,
         "name": "Ahmad Fauzi",
         "role": "RESELLER",
         "unread_count": 3,
         "last_message": "Test message dari reseller ke admin",
         "last_message_time": "2026-01-03T18:44:57.000Z"
       }
     ]
   }
   ```

## Files Modified

### 1. src/app/api/messages/users/route.js
- Added support for `decoded.id` field (in addition to `decoded.userId`)
- Added SQL order by fallback for NULL values

### 2. src/app/api/messages/route.js  
- Fixed GET handler to use `decoded.id || decoded.userId`
- Fixed POST handler to use `decoded.id || decoded.userId`

### 3. scripts/insert-test-messages.js (NEW)
- Automatically detects admin and reseller users
- Inserts test messages if none exist
- Shows detailed confirmation table

## Troubleshooting

### Issue: Still seeing "No users available"
**Check these in order:**

1. **Browser Console (F12 → Console)**
   - Look for errors about JWT or database
   - Copy any error messages

2. **Terminal Console** (where npm run dev is running)
   - Look for logs from `/api/messages/users` endpoint
   - Should show: Current User ID, Current User Role, Found users count

3. **Database Check**
   ```sql
   -- Check admin exists
   SELECT id, name, email, role FROM users WHERE email = 'admin@superadmin.com';
   
   -- Check reseller exists  
   SELECT id, name, email, role FROM users WHERE role = 'RESELLER';
   
   -- Check messages exist
   SELECT COUNT(*) FROM messages WHERE sender_id = 4 AND receiver_id = 1;
   ```

4. **API Direct Test**
   ```bash
   node scripts/test-api.js
   ```

### Issue: Getting 401 Unauthorized
- Cookie token not being sent
- Check: Browser DevTools → Applications → Cookies → look for "token" cookie
- Try logging out and logging in again

### Issue: Getting 500 Internal Server Error
- Database connection issue
- Check `.env` file has correct DB credentials:
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=db_dashboard_nextjs
  JWT_SECRET=your-secret-key
  ```
- Make sure MySQL is running: `mysql -u root -p db_dashboard_nextjs`

## Expected User Data

### Admin Account
- **ID**: 1
- **Name**: Administrator  
- **Email**: admin@superadmin.com
- **Password**: admin123
- **Role**: ADMIN

### Sample Reseller
- **ID**: 4  
- **Name**: Ahmad Fauzi
- **Email**: fauzijra@gmail.com
- **Role**: RESELLER

### Test Messages
- **Count**: 13 messages from reseller to admin
- **Newest**: "Test message dari reseller ke admin" (unread)
- **Location**: messages table, sender_id=4, receiver_id=1

## Success Indicators
✅ Admin sidebar shows "Ahmad Fauzi" with RESELLER label
✅ Shows unread message count badge  
✅ Can click to open chat and see message history
✅ Can reply to reseller
✅ Console shows correct user data in API logs
