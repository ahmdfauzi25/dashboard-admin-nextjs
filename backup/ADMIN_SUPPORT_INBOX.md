# Admin Support Inbox - Update Documentation

## Database Changes

### 1. Create support_replies table
Run this SQL in phpMyAdmin:

```sql
CREATE TABLE IF NOT EXISTS support_replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  admin_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ticket (ticket_id),
  INDEX idx_admin (admin_id)
);
```

### 2. Add admin_response column (optional)
```sql
ALTER TABLE support_tickets 
ADD COLUMN admin_response TEXT NULL AFTER message;
```

## Features Overview

### For ADMIN Users
✅ **Inbox View**
- List of all support tickets from all users
- Organized inbox with ticket preview
- Status and priority badges
- Click to view full ticket details

✅ **Ticket Detail View**
- Full ticket information
- User details (name, email)
- Original message
- All replies history
- Status badges and priority tags

✅ **Reply System**
- Reply to tickets directly
- All replies are tracked and timestamped
- Admin name shown on replies
- Real-time updates

✅ **Status Management**
- Mark as "In Progress"
- Mark as "Resolved"
- Close ticket
- One-click status updates

### For REGULAR Users (Reseller, etc)
✅ Original support form view
✅ Submit tickets
✅ View their own ticket history
✅ Cannot see other users' tickets

## API Endpoints

### GET /api/support
- Admin: Get ALL tickets
- Users: Get only THEIR tickets

### POST /api/support
- Create new ticket
- Anyone can submit

### GET /api/support/[id]
- Get ticket details with replies
- Admin: Can view any ticket
- Users: Can only view their own tickets

### PUT /api/support/[id]
- Update ticket status
- Add reply to ticket
- Admin only

## User Interface

### Admin Inbox Layout
```
┌─────────────────────────────────────────────────────────┐
│ Support Inbox                                           │
├──────────────┬──────────────────────────────────────────┤
│ Ticket List  │ Ticket Detail                            │
│ (Sidebar)    │                                          │
│              │ ┌─ Header ──────────────────────────┐   │
│ • Ticket #1  │ │ Subject: Issue with...            │   │
│   [OPEN]     │ │ From: John Doe                    │   │
│   [HIGH]     │ │ Status: Open | Priority: High     │   │
│              │ │ [Mark In Progress][Resolved][Close]│   │
│ • Ticket #2  │ └──────────────────────────────────┘   │
│   [RESOLVED] │                                          │
│   [MEDIUM]   │ ┌─ Messages ────────────────────────┐   │
│              │ │ [Original Message from User]       │   │
│ • Ticket #3  │ │                                    │   │
│   [CLOSED]   │ │ [Admin Reply 1]                   │   │
│   [LOW]      │ │                                    │   │
│              │ │ [Admin Reply 2]                   │   │
│              │ └──────────────────────────────────┘   │
│              │                                          │
│              │ ┌─ Reply Form ──────────────────────┐   │
│              │ │ [Type your reply...]              │   │
│              │ │ [Send Reply]                      │   │
│              │ └──────────────────────────────────┘   │
└──────────────┴──────────────────────────────────────────┘
```

## Setup Instructions

1. **Stop the dev server** (Ctrl+C)

2. **Run SQL scripts** in phpMyAdmin:
   - Execute `support_replies_table.sql`

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

4. **Login as ADMIN**

5. **Navigate to** `/dashboard/support`

6. **You will see**:
   - Inbox style layout (left sidebar + detail view)
   - List of all tickets
   - Click any ticket to view and reply

## Workflow Example

### Admin receives ticket:
1. User submits ticket → Status: **OPEN**
2. Admin sees ticket in inbox
3. Admin clicks ticket to read
4. Admin clicks "Mark In Progress" → Status: **IN_PROGRESS**
5. Admin types reply and clicks "Send Reply"
6. Admin clicks "Mark Resolved" → Status: **RESOLVED**

### Status Flow:
```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
  ↓         ↓           ↓
  └─────────┴───────────┴→ Can jump to any status
```

## Color Coding

### Status Colors:
- **OPEN**: Blue
- **IN_PROGRESS**: Yellow
- **RESOLVED**: Green
- **CLOSED**: Gray

### Priority Colors:
- **URGENT**: Red
- **HIGH**: Orange
- **MEDIUM**: Yellow
- **LOW**: Green

## Testing

### As Admin:
1. Login as admin
2. Go to Support page
3. Should see inbox layout
4. Click any ticket
5. View full details
6. Type reply and send
7. Change status

### As User:
1. Login as reseller/user
2. Go to Support page
3. Should see form (not inbox)
4. Submit ticket
5. View ticket history below

## File Structure
```
src/
├── app/
│   ├── api/
│   │   └── support/
│   │       ├── route.js (GET all, POST new)
│   │       └── [id]/
│   │           └── route.js (GET detail, PUT update/reply)
│   └── dashboard/
│       └── support/
│           └── page.js (Conditional view: Admin Inbox or User Form)
└── ...
```

## Future Enhancements

- [ ] Email notifications when admin replies
- [ ] File attachments in replies
- [ ] Ticket assignment to specific admins
- [ ] Search and filter tickets
- [ ] Ticket priority escalation
- [ ] Response time tracking
- [ ] User satisfaction rating
- [ ] Canned responses/templates
- [ ] Ticket categories/tags
