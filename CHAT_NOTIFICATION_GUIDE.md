# Chat Notification System Documentation

## Overview
Sistem notifikasi real-time untuk pesan chat yang ditampilkan di navbar. Notifikasi akan muncul ketika ada pesan masuk yang belum dibaca, dan user dapat langsung membuka chat dengan mengklik notifikasi.

## Features
✅ Real-time notification polling (setiap 5 detik)
✅ Badge counter menampilkan jumlah unread messages
✅ Avatar dan preview pesan di notifikasi
✅ Click notifikasi untuk langsung buka chat
✅ Auto-mark messages as read ketika chat dibuka
✅ Support dark mode
✅ Responsive design

## Files Modified

### 1. API Endpoint: `/src/app/api/messages/unread/route.js`
**Purpose:** Mendapatkan daftar pesan yang belum dibaca beserta total count

**Endpoint:** `GET /api/messages/unread`

**Response:**
```json
{
  "success": true,
  "totalUnread": 5,
  "messages": [
    {
      "sender_id": 2,
      "sender_name": "John Doe",
      "avatarBase64": "base64string...",
      "unread_count": 3,
      "last_message_time": "2024-01-15T10:30:00.000Z",
      "last_message": "Hello, ada update produk baru?"
    }
  ]
}
```

**Features:**
- Role-based filtering (Admin sees resellers, Reseller sees admin)
- Groups unread messages by sender
- Returns count per sender and total count
- Includes avatar (converted to base64)
- Shows latest message and timestamp

### 2. Dashboard Layout: `/src/components/Layout/DashboardLayout.js`
**Changes:**
- Added `unreadCount` state for badge counter
- Added polling useEffect untuk fetch unread messages setiap 5 detik
- Updated notification icon badge dengan counter angka
- Enhanced notification dropdown dengan:
  - Avatar display
  - Message preview (line-clamp-2)
  - Badge untuk multiple messages dari satu user
  - Timestamp
  - Click handler untuk navigate ke chat

**Polling Logic:**
```javascript
useEffect(() => {
  const fetchUnreadMessages = async () => {
    const response = await fetch('/api/messages/unread')
    const data = await response.json()
    
    setUnreadCount(data.totalUnread || 0)
    setNotifications(data.messages.map(msg => ({
      id: `msg-${msg.sender_id}-${Date.now()}`,
      type: 'message',
      sender_id: msg.sender_id,
      sender_name: msg.sender_name,
      avatarBase64: msg.avatarBase64,
      message: msg.last_message,
      unread_count: msg.unread_count,
      time: msg.last_message_time
    })))
  }

  fetchUnreadMessages()
  const interval = setInterval(fetchUnreadMessages, 5000)
  return () => clearInterval(interval)
}, [])
```

### 3. Chat Page: `/src/app/dashboard/chat/page.js`
**Changes:**
- Added `useSearchParams` from 'next/navigation'
- Added useEffect untuk handle URL parameter `?user=X`
- Auto-select user ketika URL memiliki parameter user

**URL Parameter Support:**
```javascript
// When notification clicked:
router.push(`/dashboard/chat?user=${notif.sender_id}`)

// Chat page will auto-select that user:
useEffect(() => {
  const userId = searchParams.get('user')
  if (userId && users.length > 0) {
    const user = users.find(u => u.id === parseInt(userId))
    if (user) {
      setSelectedUser(user)
    }
  }
}, [searchParams, users])
```

## User Flow

### 1. Receiving Notification
1. User A mengirim pesan ke User B
2. Setiap 5 detik, DashboardLayout polling `/api/messages/unread`
3. Jika ada unread messages:
   - Badge counter muncul di bell icon
   - Notification list updated dengan preview pesan

### 2. Viewing Notification
1. User B klik bell icon
2. Dropdown menampilkan list notifikasi dengan:
   - Avatar pengirim
   - Nama pengirim
   - Preview pesan (max 2 lines)
   - Badge jika ada multiple unread messages
   - Timestamp

### 3. Opening Chat
1. User B klik salah satu notifikasi
2. Router navigate ke `/dashboard/chat?user={sender_id}`
3. Chat page auto-select user tersebut
4. Messages API mark pesan as read
5. Notification hilang dari list (dalam 5 detik setelah polling berikutnya)

## Database Schema
Messages table sudah memiliki field `is_read` untuk tracking:
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  has_image BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

## Styling

### Badge Counter
- Red background (`bg-red-500`)
- White text
- Positioned absolute top-right of bell icon
- Shows "99+" for counts > 99
- Font size: text-xs
- Bold font weight

### Notification Dropdown
- Width: 320px (w-80)
- Max height: 384px (max-h-96) with scroll
- Shadow-lg untuk depth
- Border radius: rounded-lg
- Dark mode support

### Notification Item
- Flex layout dengan avatar + content
- Avatar: 40x40 (h-10 w-10)
- Message preview dengan line-clamp-2
- Hover effect untuk interactivity
- Badge untuk multiple messages

## Testing Checklist

### Functional Testing
- [ ] Badge counter muncul ketika ada unread messages
- [ ] Badge counter menampilkan angka yang benar
- [ ] Notification dropdown menampilkan list pesan
- [ ] Avatar ditampilkan dengan benar (atau initial jika tidak ada)
- [ ] Preview pesan tampil maksimal 2 baris
- [ ] Timestamp formatted dengan benar
- [ ] Klik notifikasi membuka chat dengan user yang benar
- [ ] Messages di-mark as read setelah buka chat
- [ ] Notification hilang setelah messages dibaca
- [ ] Polling berjalan setiap 5 detik

### Visual Testing
- [ ] Badge positioning benar di bell icon
- [ ] Dropdown alignment benar (right-aligned)
- [ ] Avatar tidak distorted
- [ ] Text tidak overflow
- [ ] Dark mode styling benar
- [ ] Responsive di mobile

### Role-based Testing
- [ ] Admin hanya melihat notifikasi dari RESELLER
- [ ] Reseller hanya melihat notifikasi dari ADMIN
- [ ] Badge count benar untuk masing-masing role

## Performance Considerations

### Polling Interval
- Current: 5 seconds
- Dapat disesuaikan berdasarkan kebutuhan
- Trade-off: Lebih cepat = lebih real-time tapi lebih banyak request

### Optimization Tips
1. **Debouncing**: Jika user membuka chat, bisa temporary stop polling
2. **WebSocket**: Untuk production, pertimbangkan WebSocket untuk real-time tanpa polling
3. **Caching**: Cache unread count di localStorage untuk reduce initial load
4. **Lazy Loading**: Load avatar only when dropdown opened

## Future Enhancements

### Phase 2
- [ ] Sound notification ketika pesan masuk
- [ ] Desktop notification (browser notification API)
- [ ] Mark as read tanpa buka chat
- [ ] Filter notifikasi (All / Unread)
- [ ] Notification settings (enable/disable)

### Phase 3
- [ ] WebSocket implementation untuk real-time
- [ ] Push notifications (PWA)
- [ ] Group notifications by time (Today, Yesterday, etc.)
- [ ] Rich notification (emoji support, mentions, etc.)

## Troubleshooting

### Badge tidak muncul
- Check API `/api/messages/unread` response
- Verify `is_read` field di database
- Check console untuk fetch errors

### Notification tidak update
- Verify polling interval running (check network tab)
- Check useEffect dependencies
- Verify token masih valid

### Chat tidak auto-select ketika klik notifikasi
- Check URL parameter passed correctly
- Verify useSearchParams working
- Check users array loaded before selection

### Dark mode styling broken
- Verify all Tailwind classes have dark mode variants
- Check isDarkMode context value
- Inspect computed styles

## API Flow Diagram
```
User A sends message
       ↓
Database: is_read = FALSE
       ↓
User B Dashboard polling (every 5s)
       ↓
GET /api/messages/unread
       ↓
Returns unread messages grouped by sender
       ↓
Update badge counter & notification list
       ↓
User B clicks notification
       ↓
Navigate to /dashboard/chat?user=X
       ↓
GET /api/messages?user_id=X
       ↓
Mark messages as read (is_read = TRUE)
       ↓
Next polling: unread count decreases
```

## Conclusion
Sistem notifikasi chat telah berhasil diimplementasikan dengan:
- ✅ Real-time polling setiap 5 detik
- ✅ Badge counter yang akurat
- ✅ UI yang clean dan responsive
- ✅ Dark mode support
- ✅ Role-based filtering
- ✅ Click-to-chat functionality

Sistem ini siap untuk production dan dapat di-enhance lebih lanjut dengan WebSocket atau Push Notifications di masa depan.
