#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function insertTestMessages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_dashboard_nextjs'
  });

  try {
    console.log('🔍 Checking users...');
    
    // Get all users
    const [users] = await connection.execute(
      'SELECT id, name, email, role FROM users ORDER BY id'
    );
    console.log('Users:', users);

    // Find admin and reseller
    const admin = users.find(u => u.role.toUpperCase() === 'ADMIN');
    const reseller = users.find(u => u.role.toUpperCase() === 'RESELLER');

    console.log('\n📊 Found:');
    if (admin) {
      console.log(`✅ Admin: ID=${admin.id}, name="${admin.name}", email="${admin.email}"`);
    } else {
      console.log('❌ No admin found');
    }

    if (reseller) {
      console.log(`✅ Reseller: ID=${reseller.id}, name="${reseller.name}", email="${reseller.email}"`);
    } else {
      console.log('❌ No reseller found');
    }

    if (!admin || !reseller) {
      console.log('\n⚠️  Cannot insert test messages - missing admin or reseller');
      return;
    }

    // Check existing messages
    console.log('\n📬 Checking existing messages...');
    const [messages] = await connection.execute(
      `SELECT COUNT(*) as count FROM messages 
       WHERE sender_id = ? AND receiver_id = ?`,
      [reseller.id, admin.id]
    );
    console.log(`Messages from reseller to admin: ${messages[0].count}`);

    // Insert test messages if none exist
    if (messages[0].count === 0) {
      console.log('\n📤 Inserting test messages...');
      
      const testMessages = [
        `Halo Admin, saya membutuhkan bantuan dengan akun saya`,
        `Apakah ada promo untuk game ML hari ini?`,
        `Berapa harga topup untuk 100 diamond?`
      ];

      for (let i = 0; i < testMessages.length; i++) {
        await connection.execute(
          `INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
           VALUES (?, ?, ?, FALSE, DATE_SUB(NOW(), INTERVAL ? MINUTE))`,
          [reseller.id, admin.id, testMessages[i], (testMessages.length - i) * 5]
        );
        console.log(`✅ Message ${i + 1} inserted`);
      }

      // Also insert one message from admin to reseller
      await connection.execute(
        `INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
         VALUES (?, ?, ?, TRUE, DATE_SUB(NOW(), INTERVAL 2 MINUTE))`,
        [admin.id, reseller.id, 'Halo, terima kasih telah menghubungi kami!']
      );
      console.log('✅ Reply message from admin inserted');
    }

    // Verify messages
    console.log('\n✅ Final messages check:');
    const [finalMessages] = await connection.execute(
      `SELECT 
        m.id,
        m.sender_id,
        CONCAT(s.name, ' (', s.role, ')') as from_user,
        m.receiver_id,
        CONCAT(r.name, ' (', r.role, ')') as to_user,
        m.message,
        m.created_at,
        m.is_read
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at DESC`,
      [reseller.id, admin.id, admin.id, reseller.id]
    );

    console.table(finalMessages);

    console.log('\n✅ Test data setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Login as admin@superadmin.com');
    console.log('2. Go to Dashboard > Chat');
    console.log('3. You should see "Sample Reseller" in the sidebar');
    console.log('4. Click to open chat and see messages');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

insertTestMessages();
