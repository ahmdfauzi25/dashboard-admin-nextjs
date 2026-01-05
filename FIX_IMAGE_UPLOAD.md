# Fix Image Upload Issue

## Problem
The `image_url` column in the `messages` table was defined as `VARCHAR(500)`, which is too small to store base64-encoded images. Base64 images can be tens of thousands of characters long.

## Solution
Run the SQL script to change the column type to `LONGTEXT`:

### Steps:

1. **Open XAMPP Control Panel**
2. **Start MySQL** (if not already running)
3. **Open phpMyAdmin** (http://localhost/phpmyadmin)
4. **Select your database** (e.g., `dashboard_db`)
5. **Click SQL tab**
6. **Run this SQL command:**

```sql
ALTER TABLE messages 
MODIFY COLUMN image_url LONGTEXT;
```

7. **Verify the change:**
```sql
DESCRIBE messages;
```

You should see `image_url` type changed from `varchar(500)` to `longtext`.

## Alternative: Command Line

```bash
cd "D:\POC Code\Dashboard\dashboard-nextjs"
mysql -u root -p dashboard_db < fix_image_url_column.sql
```

## Testing

After running the SQL:
1. Restart the Next.js dev server
2. Try uploading an image in the chat
3. Check browser console for logs:
   - Image base64 length
   - Insert success
   - Retrieved message data
4. Verify the image appears in the chat

## Console Logs to Check

### Frontend (Browser Console):
- `Image base64 length:` - Should show large number (e.g., 50000+)
- `Sending message with image:` - Shows payload info
- `Message response:` - API response
- `Received message data:` - Shows has_image and image_url_length

### Backend (Terminal/VS Code):
- `Received message data:` - Shows what API received
- `Inserting to database:` - Shows what's being inserted
- `Insert result:` - Shows insert ID
- `Retrieved message:` - Shows message retrieved from DB

## Expected Behavior

✅ Images upload successfully
✅ Images display in chat
✅ Images can be clicked to view full size
✅ Images can be downloaded
✅ Base64 string is stored completely in database

## Troubleshooting

### Issue: Image still not showing
1. Check console logs for errors
2. Verify SQL was executed: `DESCRIBE messages;`
3. Check if `image_url` field in database contains data
4. Clear browser cache
5. Restart dev server

### Issue: "Payload too large"
- Next.js has default body size limit of 1MB
- If needed, add to `next.config.js`:
```js
api: {
  bodyParser: {
    sizeLimit: '10mb',
  },
}
```

### Issue: Database connection error
- Verify XAMPP MySQL is running
- Check `.env.local` database credentials
- Test connection with scripts/test-api.js
