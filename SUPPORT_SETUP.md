# Setup Support & Contact Feature

## 1. Create Database Table

### Option A: Using phpMyAdmin
1. Open **phpMyAdmin** (http://localhost/phpmyadmin)
2. Select your database (`dashboard_db`)
3. Click **SQL** tab
4. Copy and paste the following SQL:

```sql
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);
```

5. Click **Go**

### Option B: Using MySQL Command Line
```bash
# Navigate to XAMPP MySQL bin folder
cd C:\xampp\mysql\bin

# Run MySQL
.\mysql.exe -u root -p

# Enter password if you have one, otherwise just press Enter
# Select database
USE dashboard_db;

# Run the SQL
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

# Verify table created
DESCRIBE support_tickets;
```

## 2. Features

### User Features
✅ Submit support tickets with:
  - Name (auto-filled from user profile)
  - Email (auto-filled from user profile)
  - Subject
  - Message
  - Priority (Low, Medium, High, Urgent)

✅ View ticket history with:
  - Ticket status (Open, In Progress, Resolved, Closed)
  - Priority badges
  - Submission date
  - Ticket ID

✅ Contact information display
✅ Tips for faster response

### Admin Features
✅ View all tickets from all users
✅ Filter by status
✅ Priority indicators

### Database Fields
- `id`: Auto-increment primary key
- `user_id`: Foreign key to users table
- `name`: User's name
- `email`: User's email
- `subject`: Ticket subject
- `message`: Detailed message
- `status`: open | in_progress | resolved | closed
- `priority`: low | medium | high | urgent
- `created_at`: Submission timestamp
- `updated_at`: Last update timestamp
- `resolved_at`: Resolution timestamp

## 3. API Endpoints

### GET /api/support
Fetch support tickets
- **Admin**: Returns all tickets from all users
- **Users**: Returns only their own tickets
- **Response**: Array of ticket objects

### POST /api/support
Create new support ticket
- **Body**: { name, email, subject, message, priority }
- **Validation**: Email format, required fields
- **Response**: Created ticket object

## 4. Access the Page

Navigate to: `/dashboard/support`

Or click "Support" in the sidebar under "SUPPORT" section.

## 5. Testing

1. Login as a user (reseller or admin)
2. Navigate to Support page
3. Fill out the form:
   - Name and email should auto-fill
   - Enter a subject
   - Write a message
   - Select priority
4. Click "Submit Ticket"
5. Check "Your Tickets" section below
6. Verify ticket appears with status badge

## 6. Status Colors

- **Open**: Blue badge
- **In Progress**: Yellow badge
- **Resolved**: Green badge
- **Closed**: Gray badge

## 7. Priority Colors

- **Urgent**: Red badge
- **High**: Orange badge
- **Medium**: Yellow badge
- **Low**: Green badge

## 8. Troubleshooting

### Table creation fails
- Check if users table exists (foreign key constraint)
- Verify database connection
- Check user permissions

### Form submission fails
- Check browser console for errors
- Verify API endpoint is accessible
- Check authentication token
- Verify database connection

### Tickets not showing
- Check if user is logged in
- Verify user_id in database matches logged-in user
- Check API response in Network tab

## 9. Future Enhancements

- [ ] Admin dashboard to manage tickets
- [ ] Email notifications when ticket created
- [ ] Reply/comment system
- [ ] File attachments
- [ ] Status update notifications
- [ ] Ticket assignment to support agents
- [ ] Priority-based sorting
- [ ] Search and filter tickets
- [ ] Export tickets to CSV
