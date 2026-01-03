# 🧪 Quick Test Guide - Live Chat System

## ⚡ 5-Minute Quick Start

### Step 1: Ensure App is Running (Terminal 1)
```bash
cd "d:\POC Code\Dashboard\dashboard-nextjs"
npm run dev
```
Wait for: `ready - started server on 0.0.0.0:3000`

### Step 2: Run Diagnostics (Terminal 2)
```bash
cd "d:\POC Code\Dashboard\dashboard-nextjs"
node scripts/diagnose-chat.js
```
Expected output: ✨ All checks passed!

### Step 3: Test in Browser
1. Open: `http://localhost:3000/login`
2. Enter credentials:
   - Email: `admin@superadmin.com`
   - Password: `admin123`
3. Click Login
4. Click "Dashboard" in header
5. Click "Chat" in sidebar
6. Expected result: See "Ahmad Fauzi" in user list

---

## 🎬 Complete Chat Flow Test

### Admin Viewing Messages from Reseller

**Setup**:
- Admin logged in
- On Dashboard > Chat page
- Browser DevTools open (F12)

**Expected Behavior**:

1. **Page Load**
   ```
   Console shows: "Current User ID: 1"
   Console shows: "Current User Role: ADMIN"
   Sidebar shows: "Ahmad Fauzi (RESELLER)" with avatar
   ```

2. **Click on Reseller**
   ```
   Chat area shows: Message history
   All messages from "Ahmad Fauzi" visible
   Each message shows timestamp
   ```

3. **Send Reply**
   ```
   Type message in input box
   Click Send button
   Message appears in chat
   Marked as sent successfully
   ```

---

## 🧬 Component Testing Checklist

### API Endpoints
- [ ] `/api/login` - Returns token in Set-Cookie header
- [ ] `/api/me` - Returns current user data
- [ ] `/api/messages/users` - Returns list of chat users
- [ ] `/api/messages?user_id=X` - Returns message history
- [ ] `/api/messages` (POST) - Sends new message

### Frontend Components  
- [ ] Login page loads
- [ ] Dashboard accessible after login
- [ ] Chat page renders
- [ ] Sidebar shows user list
- [ ] Chat area shows message history
- [ ] Input form sends messages
- [ ] Dark mode toggle works
- [ ] Avatars display correctly

### Database
- [ ] Messages table has data
- [ ] Users table has admin and resellers
- [ ] Foreign key constraints intact
- [ ] Message sorting works (newest first)

---

## 🔧 Common Issues & Solutions

### Issue: "No users available" in sidebar

**Check**:
```bash
# Run diagnostics
node scripts/diagnose-chat.js

# Check console logs in browser (F12 > Console)
# Look for: "Found users: X"
```

**Fix**:
```bash
# Restart app
npm run dev

# Or refresh page in browser
```

---

### Issue: "Unauthorized" or login fails

**Check**:
```bash
# Verify admin exists
node scripts/create-admin-account.js

# Check .env has JWT_SECRET
```

**Fix**:
```bash
# Clear browser cookies
# Try logging in again
```

---

### Issue: Messages not appearing

**Check**:
```bash
# Verify messages exist in DB
node scripts/insert-test-messages.js

# Check Network tab (F12 > Network)
# Look for `/api/messages` response
```

**Fix**:
```bash
# Hard refresh browser (Ctrl+Shift+R)
# Ensure both users exist
node scripts/diagnose-chat.js
```

---

## 📊 Test Data Reference

### Admin Account
```
Email: admin@superadmin.com
Password: admin123
Role: ADMIN
```

### Reseller Account (Primary)
```
Email: fauzijra@gmail.com
Password: reseller123
Name: Ahmad Fauzi
Role: RESELLER
```

### Reseller Account (Secondary)
```
Email: reseller@dashboard.com
Password: reseller123
Name: Sample Reseller
Role: RESELLER
```

### Test Messages
```
Count: 13 messages
From: Ahmad Fauzi (ID=4)
To: Administrator (ID=1)
Unread: 5
```

---

## 📋 Manual Test Scenarios

### Scenario 1: Admin Views Messages
```
1. Login as admin
2. Navigate to Chat
3. Click "Ahmad Fauzi"
4. Verify 13 messages visible
5. Check last message: "Test message dari reseller ke admin"
```
Expected: ✅ Success

### Scenario 2: Admin Sends Reply
```
1. In chat with reseller
2. Type: "Terima kasih atas pesannya"
3. Click Send
4. Verify message appears in chat
5. Run: node scripts/diagnose-chat.js
6. Check message count increased to 14
```
Expected: ✅ Success

### Scenario 3: Reseller Sends Message
```
1. Logout from admin
2. Login as reseller
3. Navigate to Chat
4. Click "Administrator"
5. Type message
6. Click Send
7. Verify message sent
```
Expected: ✅ Success

### Scenario 4: Role-Based Filtering
```
1. Logout from admin
2. Login as reseller
3. Go to Chat
4. Check sidebar shows only "Administrator"
5. Does NOT show other resellers
```
Expected: ✅ Success

---

## 🎯 Success Criteria

All tests pass when:
- ✅ Admin can login
- ✅ Chat page loads without errors
- ✅ Sidebar shows resellers
- ✅ Click reseller opens conversation
- ✅ Message history displays
- ✅ Can send new messages
- ✅ Messages persist in database
- ✅ No JavaScript errors in console
- ✅ No database errors in terminal
- ✅ Network requests return 200 OK

---

## 🚨 Emergency Debug

If everything fails, run these in order:

```bash
# 1. Full system check
node scripts/diagnose-chat.js

# 2. Recreate database
mysql -u root db_dashboard_nextjs < create_messages_table.sql

# 3. Recreate test data
node scripts/create-admin-account.js
node scripts/insert-test-messages.js

# 4. Restart app
npm run dev

# 5. Clear browser cache
# Ctrl+Shift+Delete in browser
```

---

## 📞 Still Having Issues?

Check these files for detailed information:
- `CHAT_SYSTEM_FIXED.md` - Overview of all fixes
- `CHAT_DEBUG_GUIDE.md` - Detailed debugging steps  
- `CHAT_IMPLEMENTATION_COMPLETE.md` - Implementation details

Last updated: January 3, 2025
Status: ✅ Ready for testing
